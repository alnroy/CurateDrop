# CurateDrop — Full Stack Project Architecture

A complete ecosystem featuring a **Django SQLite Backend**, a **Customer Responsive Web App**, and a **Dedicated Mobile App for Admins & Delivery Agents**.

---

## 📂 Directory Structure

```
C:\Users\asus\Desktop\CurateDrop\
├── backend/          # Python 3 + Django + SQLite + DRF API
│   ├── manage.py
│   ├── curatedrop.sqlite3
│   ├── api/          # Models (AdminUser, Product, Order), Amazon Scraper, OTP verification
│   └── curatedrop_backend/
│
├── website/          # Customer Shopping & Affiliate Showcase (Port 3000)
│   ├── src/App.jsx   # Bottom-sheet modal on mobile, instant search, COD checkout, WhatsApp
│   └── package.json
│
└── admin_app/        # Admin Mobile App (Port 3001)
    ├── src/App.jsx   # Mobile Bottom Navigation: Catalog, Quick Auto-Add, Delivery OTP, Staff
    └── package.json
```

---

## ⚡ How to Run Everything

### 1. Run the Django Backend (Port 8000)
Open a terminal in `backend/`:
```powershell
cd C:\Users\asus\Desktop\CurateDrop\backend
python manage.py runserver 0.0.0.0:8000
```
* **Super Admin:** Pre-seeded with phone `7511136171`.

### 2. Run the Customer Website (Port 3000)
Open a terminal in `website/`:
```powershell
cd C:\Users\asus\Desktop\CurateDrop\website
npm run dev
```
Visit: **http://localhost:3000**

### 3. Run the Admin Mobile App (Port 3001)
Open a terminal in `admin_app/`:
```powershell
cd C:\Users\asus\Desktop\CurateDrop\admin_app
npm run dev
```
Visit: **http://localhost:3001** (or open on your phone using your local Wi-Fi IP / Cloudflare tunnel).

---

## 📱 Features

1. **Super Admin Phone:** `7511136171`
   * Only the Super Admin can add or delete secondary admins / delivery agents.
2. **Instant Amazon Scraper:**
   * In the Admin Mobile App or Website, paste any Amazon link $ightarrow$ Tap **"Fetch"** $ightarrow$ Title, Image, Price, and Ratings are automatically filled.
3. **Strict Open-Box Delivery with OTP:**
   * Direct store products require customer agreement:
     > "The delivery executive will open the box in front of you. Inspect before sharing OTP. No returns accepted post-OTP unless genuine damage is proven at delivery time."
   * Customers receive a **4-digit Delivery OTP**.
   * Delivery agents enter the OTP into the **Admin Mobile App** to verify and confirm the delivery on the spot.
4. **WhatsApp Support:**
   * Direct 1-tap chat button to `+91 7511136171`.
