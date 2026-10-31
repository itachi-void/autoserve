package com.cargopulse.app.ui.localization

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

enum class AppLanguage {
    ARABIC,
    ENGLISH
}

val LocalAppLanguage = staticCompositionLocalOf { AppLanguage.ARABIC }

object AppStrings {
    fun get(key: String, language: AppLanguage): String {
        val dict = if (language == AppLanguage.ARABIC) ArabicStrings else EnglishStrings
        return dict[key] ?: key
    }

    private val ArabicStrings = mapOf(
        "app_name" to "كارغوبلس",
        "app_subtitle" to "إدارة لوجستية ذكية والمخازن",
        "login_title" to "تسجيل الدخول للنظام اللوجستي",
        "email" to "البريد الإلكتروني",
        "password" to "كلمة المرور",
        "login_btn" to "دخول للنظام",
        "role_admin" to "مدير النظام",
        "role_manager" to "مدير المستودع",
        "role_staff" to "فني مستودع",
        "role_driver" to "مندوب التوصيل",
        "dashboard" to "لوحة العمليات",
        "shipments" to "الشحنات",
        "warehouse" to "المستودع",
        "scanner" to "ماسح الباركود",
        "hardware" to "الأجهزة والطابعات",
        "settings" to "الإعدادات",
        "active_shipments" to "الشحنات النشطة",
        "out_for_delivery" to "خرج للتوصيل",
        "delivered_today" to "تم التوصيل اليوم",
        "cod_collected" to "التحصيل النقدي (COD)",
        "warehouse_occupancy" to "نسبة إشغال المستودع",
        "tracking_number" to "رقم التتبع",
        "recipient" to "المستلم",
        "sender" to "المرسل",
        "status" to "الحالة",
        "weight" to "الوزن",
        "shipping_fee" to "أجور الشحن",
        "bin_location" to "موقع الرف",
        "pod_title" to "إثبات التسليم الرقمي (POD)",
        "recipient_name" to "اسم المستلم الفعلي",
        "signature_required" to "التوقيع الرقمي للمستلم",
        "confirm_delivery" to "تأكيد التسليم وحفظ الإثبات",
        "bluetooth_printer" to "طابعة بوالص بلوتوث",
        "laser_scanner" to "ماسح باركود ليزري",
        "status_connected" to "متصل وجاهز",
        "status_disconnected" to "غير متصل",
        "connect" to "اتصال",
        "print_test" to "طباعة بوليصة تجريبية (ZPL/ESC)",
        "offline_mode" to "وضع عدم الاتصال (Offline)",
        "pending_sync" to "عملية بانتظار المزامنة",
        "sync_now" to "مزامنة الآن",
        "language" to "اللغة",
        "theme" to "المظهر",
        "dark_mode" to "الوضع الداكن",
        "light_mode" to "الوضع الفاتح"
    )

    private val EnglishStrings = mapOf(
        "app_name" to "CargoPulse",
        "app_subtitle" to "Smart Logistics & Warehouse Ops",
        "login_title" to "Logistics System Login",
        "email" to "Email Address",
        "password" to "Password",
        "login_btn" to "Sign In",
        "role_admin" to "System Admin",
        "role_manager" to "Warehouse Manager",
        "role_staff" to "Warehouse Staff",
        "role_driver" to "Delivery Driver",
        "dashboard" to "Operations Dashboard",
        "shipments" to "Shipments",
        "warehouse" to "Warehouse",
        "scanner" to "Barcode Scanner",
        "hardware" to "Hardware & Printers",
        "settings" to "Settings",
        "active_shipments" to "Active Shipments",
        "out_for_delivery" to "Out for Delivery",
        "delivered_today" to "Delivered Today",
        "cod_collected" to "Cash on Delivery (COD)",
        "warehouse_occupancy" to "Warehouse Occupancy",
        "tracking_number" to "Tracking #",
        "recipient" to "Recipient",
        "sender" to "Sender",
        "status" to "Status",
        "weight" to "Weight",
        "shipping_fee" to "Shipping Fee",
        "bin_location" to "Bin Location",
        "pod_title" to "Proof of Delivery (POD)",
        "recipient_name" to "Actual Recipient Name",
        "signature_required" to "Recipient Digital Signature",
        "confirm_delivery" to "Confirm Delivery & Save POD",
        "bluetooth_printer" to "Bluetooth Waybill Printer",
        "laser_scanner" to "Laser Barcode Scanner",
        "status_connected" to "Connected & Ready",
        "status_disconnected" to "Disconnected",
        "connect" to "Connect",
        "print_test" to "Print Test Waybill (ZPL/ESC)",
        "offline_mode" to "Offline Mode",
        "pending_sync" to "Operations Pending Sync",
        "sync_now" to "Sync Now",
        "language" to "Language",
        "theme" to "Theme",
        "dark_mode" to "Dark Mode",
        "light_mode" to "Light Mode"
    )
}

@Composable
fun ProvideLocalizedLayout(
    language: AppLanguage,
    content: @Composable () -> Unit
) {
    val layoutDirection = if (language == AppLanguage.ARABIC) LayoutDirection.Rtl else LayoutDirection.Ltr
    CompositionLocalProvider(
        LocalAppLanguage provides language,
        LocalLayoutDirection provides layoutDirection
    ) {
        content()
    }
}
