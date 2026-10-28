# CurateDrop - Hybrid Affiliate & Direct Store Platform

A high-converting, single-page responsive product curation and e-commerce showcase built with **React**, **Vite**, **Tailwind CSS**, and a **Python SQLite Backend**.

---

## 🚀 Quick Start (Running Locally)

### 1. Start the Backend & Database (Port 8001)
```powershell
cd C:\Users\asus\.gemini\antigravity-ide\scratch\curatedrop
python server.py
```
* **Database:** Automatically initializes `curatedrop.db` (SQLite).
* **Pre-seeded Super Admin:** Phone `7511136171`.
* **API Endpoints:** Products, Orders, Admin Management, and Amazon Auto-Scraper.

### 2. Start the Frontend (Port 3000)
```powershell
cd C:\Users\asus\.gemini\antigravity-ide\scratch\curatedrop
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Cloudflare Tunnel Setup (Public Access)
To expose both your website and API to the internet through Cloudflare:
```powershell
cloudflared tunnel run --url http://localhost:3000
```

---

## 👑 Admin Portal Details
Click the **"Admin"** button in the header or footer:
* **Super Admin Phone:** `7511136171`
* **Super Admin Capabilities:**
  1. **Authorize Secondary Admins:** Add staff members by name and phone.
  2. **Product Manager:**
     * **Amazon Affiliate Product:** Paste any Amazon URL and click **"Fetch Details"** to auto-extract the Title, Primary Photo, Pricing, and Ratings!
     * **Direct Store Product:** Add physical products with full Cash on Delivery (COD) checkout.
  3. **Order Manager:** View incoming COD orders and their customer **Delivery OTPs**.

---

## 📦 Strict Open-Box Delivery & OTP Policy
* Direct store products offer **Cash on Delivery**.
* Customers must agree to the strict terms before booking:
  * Delivery executive opens the box in front of the customer.
  * Customer inspects the physical item.
  * Customer gives the **4-digit OTP** to complete delivery.
  * **No returns are accepted post-OTP** unless physical damage was recorded on camera at the moment of open-box delivery.

---

## 💬 Direct WhatsApp Support
* Header and floating button route directly to WhatsApp chat: `+91 7511136171`.
* Includes pre-filled message tags with current product slugs and order inquiries.
