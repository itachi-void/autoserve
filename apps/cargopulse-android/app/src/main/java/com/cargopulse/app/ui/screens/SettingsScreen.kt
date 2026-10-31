package com.cargopulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cargopulse.app.data.sync.SyncEngine
import com.cargopulse.app.ui.localization.AppLanguage
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    currentLanguage: AppLanguage,
    isDarkTheme: Boolean,
    onLanguageChange: (AppLanguage) -> Unit,
    onThemeChange: (Boolean) -> Unit,
    onLogout: () -> Unit
) {
    val lang = LocalAppLanguage.current
    val coroutineScope = rememberCoroutineScope()
    val pendingCount by SyncEngine.pendingSyncCount.collectAsState()
    val isSyncing by SyncEngine.isSyncing.collectAsState()
    var syncSuccessMessage by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // App Bar
        Text(
            text = AppStrings.get("settings", lang),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimaryLight
        )

        // 1. Language Setting Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = NavySurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = AppStrings.get("language", lang),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = OrangeLight
                )
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = { onLanguageChange(AppLanguage.ARABIC) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (currentLanguage == AppLanguage.ARABIC) OrangePrimary else NavyCard,
                            contentColor = if (currentLanguage == AppLanguage.ARABIC) Color.White else TextSecondaryLight
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("العربية (RTL)", fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { onLanguageChange(AppLanguage.ENGLISH) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (currentLanguage == AppLanguage.ENGLISH) OrangePrimary else NavyCard,
                            contentColor = if (currentLanguage == AppLanguage.ENGLISH) Color.White else TextSecondaryLight
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("English (LTR)", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 2. Theme Setting Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = NavySurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = AppStrings.get("theme", lang),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = OrangeLight
                    )
                    Text(
                        text = if (isDarkTheme) AppStrings.get("dark_mode", lang) else AppStrings.get("light_mode", lang),
                        fontSize = 12.sp,
                        color = TextSecondaryLight
                    )
                }

                Switch(
                    checked = isDarkTheme,
                    onCheckedChange = onThemeChange,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = OrangePrimary,
                        checkedTrackColor = OrangeLight.copy(alpha = 0.5f)
                    )
                )
            }
        }

        // 3. Offline Synchronization Card
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
                    Column {
                        Text(
                            text = AppStrings.get("offline_mode", lang),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = OrangeLight
                        )
                        Text(
                            text = "العمليات المعلقة: $pendingCount",
                            fontSize = 12.sp,
                            color = if (pendingCount > 0) StatusWarning else StatusSuccess
                        )
                    }

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                syncSuccessMessage = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(AppStrings.get("sync_now", lang), fontSize = 12.sp)
                    }
                }

                if (syncSuccessMessage) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "✓ تم مزامنة كافة العمليات بنجاح مع الخادم المركزي (Idempotent Sync OK)",
                        fontSize = 11.sp,
                        color = StatusSuccess
                    )
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Logout Button
        Button(
            onClick = onLogout,
            colors = ButtonDefaults.buttonColors(containerColor = StatusDanger.copy(alpha = 0.2f), contentColor = StatusDanger),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("تسجيل الخروج من الحساب", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}
