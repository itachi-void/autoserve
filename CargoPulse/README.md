# CargoPulse — Enterprise Logistics & Supply Chain Platform

CargoPulse is an enterprise-grade logistics, warehouse management (WMS), and last-mile delivery platform built with **Native Android Kotlin + Jetpack Compose** and an **ASP.NET Core 8 Web API** backend.

---

## 🏗️ Architecture & Technology Stack

* **Mobile App:** Native Android, Kotlin 2.0, Jetpack Compose (Material 3), Room Database (Offline-First Sync Engine), CameraX, Bluetooth ESC/POS & ZPL Label Printer Integration.
* **Backend:** ASP.NET Core 8 Web API, C#, Clean Architecture (Domain, Application, Infrastructure, Api), Entity Framework Core (PostgreSQL & SQLite), JWT Authentication, SignalR Live Tracking Hub.
* **Bilingual Support:** 100% Arabic (RTL) & English (LTR) layout and typography.
* **Visual Identity:** Deep Navy (`#0A1128`), Hi-Vis Safety Orange (`#FF6B00`), Slate Surface (`#161F38`).

---

## 📦 Core Business Modules

1. **Shipment Lifecycle State Machine:** Strict transitions (`Created` -> `Received` -> `Sorted` -> `Stored` -> `InTransit` -> `OutForDelivery` -> `Delivered`).
2. **Proof of Delivery (POD):** Digital signature capture, photo evidence, GPS location stamp, and COD collection.
3. **Hardware Integration:**
   * **ZPL / ESC-POS Bluetooth Printers:** Generates standard 4x6" thermal waybills with barcodes & QR codes.
   * **Laser & Camera Barcode Scanners:** Fast putaway & warehouse bin assignment.
4. **Offline Synchronization:** Room database with queued mutations, UUID idempotency keys, and automatic retry engine.
5. **Driver Cash Reconciliation:** Tracks expected vs collected Cash on Delivery (COD) with zero-discrepancy daily settlement.

---

## 🚀 Getting Started

### 1. Run the Backend API
```bash
cd backend
dotnet restore
dotnet test tests/CargoPulse.Tests/CargoPulse.Tests.csproj
dotnet run --project src/CargoPulse.Api/CargoPulse.Api.csproj
```
API runs on `http://localhost:5000` or `http://localhost:5050`.
Swagger documentation available at: `http://localhost:5000/swagger`.

### 2. Run with Docker Compose
```bash
cd backend
docker-compose up -d
```

### 3. Open Android Project
Open the `android/` directory in Android Studio (Jellyfish / Koala or newer), build and install on any Android 8.0+ device or emulator.
