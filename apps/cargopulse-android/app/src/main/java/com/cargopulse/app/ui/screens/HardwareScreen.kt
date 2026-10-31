package com.cargopulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

@Composable
fun HardwareScreen(
    onBack: () -> Unit
) {
    val lang = LocalAppLanguage.current
    var testPrintSuccess by remember { mutableStateOf(false) }
    val printers = remember { BluetoothPrinterAdapter.getDiscoveredPrinters() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
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
                text = AppStrings.get("hardware", lang),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimaryLight
            )
        }

        // Section: Bluetooth Printers
        Text(
            text = "طابعات البوالص الحرارية (Bluetooth ZPL / ESC-POS)",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = OrangeLight
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(printers) { printer ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = printer.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimaryLight
                            )
                            Text(
                                text = "MAC: ${printer.address}",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = TextSecondaryLight
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (printer.isConnected) AppStrings.get("status_connected", lang) else AppStrings.get("status_disconnected", lang),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (printer.isConnected) StatusSuccess else TextMutedLight
                            )
                        }

                        if (printer.isConnected) {
                            Button(
                                onClick = {
                                    val zpl = BluetoothPrinterAdapter.generateZplWaybill(
                                        trackingNumber = "CP-882190-SA",
                                        senderName = "Al-Badr Tech",
                                        senderCity = "Riyadh",
                                        recipientName = "Abdullah Al-Qahtani",
                                        recipientCity = "Jeddah",
                                        recipientPhone = "+966559988776",
                                        weightKg = 5.2,
                                        codAmount = 650.0
                                    )
                                    testPrintSuccess = BluetoothPrinterAdapter.printWaybill(zpl)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("طباعة تجريبية", fontSize = 12.sp)
                            }
                        } else {
                            OutlinedButton(
                                onClick = { BluetoothPrinterAdapter.connect(printer.address) },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("ربط الجهاز", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "قارئات الباركود المدعومة (Scanners)",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = OrangeLight
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "كاميرا الهاتف (CameraX / ML Kit) + ماسحات الليزر الخارجية",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "يدعم القراءة الفورية للأكواد: Code 128, EAN-13, QR Code, DataMatrix، مع استقبال إشارات Zebra DataWedge تلقائياً.",
                            fontSize = 11.sp,
                            color = TextSecondaryLight
                        )
                    }
                }
            }
        }

        if (testPrintSuccess) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StatusSuccess.copy(alpha = 0.2f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "تم إرسال أمر الطباعة ZPL 4x6 بنجاح عبر قناة البلوتوث!",
                        fontSize = 12.sp,
                        color = StatusSuccess,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
