package com.cargopulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*

data class DashboardShipmentSummary(
    val trackingNumber: String,
    val senderCity: String,
    val recipientName: String,
    val recipientCity: String,
    val status: String,
    val codAmount: Double,
    val isCodCollected: Boolean,
    val binCode: String
)

@Composable
fun DashboardScreen(
    userRole: String,
    onNavigateToShipments: () -> Unit,
    onNavigateToScanner: () -> Unit,
    onNavigateToHardware: () -> Unit,
    onShipmentSelected: (tracking: String) -> Unit
) {
    val lang = LocalAppLanguage.current

    val sampleShipments = listOf(
        DashboardShipmentSummary("CP-882190-SA", "Riyadh", "Abdullah Al-Qahtani", "Jeddah", "Out for Delivery", 650.0, false, "A-01-01"),
        DashboardShipmentSummary("CP-441029-SA", "Dammam", "Mohammed Al-Shehri", "Riyadh", "Delivered", 0.0, true, "A-01-02"),
        DashboardShipmentSummary("CP-319802-SA", "Jeddah", "Fahad Al-Dossary", "Dammam", "Received", 1200.0, false, "B-03-04"),
        DashboardShipmentSummary("CP-771245-SA", "Riyadh", "Sultan Al-Otaibi", "Medina", "Sorted", 340.0, false, "A-02-01")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Top Operations Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "RUH-HUB-01 • الرياض المركزي",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = OrangePrimary
                        )
                        Text(
                            text = AppStrings.get("dashboard", lang),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "الدور التشغيلي: $userRole",
                            fontSize = 12.sp,
                            color = TextSecondaryLight
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(NavyCard, RoundedCornerShape(10.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "100% ONLINE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = StatusSuccess
                        )
                    }
                }
            }
        }

        // 2. Metrics 2x2 Grid (StatCards)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCardItem(
                        title = AppStrings.get("active_shipments", lang),
                        value = "1,428",
                        sub = "+18% اليوم",
                        accentColor = OrangePrimary,
                        modifier = Modifier.weight(1f)
                    )
                    StatCardItem(
                        title = AppStrings.get("out_for_delivery", lang),
                        value = "312",
                        sub = "24 شاحنة",
                        accentColor = StatusInfo,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCardItem(
                        title = AppStrings.get("delivered_today", lang),
                        value = "896",
                        sub = "نسبة الإنجاز 98.4%",
                        accentColor = StatusSuccess,
                        modifier = Modifier.weight(1f)
                    )
                    StatCardItem(
                        title = AppStrings.get("cod_collected", lang),
                        value = "SAR 42.8K",
                        sub = "مطابقة بدون فروقات",
                        accentColor = StatusWarning,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 3. Quick Action Buttons
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onNavigateToScanner,
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(AppStrings.get("scanner", lang), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onNavigateToHardware,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimaryLight),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                ) {
                    Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(18.dp), tint = OrangeLight)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(AppStrings.get("hardware", lang), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 4. Live Shipments Section Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = AppStrings.get("shipments", lang),
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )
                Text(
                    text = "عرض الكل ←",
                    fontSize = 13.sp,
                    color = OrangeLight,
                    modifier = Modifier.clickable { onNavigateToShipments() }
                )
            }
        }

        // 5. Shipment Cards Feed
        items(sampleShipments) { item ->
            ShipmentCard(item = item, onClick = { onShipmentSelected(item.trackingNumber) })
        }
    }
}

@Composable
fun StatCardItem(
    title: String,
    value: String,
    sub: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = NavySurface),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, fontSize = 11.sp, color = TextSecondaryLight)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = accentColor
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = sub, fontSize = 10.sp, color = TextMutedLight)
        }
    }
}

@Composable
fun ShipmentCard(
    item: DashboardShipmentSummary,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = NavySurface),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.trackingNumber,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = OrangePrimary
                )

                val statusColor = when (item.status) {
                    "Delivered" -> StatusSuccess
                    "Out for Delivery" -> StatusInfo
                    "Received" -> StatusWarning
                    else -> StatusInfo
                }

                Box(
                    modifier = Modifier
                        .background(statusColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = item.status,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = statusColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "${item.senderCity} ➔ ${item.recipientCity} • ${item.recipientName}",
                fontSize = 12.sp,
                color = TextPrimaryLight
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "رف: ${item.binCode}",
                    fontSize = 11.sp,
                    color = TextSecondaryLight
                )
                if (item.codAmount > 0) {
                    Text(
                        text = "COD: SAR ${item.codAmount}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = StatusWarning
                    )
                }
            }
        }
    }
}
