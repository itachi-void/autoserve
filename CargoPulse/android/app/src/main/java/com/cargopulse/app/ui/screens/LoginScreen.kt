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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cargopulse.app.ui.localization.AppLanguage
import com.cargopulse.app.ui.localization.AppStrings
import com.cargopulse.app.ui.localization.LocalAppLanguage
import com.cargopulse.app.ui.theme.*

@Composable
fun LoginScreen(
    onLoginSuccess: (role: String) -> Unit,
    onLanguageToggle: () -> Unit
) {
    val lang = LocalAppLanguage.current
    var email by remember { mutableStateOf("admin@cargopulse.com") }
    var password by remember { mutableStateOf("Admin@123456") }
    var selectedRole by remember { mutableStateOf("Admin") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            colors = CardDefaults.cardColors(containerColor = NavySurface),
            shape = RoundedCornerShape(20.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header & Brand Logo
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .background(OrangePrimary.copy(alpha = 0.15f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalShipping,
                        contentDescription = "Logo",
                        tint = OrangePrimary,
                        modifier = Modifier.size(38.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = AppStrings.get("app_name", lang),
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )

                Text(
                    text = AppStrings.get("app_subtitle", lang),
                    fontSize = 13.sp,
                    color = TextSecondaryLight
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Role Selector Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(NavyCard, RoundedCornerShape(12.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("Admin", "Manager", "Driver").forEach { role ->
                        val isSelected = selectedRole == role
                        Button(
                            onClick = {
                                selectedRole = role
                                email = when (role) {
                                    "Admin" -> "admin@cargopulse.com"
                                    "Manager" -> "manager@cargopulse.com"
                                    else -> "driver@cargopulse.com"
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isSelected) OrangePrimary else Color.Transparent,
                                contentColor = if (isSelected) Color.White else TextSecondaryLight
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            Text(text = role, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Email field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text(AppStrings.get("email", lang), color = TextSecondaryLight) },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = OrangePrimary) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimaryLight,
                        unfocusedTextColor = TextPrimaryLight,
                        focusedBorderColor = OrangePrimary,
                        unfocusedBorderColor = NavyBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Password field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text(AppStrings.get("password", lang), color = TextSecondaryLight) },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = OrangePrimary) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimaryLight,
                        unfocusedTextColor = TextPrimaryLight,
                        focusedBorderColor = OrangePrimary,
                        unfocusedBorderColor = NavyBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(26.dp))

                // Login Button
                Button(
                    onClick = { onLoginSuccess(selectedRole) },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    Text(
                        text = AppStrings.get("login_btn", lang),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Language switcher link
                TextButton(onClick = onLanguageToggle) {
                    Text(
                        text = if (lang == AppLanguage.ARABIC) "Switch to English (LTR)" else "التحويل للغة العربية (RTL)",
                        color = OrangeLight,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}
