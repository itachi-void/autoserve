package com.cargopulse.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = OrangePrimary,
    onPrimary = Color.White,
    primaryContainer = OrangeLight,
    onPrimaryContainer = NavyDark,
    background = NavyDark,
    onBackground = TextPrimaryLight,
    surface = NavySurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = NavyCard,
    onSurfaceVariant = TextSecondaryLight,
    outline = NavyBorder
)

private val LightColorScheme = lightColorScheme(
    primary = OrangePrimary,
    onPrimary = Color.White,
    primaryContainer = OrangeLight,
    onPrimaryContainer = NavyDark,
    background = LightBackground,
    onBackground = TextPrimaryDark,
    surface = LightSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = LightCard,
    onSurfaceVariant = TextSecondaryDark,
    outline = LightBorder
)

@Composable
fun CargoPulseTheme(
    darkTheme: Boolean = true, // Default to operational dark mode
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
