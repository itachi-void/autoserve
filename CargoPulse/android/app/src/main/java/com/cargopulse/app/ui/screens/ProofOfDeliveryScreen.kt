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
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*

@Composable
fun ProofOfDeliveryScreen(
    trackingNumber: String,
    codAmount: Double,
    onBack: () -> Unit,
    onDeliveryConfirmed: () -> Unit
) {
    val lang = LocalAppLanguage.current
    var recipientName by remember { mutableStateOf("عبدالله القحطاني") }
    var codCollected by remember { mutableStateOf(true) }
    var hasSigned by remember { mutableStateOf(true) }
    var hasPhoto by remember { mutableStateOf(true) }
    var notes by remember { mutableStateOf("تم التسليم للعميل شخصياً عند مدخل المنزل") }

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
                text = AppStrings.get("pod_title", lang),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimaryLight
            )
        }

        // Shipment Overview Card
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
                    Text("الشحنة المستهدفة:", fontSize = 11.sp, color = TextSecondaryLight)
                    Text(
                        text = trackingNumber,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = OrangePrimary
                    )
                }

                if (codAmount > 0) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("مبلغ التحصيل (COD):", fontSize = 11.sp, color = TextSecondaryLight)
                        Text(
                            text = "SAR $codAmount",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = StatusWarning
                        )
                    }
                }
            }
        }

        // Recipient Name Field
        OutlinedTextField(
            value = recipientName,
            onValueChange = { recipientName = it },
            label = { Text(AppStrings.get("recipient_name", lang), color = TextSecondaryLight) },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = OrangePrimary) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = TextPrimaryLight,
                unfocusedTextColor = TextPrimaryLight,
                focusedBorderColor = OrangePrimary,
                unfocusedBorderColor = NavyBorder
            ),
            modifier = Modifier.fillMaxWidth()
        )

        // Digital Signature Box
        Text(AppStrings.get("signature_required", lang), fontSize = 13.sp, color = TextSecondaryLight)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(110.dp)
                .background(NavySurface, RoundedCornerShape(12.dp))
                .border(1.dp, if (hasSigned) StatusSuccess else NavyBorder, RoundedCornerShape(12.dp))
                .padding(12.dp),
            contentAlignment = Alignment.Center
        ) {
            if (hasSigned) {
                Text(
                    text = "✍️ عبدالله القحطاني (توقيع رقمي موثق ومختوم)",
                    color = StatusSuccess,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            } else {
                Text("المس الشاشة للتوقيع الرقمي", color = TextSecondaryLight, fontSize = 12.sp)
            }
        }

        // Photo Proof & GPS Stamp
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(90.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(10.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.CameraAlt, contentDescription = null, tint = StatusSuccess)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("تم التقاط صورة الطرد", fontSize = 11.sp, color = TextPrimaryLight)
                }
            }

            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(90.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(10.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = StatusInfo)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("GPS: 24.7742, 46.7385", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = TextSecondaryLight)
                }
            }
        }

        // COD Checkbox
        if (codAmount > 0) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(NavySurface, RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = codCollected,
                    onCheckedChange = { codCollected = it },
                    colors = CheckboxDefaults.colors(checkedColor = StatusSuccess)
                )
                Text(
                    text = "تم استلام المبلغ نقداً من العميل (SAR $codAmount)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimaryLight
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Confirm Button
        Button(
            onClick = onDeliveryConfirmed,
            colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = AppStrings.get("confirm_delivery", lang),
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}
