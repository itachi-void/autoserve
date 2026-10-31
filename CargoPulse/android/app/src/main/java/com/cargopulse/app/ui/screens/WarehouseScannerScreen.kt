package com.cargopulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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
import com.cargopulse.app.hardware.BarcodeScannerAdapter
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*

@Composable
fun WarehouseScannerScreen(
    onBack: () -> Unit,
    onShipmentScanned: (tracking: String) -> Unit
) {
    val lang = LocalAppLanguage.current
    var lastScannedCode by remember { mutableStateOf("CP-882190-SA") }
    var scanMode by remember { mutableStateOf("PUTAWAY") } // "RECEIVING", "PUTAWAY", "DISPATCH"
    var assignedBin by remember { mutableStateOf("A-01-01") }
    var scanCount by remember { mutableStateOf(14) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimaryLight)
            }
            Text(
                text = AppStrings.get("scanner", lang),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimaryLight
            )
            Spacer(modifier = Modifier.weight(1f))
            Badge(containerColor = OrangePrimary) {
                Text("MODE: $scanMode", color = Color.White, modifier = Modifier.padding(4.dp))
            }
        }

        // Camera / Laser Viewfinder Area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(NavySurface, RoundedCornerShape(16.dp))
                .border(2.dp, OrangePrimary, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            // Reticle Target Box
            Box(
                modifier = Modifier
                    .size(200.dp, 120.dp)
                    .border(2.dp, Color.Red.copy(alpha = 0.8f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "وجه الكاميرا أو الماسح للباركود",
                    color = Color.White.copy(alpha = 0.6f),
                    fontSize = 11.sp
                )
            }

            // Laser scanner active status badge
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 12.dp)
                    .background(NavyDark.copy(alpha = 0.85f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(StatusSuccess, RoundedCornerShape(4.dp))
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Honeywell Laser Wedge Active",
                    fontSize = 11.sp,
                    color = TextPrimaryLight
                )
            }
        }

        // Last Scanned Result Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = NavySurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("آخر مسح تم التحقق منه:", fontSize = 12.sp, color = TextSecondaryLight)
                    Text("تم الفحص: $scanCount طرد", fontSize = 12.sp, color = StatusSuccess)
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = lastScannedCode,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = OrangePrimary
                )

                Text(
                    text = "الوجهة: جدة • المستلم: عبدالله القحطاني • الرف المحدد: $assignedBin",
                    fontSize = 12.sp,
                    color = TextPrimaryLight
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            scanCount++
                            lastScannedCode = "CP-" + (100000..999999).random() + "-SA"
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("تأكيد التخزين بالرف", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = { onShipmentScanned(lastScannedCode) },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimaryLight),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("فتح تفاصيل الطرد", fontSize = 12.sp)
                    }
                }
            }
        }

        // Fast Barcode Simulation Buttons (for fast manual testing)
        Text("محاكاة مسح الأكواد السريعة:", fontSize = 12.sp, color = TextSecondaryLight)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("CP-882190-SA", "CP-441029-SA", "CP-319802-SA").forEach { code ->
                Button(
                    onClick = {
                        lastScannedCode = code
                        onShipmentScanned(code)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyCard),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 6.dp)
                ) {
                    Text(text = code.substring(3, 9), fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = OrangeLight)
                }
            }
        }
    }
}
