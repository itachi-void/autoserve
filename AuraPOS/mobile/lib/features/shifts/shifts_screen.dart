import 'package:flutter/material.dart';
import '../../core/hardware/esc_pos_printer.dart';
import '../../core/localization/app_strings.dart';
import '../../core/theme/app_theme.dart';

class ShiftsScreen extends StatefulWidget {
  final bool isArabic;

  const ShiftsScreen({Key? key, required this.isArabic}) : super(key: key);

  @override
  State<ShiftsScreen> createState() => _ShiftsScreenState();
}

class _ShiftsScreenState extends State<ShiftsScreen> {
  double openingBalance = 500.0;
  double cashSales = 840.0;
  double cardSales = 2450.0;
  late TextEditingController actualCashCtrl;
  bool isShiftClosed = false;

  @override
  void initState() {
    super.initState();
    actualCashCtrl = TextEditingController(text: (openingBalance + cashSales).toStringAsFixed(2));
  }

  @override
  void dispose() {
    actualCashCtrl.dispose();
    super.dispose();
  }

  double get expectedCash => openingBalance + cashSales;
  double get countedCash => double.tryParse(actualCashCtrl.text) ?? expectedCash;
  double get difference => countedCash - expectedCash;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.get('shifts', isArabic: widget.isArabic)),
        actions: [
          IconButton(
            tooltip: AppStrings.get('cash_drawer_kick', isArabic: widget.isArabic),
            icon: const Icon(Icons.point_of_sale, color: AppTheme.primaryMint),
            onPressed: () {
              EscPosPrinterAdapter.openCashDrawer();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(widget.isArabic ? 'تم إرسال إشارة فتح درج النقود الإلكتروني' : 'Cash drawer pulse sent'),
                  backgroundColor: AppTheme.primaryMint,
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'كاشير: زيد المطيري • فرع التحلية الرئيسي',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'تاريخ فتح الوردية: اليوم 08:00 صباحاً',
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: (isShiftClosed ? AppTheme.amberWarning : AppTheme.primaryMint).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        isShiftClosed ? 'تم إغلاق الوردية' : 'وردية نشطة (Open)',
                        style: TextStyle(
                          color: isShiftClosed ? AppTheme.amberWarning : AppTheme.primaryMint,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Financial Summary Grid
            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(AppStrings.get('opening_cash', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('SAR ${openingBalance.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'monospace')),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(AppStrings.get('cash_sales', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('SAR ${cashSales.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'monospace', color: AppTheme.primaryMint)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(AppStrings.get('card_sales', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('SAR ${cardSales.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'monospace', color: AppTheme.primaryViolet)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(AppStrings.get('expected_cash', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('SAR ${expectedCash.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'monospace', color: AppTheme.amberWarning)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Cash Drawer Count Section
            Text(
              'جرد الصندوق ومطابقة النقدية (Drawer Cash Reconciliation):',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: actualCashCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: AppStrings.get('actual_cash', isArabic: widget.isArabic),
                prefixText: 'SAR ',
                filled: true,
                fillColor: AppTheme.darkSurface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.darkBorder)),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),

            // Reconciliation Status Alert
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: (difference == 0 ? AppTheme.primaryMint : AppTheme.coralAccent).withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: difference == 0 ? AppTheme.primaryMint : AppTheme.coralAccent, width: 1),
              ),
              child: Row(
                children: [
                  Icon(difference == 0 ? Icons.check_circle : Icons.warning, color: difference == 0 ? AppTheme.primaryMint : AppTheme.coralAccent),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      difference == 0
                          ? AppStrings.get('reconciled', isArabic: widget.isArabic)
                          : 'يوجد فارق في الجرد بمقدار: SAR ${difference.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: difference == 0 ? AppTheme.primaryMint : AppTheme.coralAccent,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Close Shift Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryViolet,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.receipt_long, color: Colors.white),
                label: Text(
                  AppStrings.get('close_shift', isArabic: widget.isArabic),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                ),
                onPressed: () {
                  setState(() => isShiftClosed = true);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('تم إصدار تقرير الإغلاق Z-Report بنجاح وطباعته'),
                      backgroundColor: AppTheme.primaryMint,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
