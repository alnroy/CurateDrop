# CurateDrop — Platform Architecture, Security & Confidentiality Framework

An enterprise-grade hybrid e-commerce ecosystem consisting of an **Amazon Affiliate Showcase**, a **Direct Physical Store with Strict Open-Box Cash on Delivery (COD)**, a **Customer Account & Multi-Address Suite**, and a **Dedicated Field Operations Mobile App (PWA)**.

---

## 🛠️ Complete Technology Stack

| Layer | Technologies & Libraries | Key Responsibilities |
| :--- | :--- | :--- |
| **Backend Core** | **Python 3.14 + Django 6.0** | REST API endpoints, business logic, auto-scraping service, authentication, and order lifecycle management. |
| **Database** | **SQLite 3 (`curatedrop.sqlite3`)** | Persistent storage for Admin credentials, Customer users, Multi-Addresses, Products catalog, and Orders. |
| **Administration** | **Django Admin (`/admin`)** | Visual database inspection and management pre-configured with admin search, filters, and inlines. |
| **Customer Web App** | **React 19 + Vite 8 + Tailwind CSS v4** | Single-Page Responsive Web Application, instant debounced search, product filtering, multi-address checkout, and SweetAlert toasts. |
| **Admin Mobile App** | **React + PWA (Progressive Web App)** | Field operations mobile app with instant auto-scraping, multiple photo uploads directly from gallery/camera, and delivery OTP verification. |
| **Visual Effects** | **CSS Blend Modes (`mix-blend-mode: multiply`)** | Background removal simulation trick that transforms plain catalog photos into studio cutout models. |
| **Icons** | **Lucide Icons (`lucide-react`)** | Feather-weight SVG icon library. |

---

## 🔒 Confidentiality & Security Architecture

### 1. Cryptographic Password Hashing (PBKDF2 SHA-256)
* Customer passwords and Admin passwords are **never stored in plaintext**.
* Uses Django’s hardened `make_password` algorithm:
  * **Algorithm:** PBKDF2 with a SHA-256 hash.
  * **Work Factor:** 600,000+ iterations with unique per-user cryptographically random salts.
  * **Immunity:** Defends against rainbow table attacks, dictionary cracking, and database dump exposures.

### 2. Client Data Confidentiality & Isolation
* Customer phone numbers, passwords, delivery addresses, and order histories are strictly partitioned.
* Endpoints like `GET /api/customer/orders` and `GET /api/customer/profile` are parameter-isolated so customers cannot enumerate or scrape other users' personal data.
* Direct store orders are only accessible by:
  1. The specific verified customer who created the order.
  2. The authorized Super Admin (**`7511136171`**) and authorized delivery staff.

### 3. "I am Not a Robot" Anti-Bot Verification
* The Customer Sign-Up flow includes an embedded security challenge ensuring automated headless scripts and spam bots cannot flood the database with fake accounts.
* Prevents automated account creation and checkout denial-of-service.

### 4. Separation of Affiliate vs. Direct Store Logic
* **Amazon Affiliate Deals:**
  * 100% frictionless.
  * **Zero login or registration required.**
  * Clean outbound click-through with `rel="nofollow sponsored noopener noreferrer"`.
* **Direct Store (Cash on Delivery):**
  * **Strict authentication gatekeeper:** Anonymous visitors cannot trigger COD checkout.
  * Clicking "Buy COD" or checkout prompts the user to Sign In or Sign Up once.
  * Once signed in, their verified mobile number and saved addresses (**Home**, **Work**, **Other**) auto-populate, eliminating re-typing on future orders.

### 5. Strict Open-Box Delivery & OTP Fraud Prevention
* Direct store products require customer agreement:
  > *"The delivery executive will open the box in front of you. Inspect before sharing OTP. No returns accepted post-OTP unless genuine damage is proven at delivery time."*
* When an order is placed, a **unique 4-digit Delivery OTP** is generated and tied to the order in the database.
* The customer receives the OTP in their **"My Orders"** drawer.
* The delivery partner opens the package in front of the customer. Once the customer verifies the physical contents, they share the OTP.
* The delivery agent verifies the OTP inside the **CurateDrop Admin App**, permanently locking the order as `"Delivered & OTP Verified"`.

### 6. SQL Injection & XSS Protection
* All queries run through the Django Object-Relational Mapper (ORM) using parameterized prepared statements, preventing SQL injection vulnerabilities.
* React’s Virtual DOM automatically escapes dynamic string injections, preventing Cross-Site Scripting (XSS).
* Strict CORS configuration protects private endpoints from unauthorized cross-origin requests.

---

## 🎨 CSS Product Cutout Blend Trick
Standard product images from suppliers often have grey or off-white rectangular backgrounds. We applied the e-commerce cutout filter:
```css
img.product-cutout {
  mix-blend-mode: multiply;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.09));
}
```
* **How it works:** `mix-blend-mode: multiply` subtracts the light/white pixels of the photo against the card background, seamlessly dropping the background and making the product look like a high-end isolated cutout without needing expensive background removal APIs!

---

## 🔑 Administrative Access

* **Super Admin Hotline & User ID:** `7511136171`
* **Super Admin Password:** `alan@2004`
* **Django Admin Portal:** `http://localhost:8002/admin`
  * Username: `admin`
  * Password: `alan@2004`
  * Tables: `Admin users`, `Customer users`, `Customer addresses`, `Products`, `Orders`
* **Customer Website:** `http://localhost:3000`
* **Admin Mobile Suite (PWA):** `http://localhost:3001`
