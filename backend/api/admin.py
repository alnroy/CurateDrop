from django.contrib import admin
from .models import AdminUser, CustomerUser, CustomerAddress, Product, Order

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'name', 'role', 'created_at')
    search_fields = ('phone', 'name')
    list_filter = ('role',)

class CustomerAddressInline(admin.TabularInline):
    model = CustomerAddress
    extra = 1

@admin.register(CustomerUser)
class CustomerUserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'name', 'is_verified', 'created_at')
    search_fields = ('phone', 'name')
    list_filter = ('is_verified',)
    inlines = [CustomerAddressInline]

@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ('customer', 'label', 'pincode', 'city', 'state', 'is_default')
    search_fields = ('customer__name', 'customer__phone', 'pincode', 'city')
    list_filter = ('label', 'is_default')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'price', 'product_type', 'in_stock', 'rating')
    list_filter = ('product_type', 'category', 'in_stock')
    search_fields = ('title', 'category', 'id')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_phone', 'total_amount', 'cod_otp', 'status', 'created_at')
    list_filter = ('status', 'payment_mode')
    search_fields = ('id', 'customer_name', 'customer_phone', 'cod_otp')
