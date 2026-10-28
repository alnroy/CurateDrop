from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class AdminUser(models.Model):
    phone = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=128, default='alan@2004')
    role = models.CharField(max_length=20, default='admin')
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password) or self.password == raw_password

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.role}"

class CustomerUser(models.Model):
    phone = models.CharField(max_length=15, primary_key=True, unique=True)
    name = models.CharField(max_length=120)
    password_hash = models.CharField(max_length=256)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class CustomerAddress(models.Model):
    LABEL_CHOICES = (
        ('Home', 'Home'),
        ('Work', 'Work'),
        ('Other', 'Other'),
    )
    customer = models.ForeignKey(CustomerUser, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='Home')
    full_address = models.TextField()
    landmark = models.CharField(max_length=150, blank=True)
    pincode = models.CharField(max_length=10)
    city = models.CharField(max_length=100, default='City')
    state = models.CharField(max_length=100, default='State')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.label} - {self.customer.name} ({self.pincode})"

class Product(models.Model):
    PRODUCT_TYPES = (
        ('affiliate', 'Amazon Affiliate'),
        ('real', 'Direct Store (COD)'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=300)
    category = models.CharField(max_length=100, default='General')
    subcategory = models.CharField(max_length=100, default='General', blank=True)
    price = models.CharField(max_length=50, default='Live on Amazon', blank=True)
    mrp = models.CharField(max_length=50, blank=True)
    discount = models.CharField(max_length=50, blank=True)
    rating = models.FloatField(default=4.5)
    reviews_count = models.IntegerField(default=120)
    image = models.URLField(max_length=1000)
    images = models.JSONField(default=list)
    curated_verdict = models.TextField()
    specs = models.JSONField(default=list)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='affiliate')
    affiliate_url = models.URLField(max_length=1000, blank=True)
    platform = models.CharField(max_length=50, default='amazon')
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} [{self.product_type}]"

class Order(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    customer_phone = models.CharField(max_length=15)
    customer_name = models.CharField(max_length=100)
    address = models.TextField()
    address_label = models.CharField(max_length=20, default='Home')
    pincode = models.CharField(max_length=10)
    items = models.JSONField(default=list)
    total_amount = models.CharField(max_length=50)
    payment_mode = models.CharField(max_length=50, default='Cash on Delivery')
    cod_otp = models.CharField(max_length=6)
    terms_accepted = models.BooleanField(default=True)
    status = models.CharField(max_length=50, default='Pending Open-Box Delivery')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer_name} ({self.total_amount})"
