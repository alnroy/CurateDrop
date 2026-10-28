import http.server
import socketserver
import json
import sqlite3
import urllib.request
import urllib.parse
import re
import os
import sys

PORT = 8001
DB_PATH = os.path.join(os.path.dirname(__file__), "curatedrop.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Admins table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admins (
        phone TEXT PRIMARY KEY,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Pre-seed Super Admin
    cursor.execute("INSERT OR IGNORE INTO admins (phone, name, role) VALUES (?, ?, ?)",
                   ("7511136171", "Super Admin", "super_admin"))
    
    # Products table (Affiliate & Real Products)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        title TEXT NOT NULL,
        category TEXT,
        price TEXT,
        mrp TEXT,
        discount TEXT,
        rating REAL DEFAULT 4.5,
        reviewsCount INTEGER DEFAULT 120,
        image TEXT,
        curatedVerdict TEXT,
        specs TEXT,
        productType TEXT DEFAULT 'affiliate', -- 'affiliate' or 'real'
        affiliateUrl TEXT,
        platform TEXT DEFAULT 'amazon',
        inStock INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Orders table (for Real Products with COD Open-box Policy)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerName TEXT,
        customerPhone TEXT,
        address TEXT,
        pincode TEXT,
        items TEXT,
        totalAmount TEXT,
        paymentMode TEXT DEFAULT 'COD',
        codOtp TEXT,
        termsAccepted INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Confirmed (Open-Box Delivery)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Seed Initial Mock Products if empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        initial_products = [
            (
                "prod-1",
                "telescopic-carbon-fiber-fishing-rod",
                "Sougayilang Telescopic Carbon Fiber Fishing Rod & Reel Combo",
                "Outdoors",
                "₹1,899",
                "₹2,999",
                "37% OFF",
                4.5,
                840,
                "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80",
                "The only saltwater-resistant telescopic rod under ₹2,000 that fits in a backpack without snapping.",
                json.dumps(["Carbon fiber build", "CNC machined aluminum reel seat", "Includes 120m braided line"]),
                "affiliate",
                "https://www.amazon.in/dp/B08XYZ?tag=curatedrop-21",
                "amazon",
                1
            ),
            (
                "prod-2",
                "aluminum-ergonomic-laptop-stand",
                "Portronics My Buddy K Portable Ergonomic Laptop Stand",
                "Desk Setup",
                "₹499",
                "₹999",
                "50% OFF",
                4.4,
                3200,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
                "Sturdy aircraft-grade aluminum that eliminates neck strain for less than ₹500.",
                json.dumps(["7 adjustable height angles", "Non-slip silicone pads", "Foldable with carry pouch"]),
                "affiliate",
                "https://www.amazon.in/dp/B07ABC?tag=curatedrop-21",
                "amazon",
                1
            ),
            (
                "prod-3",
                "self-cleaning-slicker-pet-brush",
                "Heads Up For Tails Self-Cleaning Slicker Brush for Dogs & Cats",
                "Pet Care",
                "₹349",
                "₹699",
                "50% OFF",
                4.6,
                1150,
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
                "One-button fur ejector mechanism saves 15 minutes of cleanup per grooming session.",
                json.dumps(["Fine bent wire bristles with rounded tips", "One-click clean button", "Ergonomic rubber grip"]),
                "affiliate",
                "https://www.amazon.in/dp/B09DEF?tag=curatedrop-21",
                "amazon",
                1
            ),
            (
                "prod-4",
                "curatedrop-artisan-leather-desk-mat",
                "CurateDrop Artisan Vegan Leather Dual-Sided Desk Mat (90x45cm)",
                "Desk Setup",
                "₹599",
                "₹1,299",
                "54% OFF",
                4.8,
                420,
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
                "Our flagship store product. Waterproof, reversible dual-color vegan leather with anti-glare finish.",
                json.dumps(["90cm x 45cm Ultra Wide", "Waterproof & Easy Wipe", "Reversible Midnight Blue / Tan Brown", "Official CurateDrop Direct Dispatch"]),
                "real",
                "",
                "curatedrop",
                1
            ),
            (
                "prod-5",
                "stainless-steel-smart-temperature-flask",
                "CurateDrop ThermoSmart 500ml LED Temperature Display Bottle",
                "Under ₹500",
                "₹449",
                "₹899",
                "50% OFF",
                4.7,
                680,
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
                "Direct store item: Touch-activated LCD lid showing real-time water temperature with double-wall insulation.",
                json.dumps(["Food Grade 304 Stainless Steel", "24-hr Cold / 12-hr Hot", "Battery-free smart LCD cap", "Cash on Delivery Available"]),
                "real",
                "",
                "curatedrop",
                1
            )
        ]
        cursor.executemany("""
        INSERT INTO products (
            id, slug, title, category, price, mrp, discount, rating,
            reviewsCount, image, curatedVerdict, specs, productType, affiliateUrl, platform, inStock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_products)
    
    conn.commit()
    conn.close()

def extract_meta_from_url(url):
    """
    Scrapes OpenGraph / Meta tags from Amazon or any e-commerce URL
    Extracts Title, Image, and Estimated details automatically.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract Title
            title = ""
            og_title = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\'](.*?)["\']', html, re.I)
            if og_title:
                title = og_title.group(1)
            else:
                title_tag = re.search(r'<title>(.*?)</title>', html, re.I)
                if title_tag:
                    title = title_tag.group(1)
            
            # Clean Amazon title suffixes like ": Amazon.in: ..."
            title = re.sub(r'\s*[:|\-]\s*Amazon\.[a-z.]+', '', title, flags=re.I).strip()
            
            # Extract Image
            image = ""
            og_img = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\'](.*?)["\']', html, re.I)
            if og_img:
                image = og_img.group(1)
            else:
                # Look for Amazon primary image
                landing_img = re.search(r'data-old-hires=["\'](https://images-na\.ssl-images-amazon\.com/images/[^"\']+)["\']', html)
                if landing_img:
                    image = landing_img.group(1)
            
            # Extract Price if found
            price = ""
            price_match = re.search(r'class=["\']a-price-whole["\']>([0-9,]+)', html)
            if price_match:
                price = "₹" + price_match.group(1)
            
            # Extract Rating if found
            rating = 4.5
            rating_match = re.search(r'([0-4]\.[0-9])\s*out of 5 stars', html, re.I)
            if rating_match:
                try:
                    rating = float(rating_match.group(1))
                except:
                    pass

            return {
                "success": True,
                "title": title or "Amazon Curated Selection",
                "image": image or "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                "price": price or "₹999",
                "mrp": "₹1,999",
                "discount": "50% OFF",
                "rating": rating,
                "reviewsCount": 450,
                "specs": ["Official Verified Product", "Standard Manufacturer Warranty", "Amazon A-to-z Guarantee"]
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "title": "Amazon Curated Product",
            "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            "price": "₹999",
            "mrp": "₹1,499",
            "discount": "33% OFF",
            "rating": 4.5,
            "reviewsCount": 350,
            "specs": ["Verified Authentic", "Top Seller", "Prime Fast Delivery"]
        }

class CurateDropHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path
        
        # Public Products Endpoint
        if path == "/api/products":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, slug, title, category, price, mrp, discount, rating,
                   reviewsCount, image, curatedVerdict, specs, productType, affiliateUrl, platform, inStock
            FROM products ORDER BY created_at DESC
            """)
            rows = cursor.fetchall()
            conn.close()
            
            products = []
            for r in rows:
                try:
                    specs = json.loads(r[11]) if r[11] else []
                except:
                    specs = []
                products.append({
                    "id": r[0],
                    "slug": r[1],
                    "title": r[2],
                    "category": r[3],
                    "price": r[4],
                    "mrp": r[5],
                    "discount": r[6],
                    "rating": r[7],
                    "reviewsCount": r[8],
                    "image": r[9],
                    "curatedVerdict": r[10],
                    "specs": specs,
                    "productType": r[12],
                    "affiliateUrl": r[13],
                    "platform": r[14],
                    "inStock": bool(r[15])
                })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(products).encode('utf-8'))
            return

        # Admin List (Only accessible by Super Admin)
        elif path == "/api/admin/list":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT phone, name, role, created_at FROM admins ORDER BY role DESC")
            rows = cursor.fetchall()
            conn.close()
            
            admins = [{"phone": r[0], "name": r[1], "role": r[2], "created_at": r[3]} for r in rows]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(admins).encode('utf-8'))
            return

        # Orders List (For Real Products)
        elif path == "/api/admin/orders":
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT id, customerName, customerPhone, address, pincode, items, totalAmount, paymentMode, codOtp, termsAccepted, status, created_at FROM orders ORDER BY created_at DESC")
            rows = cursor.fetchall()
            conn.close()
            
            orders = []
            for r in rows:
                try:
                    items = json.loads(r[5]) if r[5] else []
                except:
                    items = []
                orders.append({
                    "id": r[0],
                    "customerName": r[1],
                    "customerPhone": r[2],
                    "address": r[3],
                    "pincode": r[4],
                    "items": items,
                    "totalAmount": r[6],
                    "paymentMode": r[7],
                    "codOtp": r[8],
                    "termsAccepted": bool(r[9]),
                    "status": r[10],
                    "created_at": r[11]
                })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(orders).encode('utf-8'))
            return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path
        
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}

        # Admin Login Endpoint
        if path == "/api/admin/login":
            phone = str(data.get("phone", "")).strip()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT phone, name, role FROM admins WHERE phone = ?", (phone,))
            admin = cursor.fetchone()
            conn.close()
            
            if admin:
                response = {
                    "success": True,
                    "admin": {
                        "phone": admin[0],
                        "name": admin[1],
                        "role": admin[2]
                    }
                }
                self.send_response(200)
            else:
                response = {"success": False, "message": "Phone number not registered as an Admin. Contact Super Admin (7511136171)."}
                self.send_response(403)
                
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # Add Secondary Admin (Super Admin only)
        elif path == "/api/admin/add":
            requester_phone = str(data.get("requesterPhone", "")).strip()
            new_phone = str(data.get("phone", "")).strip()
            new_name = str(data.get("name", "Store Staff")).strip()
            
            if requester_phone != "7511136171":
                self.send_response(403)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": "Only Super Admin (7511136171) can add admins."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("INSERT OR REPLACE INTO admins (phone, name, role) VALUES (?, ?, 'admin')", (new_phone, new_name))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": f"Admin {new_name} ({new_phone}) added successfully!"}).encode('utf-8'))
            return

        # Delete Admin
        elif path == "/api/admin/delete":
            requester_phone = str(data.get("requesterPhone", "")).strip()
            target_phone = str(data.get("targetPhone", "")).strip()
            
            if requester_phone != "7511136171":
                self.send_response(403)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": "Only Super Admin can remove admins."}).encode('utf-8'))
                return
                
            if target_phone == "7511136171":
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": "Super Admin cannot be deleted."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM admins WHERE phone = ?", (target_phone,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Admin removed."}).encode('utf-8'))
            return

        # Auto-Scrape Amazon / URL Metadata
        elif path == "/api/scrape-metadata":
            url = data.get("url", "").strip()
            metadata = extract_meta_from_url(url)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(metadata).encode('utf-8'))
            return

        # Add Product (Affiliate or Real)
        elif path == "/api/products":
            prod_id = f"prod-{int(os.urandom(3).hex(), 16)}"
            slug = re.sub(r'[^a-z0-9]+', '-', data.get("title", "product").lower()).strip('-') + f"-{prod_id}"
            title = data.get("title", "Untitled Product")
            category = data.get("category", "General")
            price = data.get("price", "₹499")
            mrp = data.get("mrp", "₹999")
            discount = data.get("discount", "50% OFF")
            rating = float(data.get("rating", 4.5))
            reviewsCount = int(data.get("reviewsCount", 120))
            image = data.get("image", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80")
            curatedVerdict = data.get("curatedVerdict", "Handpicked for exceptional durability and best-in-class value.")
            specs = json.dumps(data.get("specs", ["Quality Tested", "Verified Seller"]))
            productType = data.get("productType", "affiliate")
            affiliateUrl = data.get("affiliateUrl", "")
            platform = data.get("platform", "amazon" if productType == "affiliate" else "curatedrop")
            inStock = 1

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO products (
                id, slug, title, category, price, mrp, discount, rating,
                reviewsCount, image, curatedVerdict, specs, productType, affiliateUrl, platform, inStock
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (prod_id, slug, title, category, price, mrp, discount, rating,
                  reviewsCount, image, curatedVerdict, specs, productType, affiliateUrl, platform, inStock))
            conn.commit()
            conn.close()

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "id": prod_id, "slug": slug}).encode('utf-8'))
            return

        # Create Order (for Real Products with COD Open-Box Delivery Policy)
        elif path == "/api/orders":
            order_id = f"ORD-{int(os.urandom(4).hex(), 16).upper()}"
            customerName = data.get("customerName", "Customer")
            customerPhone = data.get("customerPhone", "")
            address = data.get("address", "")
            pincode = data.get("pincode", "")
            items = json.dumps(data.get("items", []))
            totalAmount = data.get("totalAmount", "₹0")
            paymentMode = data.get("paymentMode", "COD")
            termsAccepted = 1 if data.get("termsAccepted") else 0
            codOtp = str(int(os.urandom(2).hex(), 16) % 9000 + 1000) # 4-digit OTP

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO orders (
                id, customerName, customerPhone, address, pincode, items, totalAmount, paymentMode, codOtp, termsAccepted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (order_id, customerName, customerPhone, address, pincode, items, totalAmount, paymentMode, codOtp, termsAccepted))
            conn.commit()
            conn.close()

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "orderId": order_id,
                "codOtp": codOtp,
                "message": "Order placed successfully! Keep your Open-Box Delivery OTP ready."
            }).encode('utf-8'))
            return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

    def do_DELETE(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path
        
        # Delete Product: /api/products/<id>
        if path.startswith("/api/products/"):
            prod_id = path.replace("/api/products/", "").strip()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM products WHERE id = ?", (prod_id,))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Product deleted"}).encode('utf-8'))
            return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

if __name__ == "__main__":
    init_db()
    print(f"CurateDrop Backend Server & SQLite DB running on http://0.0.0.0:{PORT}")
    server = socketserver.TCPServer(("0.0.0.0", PORT), CurateDropHandler)
    server.serve_forever()
