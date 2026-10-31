# AuraPOS — Cloud Retail POS & Multi-Branch Management System

AuraPOS is a modern, cloud-connected Point of Sale and multi-branch retail management platform built with **Flutter (Dart)** and a **Node.js / TypeScript** modular backend.

---

## 🏗️ Architecture & Technology Stack

* **Mobile & Tablet App:** Flutter 3+, Dart, Riverpod, Drift / SQLite Offline Engine, ESC/POS Thermal Receipt & Cash Drawer Adapter, Material 3.
* **Backend:** Node.js, Express, TypeScript, Zod, JWT Authentication, Multi-branch database persistence.
* **Bilingual Support:** 100% Arabic (RTL) & English (LTR) layout mirroring.
* **Visual Identity:** Deep Royal Violet (`#4F46E5`), Mint Green (`#10B981`), Dark Slate (`#0F172A`).

---

## 🛒 Core Business Modules

1. **POS Register & Cart Engine:** Visual grid by category, fast search, line-item quantity & discount controls, split payments (Cash / Mada / Apple Pay).
2. **ZATCA Certified E-Invoicing:** Base64 TLV encrypted QR codes generated automatically for all simplified tax invoices.
3. **Hardware Integration:**
   * **ESC/POS 80mm Thermal Receipt Printers:** Network & Bluetooth printing.
   * **Electronic Cash Drawer:** Trigger pulse via RJ11 upon cash sale.
   * **Barcode Scanner:** Fast item lookup via camera or external Bluetooth scanner.
4. **Cashier Shifts & Z-Reports:** Opening cash balance, cash sales, card sales, counted actual cash, and automated discrepancy detection.
5. **Multi-Branch Inventory:** Live stock tracking per branch with low-stock warnings.

---

## 🚀 Getting Started

### 1. Run the Backend API
```bash
cd backend
npm install
npm test
npm run build
npm start
```
API runs on `http://localhost:4000`. Health check at: `http://localhost:4000/api/health`.

### 2. Run the Flutter App
```bash
cd mobile
flutter pub get
flutter run
```
Supports Web, Android, iOS, Windows, and macOS with responsive tablet and mobile layouts.
