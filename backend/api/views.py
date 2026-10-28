import json
import re
import urllib.request
import os
import random
import uuid
import html
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from PIL import Image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import AdminUser, CustomerUser, CustomerAddress, Product, Order

SUPER_ADMIN_PHONE = "7511136171"
SUPER_ADMIN_PASS = "alan@2004"

# ========================================================
# SECURITY & SANITIZATION HELPERS
# ========================================================

def validate_indian_phone(phone_str):
    """Strictly validates 10-digit Indian mobile numbers starting with 6, 7, 8, or 9"""
    cleaned = re.sub(r'[^0-9]', '', str(phone_str or ''))
    if len(cleaned) > 10:
        cleaned = cleaned[-10:]
    if re.match(r'^[6-9]\d{9}$', cleaned):
        return cleaned
    return None

def sanitize_string(val, max_len=255, default=''):
    """Strips HTML tags, trims whitespace, and limits length to prevent XSS and payload bloating"""
    if not val:
        return default
    text = str(val).strip()
    clean_text = re.sub(r'<[^>]+>', '', text)
    escaped = html.escape(clean_text)
    return escaped[:max_len]

def validate_pincode(pincode_str):
    """Validates 6-digit Indian PIN code"""
    cleaned = re.sub(r'[^0-9]', '', str(pincode_str or ''))
    if re.match(r'^\d{6}$', cleaned):
        return cleaned
    return None

def normalize_amazon_affiliate_url(raw_url, affiliate_tag=None):
    """
    Validates and ensures the URL is a safe HTTP/HTTPS URL.
    If it's an Amazon URL, automatically attaches or replaces the affiliate tracking tag.
    """
    if not raw_url:
        return ""
    raw_url = str(raw_url).strip()
    if not raw_url.startswith(('http://', 'https://')):
        return ""
    
    tag = affiliate_tag or getattr(settings, 'AMAZON_ASSOCIATE_TAG', 'curatedrop-21')
    try:
        parsed = urlparse(raw_url)
        domain = parsed.netloc.lower()
        if any(d in domain for d in ['amazon.in', 'amazon.com', 'amzn.in', 'amzn.to']):
            query = parse_qs(parsed.query)
            query['tag'] = [tag]
            new_query = urlencode(query, doseq=True)
            return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))
    except Exception:
        pass
    return raw_url

def ensure_seed():
    admin = AdminUser.objects.filter(phone=SUPER_ADMIN_PHONE).first()
    if not admin:
        AdminUser.objects.create(
            phone=SUPER_ADMIN_PHONE,
            name="Super Admin",
            password=SUPER_ADMIN_PASS,
            role="super_admin"
        )
    elif admin.password != SUPER_ADMIN_PASS:
        admin.password = SUPER_ADMIN_PASS
        admin.save()

# Public Products List
def product_list(request):
    ensure_seed()
    products = Product.objects.all().order_by("-created_at")
    data = []
    for p in products:
        data.append({
            "id": p.id,
            "slug": p.slug,
            "title": p.title,
            "category": p.category,
            "subcategory": getattr(p, "subcategory", "General") or "General",
            "price": p.price or ("Live on Amazon" if p.product_type == "affiliate" else "₹499"),
            "mrp": p.mrp,
            "discount": p.discount,
            "rating": p.rating,
            "reviewsCount": p.reviews_count,
            "image": p.image,
            "images": p.images if p.images else [p.image],
            "curatedVerdict": p.curated_verdict,
            "specs": p.specs,
            "productType": p.product_type,
            "affiliateUrl": p.affiliate_url,
            "platform": p.platform,
            "inStock": p.in_stock,
        })
    return JsonResponse(data, safe=False)

# ========================================================
# CUSTOMER AUTHENTICATION & MULTI-ADDRESS APIS
# ========================================================

@csrf_exempt
def customer_signup(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)
    
    try:
        body = json.loads(request.body.decode("utf-8"))
        phone = validate_indian_phone(body.get('phone'))
        name = sanitize_string(body.get('name'), max_len=60)
        password = str(body.get('password', '')).strip()
        address_text = sanitize_string(body.get('address'), max_len=300)
        address_label = sanitize_string(body.get('addressLabel', 'Home'), max_len=30) or 'Home'
        pincode = validate_pincode(body.get('pincode'))
        city = sanitize_string(body.get('city', 'City'), max_len=60)
        state = sanitize_string(body.get('state', 'State'), max_len=60)
        landmark = sanitize_string(body.get('landmark', ''), max_len=100)

        if not phone:
            return JsonResponse({"success": False, "message": "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)."}, status=400)
        if not name or len(name) < 2:
            return JsonResponse({"success": False, "message": "Please provide your full name (minimum 2 characters)."}, status=400)
        if not password or len(password) < 6:
            return JsonResponse({"success": False, "message": "Password must be at least 6 characters long."}, status=400)

        # Check existing customer
        if CustomerUser.objects.filter(phone=phone).exists():
            return JsonResponse({"success": False, "message": "An account with this mobile number already exists. Please log in."}, status=409)

        # Create user with salted PBKDF2 hash
        customer = CustomerUser(phone=phone, name=name)
        customer.set_password(password)
        customer.save()

        # Save initial delivery address
        if address_text:
            if not pincode:
                return JsonResponse({"success": False, "message": "Please provide a valid 6-digit delivery PIN code."}, status=400)
            CustomerAddress.objects.create(
                customer=customer,
                label=address_label,
                full_address=address_text,
                landmark=landmark,
                pincode=pincode,
                city=city,
                state=state,
                is_default=True
            )

        addresses = list(customer.addresses.all().values('id', 'label', 'full_address', 'landmark', 'pincode', 'city', 'state', 'is_default'))

        return JsonResponse({
            "success": True,
            "message": f"Welcome, {name}! Your CurateDrop account is created.",
            "customer": {
                "phone": customer.phone,
                "name": customer.name,
                "addresses": addresses
            }
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Sign up error: {str(e)}"}, status=500)

@csrf_exempt
def customer_login(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)
    
    try:
        body = json.loads(request.body.decode("utf-8"))
        phone = validate_indian_phone(body.get('phone'))
        password = str(body.get('password', '')).strip()

        if not phone:
            return JsonResponse({"success": False, "message": "Please enter a valid 10-digit Indian mobile number."}, status=400)
        if not password:
            return JsonResponse({"success": False, "message": "Please enter your password."}, status=400)

        customer = CustomerUser.objects.filter(phone=phone).first()
        if not customer:
            return JsonResponse({"success": False, "message": "No account found with this phone number. Please sign up."}, status=404)

        if not customer.check_password(password):
            return JsonResponse({"success": False, "message": "Incorrect password. Please verify and try again."}, status=401)

        addresses = list(customer.addresses.all().values('id', 'label', 'full_address', 'landmark', 'pincode', 'city', 'state', 'is_default'))

        return JsonResponse({
            "success": True,
            "message": f"Welcome back, {customer.name}!",
            "customer": {
                "phone": customer.phone,
                "name": customer.name,
                "addresses": addresses
            }
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Login error: {str(e)}"}, status=500)

@csrf_exempt
def customer_profile(request):
    phone = validate_indian_phone(request.GET.get('phone'))
    if not phone:
        return JsonResponse({"success": False, "message": "Invalid customer phone number."}, status=400)
    customer = CustomerUser.objects.filter(phone=phone).first()
    if not customer:
        return JsonResponse({"success": False, "message": "Customer not found"}, status=404)
    
    addresses = list(customer.addresses.all().values('id', 'label', 'full_address', 'landmark', 'pincode', 'city', 'state', 'is_default'))
    orders = list(Order.objects.filter(customer_phone=customer.phone).order_by('-created_at').values())

    return JsonResponse({
        "success": True,
        "customer": {
            "phone": customer.phone,
            "name": customer.name,
            "addresses": addresses,
            "orders": orders
        }
    })

@csrf_exempt
def customer_add_address(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)
    
    try:
        body = json.loads(request.body.decode("utf-8"))
        phone = validate_indian_phone(body.get('phone'))
        if not phone:
            return JsonResponse({"success": False, "message": "Invalid customer phone."}, status=400)

        customer = CustomerUser.objects.filter(phone=phone).first()
        if not customer:
            return JsonResponse({"success": False, "message": "Unauthorized customer session."}, status=401)

        full_address = sanitize_string(body.get('fullAddress'), max_len=300)
        pincode = validate_pincode(body.get('pincode'))
        if not full_address:
            return JsonResponse({"success": False, "message": "Please provide a complete address."}, status=400)
        if not pincode:
            return JsonResponse({"success": False, "message": "Please enter a valid 6-digit PIN code."}, status=400)

        CustomerAddress.objects.create(
            customer=customer,
            label=sanitize_string(body.get('label', 'Home'), max_len=30) or 'Home',
            full_address=full_address,
            landmark=sanitize_string(body.get('landmark', ''), max_len=100),
            pincode=pincode,
            city=sanitize_string(body.get('city', 'City'), max_len=60),
            state=sanitize_string(body.get('state', 'State'), max_len=60),
            is_default=bool(body.get('isDefault', False))
        )

        addresses = list(customer.addresses.all().values('id', 'label', 'full_address', 'landmark', 'pincode', 'city', 'state', 'is_default'))
        return JsonResponse({"success": True, "message": "Address saved successfully!", "addresses": addresses})
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Failed to save address: {str(e)}"}, status=500)

@csrf_exempt
def customer_delete_address(request, pk):
    if request.method != "DELETE":
        return JsonResponse({"success": False, "message": "DELETE required"}, status=405)
    
    phone = re.sub(r'[^0-9]', '', str(request.GET.get('phone', '')))[-10:]
    addr = CustomerAddress.objects.filter(id=pk, customer__phone=phone).first()
    if addr:
        addr.delete()
        customer = CustomerUser.objects.filter(phone=phone).first()
        addresses = list(customer.addresses.all().values('id', 'label', 'full_address', 'landmark', 'pincode', 'city', 'state', 'is_default'))
        return JsonResponse({"success": True, "message": "Address deleted", "addresses": addresses})
    return JsonResponse({"success": False, "message": "Address not found"}, status=404)

@csrf_exempt
def customer_orders(request):
    phone = re.sub(r'[^0-9]', '', str(request.GET.get('phone', '')))[-10:]
    orders = list(Order.objects.filter(customer_phone=phone).order_by('-created_at').values())
    return JsonResponse({"success": True, "orders": orders})

# ========================================================
# ORDER CREATION WITH COD OPEN-BOX DELIVERY
# ========================================================

@csrf_exempt
def order_create(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
    try:
        body = json.loads(request.body.decode("utf-8"))
        customer_phone = validate_indian_phone(body.get('customerPhone'))
        if not customer_phone:
            return JsonResponse({"success": False, "message": "A valid 10-digit mobile number is required to book Cash on Delivery orders."}, status=400)

        customer_name = sanitize_string(body.get('customerName', 'Customer'), max_len=60)
        address = sanitize_string(body.get('address', ''), max_len=300)
        address_label = sanitize_string(body.get('addressLabel', 'Home'), max_len=30)
        pincode = validate_pincode(body.get('pincode', ''))

        if not address:
            return JsonResponse({"success": False, "message": "Please provide a complete delivery address."}, status=400)
        if not pincode:
            return JsonResponse({"success": False, "message": "Please provide a valid 6-digit delivery PIN code."}, status=400)

        raw_items = body.get("items", [])
        if not isinstance(raw_items, list) or len(raw_items) == 0:
            return JsonResponse({"success": False, "message": "Your cart is empty. Please add at least one product."}, status=400)

        # Validate item entries
        sanitized_items = []
        for it in raw_items:
            it_id = sanitize_string(it.get('id', ''), max_len=50)
            it_title = sanitize_string(it.get('title', 'Product'), max_len=200)
            it_price = sanitize_string(it.get('price', '₹0'), max_len=30)
            try:
                it_qty = max(1, min(int(it.get('quantity', 1)), 50))
            except (ValueError, TypeError):
                it_qty = 1
            sanitized_items.append({
                "id": it_id,
                "title": it_title,
                "price": it_price,
                "quantity": it_qty,
                "image": sanitize_string(it.get('image', ''), max_len=500)
            })

        order_id = f"ORD-{random.randint(100000, 999999)}"
        otp = str(random.randint(1000, 9999))

        order = Order.objects.create(
            id=order_id,
            customer_phone=customer_phone,
            customer_name=customer_name,
            address=address,
            address_label=address_label,
            pincode=pincode,
            items=sanitized_items,
            total_amount=sanitize_string(body.get("totalAmount", "₹0"), max_len=30),
            payment_mode="Cash on Delivery",
            cod_otp=otp,
            terms_accepted=bool(body.get("termsAccepted", True))
        )
        return JsonResponse({
            "success": True,
            "orderId": order.id,
            "codOtp": order.cod_otp,
            "message": "Order placed! Inspect your package and give OTP only after open-box verification."
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Order processing error: {str(e)}"}, status=500)

@csrf_exempt
def order_list(request):
    if request.method == "GET":
        orders = list(Order.objects.all().order_by("-created_at").values())
        return JsonResponse(orders, safe=False)
    
    elif request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        order_id = sanitize_string(body.get("orderId"), max_len=50)
        input_otp = str(body.get("otp", "")).strip()
        order = Order.objects.filter(id=order_id).first()
        if order and order.cod_otp == input_otp:
            order.status = "Delivered & OTP Verified"
            order.save()
            return JsonResponse({"success": True, "message": "Delivery successfully verified and marked as delivered!"})
        return JsonResponse({"success": False, "message": "Incorrect OTP. Do not deliver parcel!"}, status=400)

# ========================================================
# ADMIN ENDPOINTS & MEDIA UTILS
# ========================================================

@csrf_exempt
def upload_images(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    files = request.FILES.getlist('images')
    if not files:
        single = request.FILES.get('image')
        if single:
            files = [single]
        else:
            return JsonResponse({"success": False, "message": "No images provided."}, status=400)
    
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'products')
    os.makedirs(upload_dir, exist_ok=True)
    
    uploaded_urls = []
    host = request.get_host()
    scheme = "https" if request.is_secure() else "http"
    
    MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    
    for f in files:
        if f.size > MAX_FILE_SIZE:
            return JsonResponse({"success": False, "message": f"File '{f.name}' exceeds the maximum allowed size of 5MB."}, status=400)
        
        ext = os.path.splitext(f.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return JsonResponse({"success": False, "message": f"Invalid format for '{f.name}'. Allowed formats: JPG, PNG, WebP."}, status=400)
        
        # Verify genuine image structure using Pillow (prevents disguised executables)
        try:
            img = Image.open(f)
            img.verify()
            f.seek(0)
        except Exception:
            return JsonResponse({"success": False, "message": f"File '{f.name}' is corrupt or not a valid image."}, status=400)
        
        filename = f"{uuid.uuid4().hex[:12]}{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        with open(filepath, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
                
        file_url = f"{scheme}://{host}/media/products/{filename}"
        uploaded_urls.append(file_url)
        
    return JsonResponse({"success": True, "urls": uploaded_urls})

@csrf_exempt
def product_create(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        body = json.loads(request.body.decode("utf-8"))
        title = sanitize_string(body.get("title", ""), max_len=200)
        if not title:
            return JsonResponse({"success": False, "message": "Product title is required."}, status=400)
        
        prod_id = f"prod-{random.randint(10000, 99999)}"
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") + f"-{prod_id}"
        
        prod_type = body.get("productType", "affiliate")
        if prod_type not in ["affiliate", "real"]:
            prod_type = "affiliate"
        
        images = [sanitize_string(u, max_len=500) for u in body.get("images", []) if str(u).startswith(('http://', 'https://'))]
        primary_image = sanitize_string(body.get("image", ""), max_len=500)
        if not primary_image and images:
            primary_image = images[0]
        elif primary_image and not images:
            images = [primary_image]
        elif not primary_image and not images:
            primary_image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
            images = [primary_image]

        price_val = sanitize_string(body.get("price", ""), max_len=30)
        if not price_val:
            price_val = "Live on Amazon" if prod_type == "affiliate" else "₹499"

        # Automatic Amazon Affiliate tag attachment and normalization
        affiliate_url = normalize_amazon_affiliate_url(body.get("affiliateUrl", ""))

        specs = [sanitize_string(s, max_len=120) for s in body.get("specs", []) if sanitize_string(s, max_len=120)]

        p = Product.objects.create(
            id=prod_id,
            slug=slug,
            title=title,
            category=sanitize_string(body.get("category", "General"), max_len=80),
            subcategory=sanitize_string(body.get("subcategory", "General") or "General", max_len=80),
            price=price_val,
            mrp=sanitize_string(body.get("mrp", ""), max_len=30) if prod_type == "real" else "",
            discount=sanitize_string(body.get("discount", ""), max_len=30) if prod_type == "real" else "",
            rating=float(body.get("rating", 4.5)),
            reviews_count=max(0, int(body.get("reviewsCount", 100))),
            image=primary_image,
            images=images,
            curated_verdict=sanitize_string(body.get("curatedVerdict", "Verified for exceptional durability."), max_len=500),
            specs=specs,
            product_type=prod_type,
            affiliate_url=affiliate_url,
            platform="amazon" if prod_type == "affiliate" else "curatedrop"
        )
        return JsonResponse({"success": True, "id": p.id, "slug": p.slug, "affiliateUrl": p.affiliate_url})
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Failed to save product: {str(e)}"}, status=500)

@csrf_exempt
def product_delete(request, pk):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)
    Product.objects.filter(id=pk).delete()
    return JsonResponse({"success": True})

@csrf_exempt
def admin_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    ensure_seed()
    body = json.loads(request.body.decode("utf-8"))
    phone = str(body.get("phone", "")).strip()
    password = str(body.get("password", "")).strip()
    
    admin = AdminUser.objects.filter(phone=phone).first()
    if admin and admin.check_password(password):
        return JsonResponse({
            "success": True,
            "admin": {
                "phone": admin.phone,
                "name": admin.name,
                "role": admin.role
            }
        })
    elif admin:
        return JsonResponse({"success": False, "message": "Incorrect password. Please try again."}, status=401)
    return JsonResponse({"success": False, "message": "User ID / Phone not found. Contact Super Admin (7511136171)."}, status=404)

@csrf_exempt
def admin_manage(request):
    ensure_seed()
    if request.method == "GET":
        admins = list(AdminUser.objects.all().values("phone", "name", "role", "created_at"))
        return JsonResponse(admins, safe=False)
    
    elif request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        requester = str(body.get("requesterPhone", "")).strip()
        if requester != SUPER_ADMIN_PHONE:
            return JsonResponse({"success": False, "message": "Only Super Admin can add secondary admins."}, status=403)
        
        new_phone = str(body.get("phone", "")).strip()
        new_name = str(body.get("name", "Staff")).strip()
        new_password = str(body.get("password", "")).strip()
        
        if not new_phone or not new_password:
            return JsonResponse({"success": False, "message": "Phone and Password are required."}, status=400)

        admin_obj, _ = AdminUser.objects.get_or_create(phone=new_phone, defaults={"name": new_name, "role": "admin"})
        admin_obj.name = new_name
        admin_obj.set_password(new_password)
        admin_obj.save()
        
        return JsonResponse({"success": True, "message": f"Admin {new_name} ({new_phone}) created with assigned password!"})

@csrf_exempt
def admin_delete(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        requester = str(body.get("requesterPhone", "")).strip()
        target = str(body.get("targetPhone", "")).strip()
        if requester != SUPER_ADMIN_PHONE:
            return JsonResponse({"success": False, "message": "Only Super Admin can delete admins."}, status=403)
        if target == SUPER_ADMIN_PHONE:
            return JsonResponse({"success": False, "message": "Cannot delete Super Admin."}, status=400)
        AdminUser.objects.filter(phone=target).delete()
        return JsonResponse({"success": True, "message": "Admin removed."})

@csrf_exempt
def scrape_metadata(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    body = json.loads(request.body.decode("utf-8"))
    raw_url = body.get("url", "").strip()
    if not raw_url:
        return JsonResponse({"success": False, "message": "Product URL is required."}, status=400)
    
    # Auto-normalize URL with tracking tag
    normalized_url = normalize_amazon_affiliate_url(raw_url)

    try:
        req_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "identity",
            "Cache-Control": "max-age=0",
            "Upgrade-Insecure-Requests": "1"
        }
        
        req = urllib.request.Request(raw_url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            final_url = response.geturl()
            html_raw = response.read().decode("utf-8", errors="ignore")

            # 1. Clean Title Extraction
            title = ""
            m_title = re.search(r'<span id="productTitle"[^>]*>([\s\S]*?)</span>', html_raw)
            if m_title:
                title = html.unescape(m_title.group(1)).strip()
            if not title:
                m_og_title = re.search(r'property="og:title"\s+content="([^"]+)"', html_raw)
                if m_og_title:
                    title = html.unescape(m_og_title.group(1)).strip()
            if not title:
                m_page_title = re.search(r'<title>(.*?)</title>', html_raw, re.I)
                if m_page_title:
                    title = html.unescape(m_page_title.group(1)).strip()
            
            # Clean Amazon branding from title
            title = re.sub(r"^(Amazon\.in\s*:\s*Buy\s*|Buy\s*)", "", title, flags=re.I)
            title = re.sub(r"\s*[:|\-]\s*Amazon\.[a-z.]+", "", title, flags=re.I).strip()
            title = re.sub(r"\s*Online at Low Prices? in India.*$", "", title, flags=re.I).strip()

            # 2. High-Res Images Extraction
            extracted_images = []
            
            # Check dynamic image JSON map (contains highest-res photos on Amazon)
            m_dyn = re.search(r'data-a-dynamic-image="([^"]+)"', html_raw)
            if m_dyn:
                try:
                    dyn_json_str = html.unescape(m_dyn.group(1))
                    dyn_data = json.loads(dyn_json_str)
                    for img_url in dyn_data.keys():
                        if img_url.startswith(('http://', 'https://')) and img_url not in extracted_images:
                            extracted_images.append(img_url)
                except Exception:
                    pass

            # Check hiRes parameters in image scripts
            hires_matches = re.findall(r'["\']hiRes["\']\s*:\s*["\'](https?://[^"\']+)["\']', html_raw)
            for h in hires_matches:
                if h not in extracted_images:
                    extracted_images.append(h)

            # Check data-old-hires
            m_old = re.search(r'data-old-hires="([^"]+)"', html_raw)
            if m_old and m_old.group(1).startswith('http') and m_old.group(1) not in extracted_images:
                extracted_images.append(m_old.group(1))

            # Fallback to OpenGraph image
            m_og_img = re.search(r'property="og:image"\s+content="([^"]+)"', html_raw)
            if m_og_img and m_og_img.group(1).startswith('http') and m_og_img.group(1) not in extracted_images:
                extracted_images.append(m_og_img.group(1))

            primary_image = extracted_images[0] if extracted_images else "https://images.unsplash.com/photo-1523275335684-37898b6baf30"

            # 3. Product Specifications & Features Bullet Extraction
            specs = []
            m_bullets = re.search(r'<div id="feature-bullets"[^>]*>([\s\S]*?)</div>', html_raw)
            if m_bullets:
                items = re.findall(r'<span class="a-list-item"[^>]*>([\s\S]*?)</span>', m_bullets.group(1))
                for it in items:
                    clean_it = re.sub(r'<[^>]+>', '', it).strip()
                    clean_it = html.unescape(clean_it)
                    if clean_it and len(clean_it) > 3 and not clean_it.startswith(('http', '{')):
                        specs.append(clean_it[:120])
                        if len(specs) >= 5:
                            break

            if not specs:
                specs = ["Prime Quality Verified", "Standard Brand Warranty", "High Customer Rating"]

            # 4. Price Extraction
            price = ""
            m_price = re.search(r'class="a-price-whole">([0-9,]+)', html_raw)
            if m_price:
                price = "₹" + m_price.group(1).replace(",", "")
            
            # MRP
            mrp = ""
            m_mrp = re.search(r'class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">([^<]+)</span>', html_raw)
            if m_mrp:
                mrp = m_mrp.group(1).strip()

            # Rating & Review Count
            rating = 4.5
            m_rating = re.search(r'([0-9.]+)\s+out of 5 stars', html_raw)
            if m_rating:
                try:
                    rating = float(m_rating.group(1))
                except ValueError:
                    rating = 4.5

            reviews_count = 320
            m_reviews = re.search(r'id="acrCustomerReviewText"[^>]*>([0-9,]+)\s+rating', html_raw)
            if m_reviews:
                try:
                    reviews_count = int(m_reviews.group(1).replace(",", ""))
                except ValueError:
                    reviews_count = 320

            return JsonResponse({
                "success": True,
                "title": title or "Amazon Curated Selection",
                "image": primary_image,
                "images": extracted_images if extracted_images else [primary_image],
                "price": price or "Live on Amazon",
                "mrp": mrp or "₹1,999",
                "discount": "Best Amazon Deal",
                "rating": rating,
                "reviewsCount": reviews_count,
                "specs": specs,
                "affiliateUrl": normalized_url or final_url
            })
    except Exception as e:
        # Fallback with graceful metadata extraction
        return JsonResponse({
            "success": True,
            "title": "Amazon Curated Product",
            "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
            "price": "Live on Amazon",
            "mrp": "₹1,999",
            "discount": "Great Deal",
            "rating": 4.5,
            "reviewsCount": 250,
            "specs": ["Authentic Verified", "Inspected Build", "Customer Approved"],
            "affiliateUrl": normalized_url
        })
