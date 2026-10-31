package com.cargopulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.cargopulse.app.ui.localization.*
import com.cargopulse.app.ui.screens.*
import com.cargopulse.app.ui.theme.*

enum class Screen {
    LOGIN,
    DASHBOARD,
    SCANNER,
    POD,
    HARDWARE,
    DETAIL,
    SETTINGS
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var currentLanguage by remember { mutableStateOf(AppLanguage.ARABIC) }
            var isDarkTheme by remember { mutableStateOf(true) }
            var currentScreen by remember { mutableStateOf(Screen.DASHBOARD) }
            var userRole by remember { mutableStateOf("Admin") }
            var selectedTrackingNumber by remember { mutableStateOf("CP-882190-SA") }

            ProvideLocalizedLayout(language = currentLanguage) {
                CargoPulseTheme(darkTheme = isDarkTheme) {
                    Scaffold(
                        bottomBar = {
                            if (currentScreen != Screen.LOGIN) {
                                NavigationBar(
                                    containerColor = NavySurface,
                                    contentColor = TextPrimaryLight
                                ) {
                                    NavigationBarItem(
                                        selected = currentScreen == Screen.DASHBOARD,
                                        onClick = { currentScreen = Screen.DASHBOARD },
                                        icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                                        label = { Text(AppStrings.get("dashboard", currentLanguage)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = OrangePrimary,
                                            selectedTextColor = OrangePrimary,
                                            indicatorColor = OrangePrimary.copy(alpha = 0.2f),
                                            unselectedIconColor = TextSecondaryLight,
                                            unselectedTextColor = TextSecondaryLight
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentScreen == Screen.SCANNER,
                                        onClick = { currentScreen = Screen.SCANNER },
                                        icon = { Icon(Icons.Default.QrCodeScanner, contentDescription = null) },
                                        label = { Text(AppStrings.get("scanner", currentLanguage)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = OrangePrimary,
                                            selectedTextColor = OrangePrimary,
                                            indicatorColor = OrangePrimary.copy(alpha = 0.2f),
                                            unselectedIconColor = TextSecondaryLight,
                                            unselectedTextColor = TextSecondaryLight
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentScreen == Screen.HARDWARE,
                                        onClick = { currentScreen = Screen.HARDWARE },
                                        icon = { Icon(Icons.Default.Print, contentDescription = null) },
                                        label = { Text(AppStrings.get("hardware", currentLanguage)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = OrangePrimary,
                                            selectedTextColor = OrangePrimary,
                                            indicatorColor = OrangePrimary.copy(alpha = 0.2f),
                                            unselectedIconColor = TextSecondaryLight,
                                            unselectedTextColor = TextSecondaryLight
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentScreen == Screen.SETTINGS,
                                        onClick = { currentScreen = Screen.SETTINGS },
                                        icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                                        label = { Text(AppStrings.get("settings", currentLanguage)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = OrangePrimary,
                                            selectedTextColor = OrangePrimary,
                                            indicatorColor = OrangePrimary.copy(alpha = 0.2f),
                                            unselectedIconColor = TextSecondaryLight,
                                            unselectedTextColor = TextSecondaryLight
                                        )
                                    )
                                }
                            }
                        }
                    ) { innerPadding ->
                        Box(modifier = Modifier.padding(innerPadding)) {
                            when (currentScreen) {
                                Screen.LOGIN -> LoginScreen(
                                    onLoginSuccess = { role ->
                                        userRole = role
                                        currentScreen = Screen.DASHBOARD
                                    },
                                    onLanguageToggle = {
                                        currentLanguage = if (currentLanguage == AppLanguage.ARABIC) AppLanguage.ENGLISH else AppLanguage.ARABIC
                                    }
                                )
                                Screen.DASHBOARD -> DashboardScreen(
                                    userRole = userRole,
                                    onNavigateToShipments = { currentScreen = Screen.DETAIL },
                                    onNavigateToScanner = { currentScreen = Screen.SCANNER },
                                    onNavigateToHardware = { currentScreen = Screen.HARDWARE },
                                    onShipmentSelected = { tracking ->
                                        selectedTrackingNumber = tracking
                                        currentScreen = Screen.DETAIL
                                    }
                                )
                                Screen.SCANNER -> WarehouseScannerScreen(
                                    onBack = { currentScreen = Screen.DASHBOARD },
                                    onShipmentScanned = { tracking ->
                                        selectedTrackingNumber = tracking
                                        currentScreen = Screen.DETAIL
                                    }
                                )
                                Screen.DETAIL -> ShipmentDetailScreen(
                                    trackingNumber = selectedTrackingNumber,
                                    onBack = { currentScreen = Screen.DASHBOARD },
                                    onCapturePod = { currentScreen = Screen.POD }
                                )
                                Screen.POD -> ProofOfDeliveryScreen(
                                    trackingNumber = selectedTrackingNumber,
                                    codAmount = 650.0,
                                    onBack = { currentScreen = Screen.DETAIL },
                                    onDeliveryConfirmed = { currentScreen = Screen.DASHBOARD }
                                )
                                Screen.HARDWARE -> HardwareScreen(
                                    onBack = { currentScreen = Screen.DASHBOARD }
                                )
                                Screen.SETTINGS -> SettingsScreen(
                                    currentLanguage = currentLanguage,
                                    isDarkTheme = isDarkTheme,
                                    onLanguageChange = { currentLanguage = it },
                                    onThemeChange = { isDarkTheme = it },
                                    onLogout = { currentScreen = Screen.LOGIN }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
