import 'package:flutter/material.dart';
import 'core/hardware/esc_pos_printer.dart';
import 'core/localization/app_strings.dart';
import 'core/theme/app_theme.dart';
import 'features/inventory/inventory_screen.dart';
import 'features/register/pos_checkout_screen.dart';
import 'features/shifts/shifts_screen.dart';

void main() {
  runApp(const AuraPosApp());
}

class AuraPosApp extends StatefulWidget {
  const AuraPosApp({Key? key}) : super(key: key);

  @override
  State<AuraPosApp> createState() => _AuraPosAppState();
}

class _AuraPosAppState extends State<AuraPosApp> {
  bool isArabic = true;
  bool isDarkMode = true;
  int currentTabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraPOS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      builder: (context, child) {
        return Directionality(
          textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
          child: child!,
        );
      },
      home: Scaffold(
        appBar: AppBar(
          leading: const Padding(
            padding: EdgeInsets.all(8.0),
            child: CircleAvatar(
              backgroundColor: AppTheme.primaryViolet,
              child: Icon(Icons.point_of_sale, color: Colors.white, size: 20),
            ),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.get('app_name', isArabic: isArabic),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const Text(
                'فرع الرياض الرئيسي • كاشير: زيد المطيري',
                style: TextStyle(fontSize: 11, color: AppTheme.primaryMint),
              ),
            ],
          ),
          actions: [
            // Cash Drawer Pulse Button
            IconButton(
              tooltip: AppStrings.get('cash_drawer_kick', isArabic: isArabic),
              icon: const Icon(Icons.all_inbox, color: AppTheme.primaryMint),
              onPressed: () {
                EscPosPrinterAdapter.openCashDrawer();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isArabic ? 'تم إرسال نبضة فتح درج النقود RJ11' : 'Cash drawer pulse sent'),
                    backgroundColor: AppTheme.primaryMint,
                  ),
                );
              },
            ),
            // Language Switcher
            IconButton(
              tooltip: isArabic ? 'English (LTR)' : 'العربية (RTL)',
              icon: const Icon(Icons.language, color: AppTheme.primaryViolet),
              onPressed: () => setState(() => isArabic = !isArabic),
            ),
            // Theme Switcher
            IconButton(
              tooltip: isDarkMode ? 'Light Mode' : 'Dark Mode',
              icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
              onPressed: () => setState(() => isDarkMode = !isDarkMode),
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: IndexedStack(
          index: currentTabIndex,
          children: [
            PosCheckoutScreen(
              isArabic: isArabic,
              onOpenDrawer: () => EscPosPrinterAdapter.openCashDrawer(),
            ),
            ShiftsScreen(isArabic: isArabic),
            InventoryScreen(isArabic: isArabic),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: currentTabIndex,
          onDestinationSelected: (idx) => setState(() => currentTabIndex = idx),
          backgroundColor: AppTheme.darkSurface,
          indicatorColor: AppTheme.primaryViolet.withOpacity(0.2),
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.point_of_sale),
              label: AppStrings.get('pos', isArabic: isArabic),
            ),
            NavigationDestination(
              icon: const Icon(Icons.schedule),
              label: AppStrings.get('shifts', isArabic: isArabic),
            ),
            NavigationDestination(
              icon: const Icon(Icons.inventory_2),
              label: AppStrings.get('inventory', isArabic: isArabic),
            ),
          ],
        ),
      ),
    );
  }
}
