package com.cargopulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cargopulse.app.hardware.BluetoothPrinterAdapter
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*

data class TimelineEvent(
    val status: String,
    val actor: String,
    val location: String,
    val time: String,
    val notes: String
)

@Composable
fun ShipmentDetailScreen(
    trackingNumber: String,
    onBack: () -> Unit,
    onCapturePod: () -> Unit
) {
    val lang = LocalAppLanguage.current

    val events = listOf(
        TimelineEvent("خرج للتوصيل (Out for Delivery)", "مندوب التوصيل: سامي العتيبي", "جدة - حي الروضة", "منذ ساعتين", "تم استلام الشحنة وتحميلها في سيارة التوزيع"),
        TimelineEvent("وصل لمركز الفرز (Arrived at Hub)", "مدير المستودع: خالد الحربي", "مستودع ميناء جدة (JED-02)", "أمس 10:30 م", "تم فحص الباركود ومطابقة الوزن 5.2 كجم"),
        TimelineEvent("في الطريق (In Transit)", "سائق النقل بين المدن", "طريق مكة السريع", "أمس 04:15 م", "نقل بين المراكز اللوجستية شاحنة رقم 44"),
        TimelineEvent("تم الاستلام في المستودع (Received)", "مشغل المستودع", "مركز الرياض المركزي (RUH-01)", "قبل يومين", "استلام وتسجيل الشحنة من المرسل")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // App Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimaryLight)
            }
            Text(
                text = "تفاصيل الشحنة $trackingNumber",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = TextPrimaryLight
            )
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.weight(1f)
        ) {
            // Main Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = trackingNumber,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = OrangePrimary
                            )
                            Badge(containerColor = StatusInfo) {
                                Text("خرج للتوصيل", color = Color.White, modifier = Modifier.padding(4.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("المرسل:", fontSize = 11.sp, color = TextSecondaryLight)
                                Text("شركة البدر للتقنية", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                                Text("الرياض - أبراج العليا", fontSize = 11.sp, color = TextSecondaryLight)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("المستلم:", fontSize = 11.sp, color = TextSecondaryLight)
                                Text("عبدالله القحطاني", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                                Text("جدة - حي الروضة", fontSize = 11.sp, color = TextSecondaryLight)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = NavyBorder)
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("الوزن: 5.2 كجم (حجمي: 2.6 كجم)", fontSize = 11.sp, color = TextSecondaryLight)
                            Text("التحصيل عند الاستلام: SAR 650.00", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = StatusWarning)
                        }
                    }
                }
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onCapturePod,
                        colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("تسجيل التسليم (POD)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = {
                            val zpl = BluetoothPrinterAdapter.generateZplWaybill(
                                trackingNumber = trackingNumber,
                                senderName = "Al-Badr Tech",
                                senderCity = "Riyadh",
                                recipientName = "Abdullah Al-Qahtani",
                                recipientCity = "Jeddah",
                                recipientPhone = "+966559988776",
                                weightKg = 5.2,
                                codAmount = 650.0
                            )
                            BluetoothPrinterAdapter.printWaybill(zpl)
                        },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = OrangeLight),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("طباعة بوليصة ZPL", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Timeline Header
            item {
                Text(
                    text = "سجل التتبع والعمليات (Shipment Lifecycle):",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )
            }

            // Events List
            items(events) { ev ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = ev.status, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
                            Text(text = ev.time, fontSize = 11.sp, color = TextSecondaryLight)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "${ev.location} • ${ev.actor}", fontSize = 11.sp, color = TextPrimaryLight)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(text = ev.notes, fontSize = 11.sp, color = TextSecondaryLight)
                    }
                }
            }
        }
    }
}
