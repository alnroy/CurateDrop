from django.urls import path
from . import views

urlpatterns = [
    # Public & Products
    path('products', views.product_list, name='products'),
    path('products/create', views.product_create, name='product_create'),
    path('products/<str:pk>/delete', views.product_delete, name='product_delete'),
    path('scrape-metadata', views.scrape_metadata, name='scrape_metadata'),
    path('upload-images', views.upload_images, name='upload_images'),
    
    # Customer Auth & Confidential Account
    path('customer/signup', views.customer_signup, name='customer_signup'),
    path('customer/login', views.customer_login, name='customer_login'),
    path('customer/profile', views.customer_profile, name='customer_profile'),
    path('customer/address/add', views.customer_add_address, name='customer_add_address'),
    path('customer/address/<int:pk>/delete', views.customer_delete_address, name='customer_delete_address'),
    path('customer/orders', views.customer_orders, name='customer_orders'),
    
    # Orders
    path('orders', views.order_list, name='order_list'),
    path('orders/create', views.order_create, name='order_create'),
    path('orders/verify-otp', views.order_list, name='order_verify_otp'),

    # Admin Portal
    path('admin/login', views.admin_login, name='admin_login'),
    path('admin/list', views.admin_manage, name='admin_list'),
    path('admin/add', views.admin_manage, name='admin_add'),
    path('admin/delete', views.admin_delete, name='admin_delete'),
]
