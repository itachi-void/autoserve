import 'package:flutter/material.dart';
import '../../core/localization/app_strings.dart';
import '../../core/models/models.dart';
import '../../core/theme/app_theme.dart';

class InventoryScreen extends StatefulWidget {
  final bool isArabic;

  const InventoryScreen({Key? key, required this.isArabic}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  String selectedBranch = 'فرع الرياض الرئيسي';
  String searchQuery = '';

  final List<ProductItem> inventoryList = const [
    ProductItem(
      id: 'prod-01',
      sku: 'COF-ETH-001',
      barcode: '6285001122334',
      nameEn: 'Ethiopian Yirgacheffe V60',
      nameAr: 'قهوة مختصة إثيوبية يرقاتشيفي V60',
      category: 'Specialty Coffee',
      sellPrice: 24.0,
      stock: 350,
      imageUrl: '',
    ),
    ProductItem(
      id: 'prod-02',
      sku: 'COF-COL-002',
      barcode: '6285002233445',
      nameEn: 'Colombian Geisha Cold Brew',
      nameAr: 'كولد برو كولومبي جيزا',
      category: 'Specialty Coffee',
      sellPrice: 32.0,
      stock: 140,
      imageUrl: '',
    ),
    ProductItem(
      id: 'prod-03',
      sku: 'BAK-CRO-003',
      barcode: '6285003344556',
      nameEn: 'Almond Butter Croissant',
      nameAr: 'كرواسون زبدة باللوز الفاخر',
      category: 'Artisan Bakery',
      sellPrice: 18.0,
      stock: 12, // Low stock warning!
      imageUrl: '',
    ),
    ProductItem(
      id: 'prod-04',
      sku: 'RET-TUM-004',
      barcode: '6285004455667',
      nameEn: 'Aura Thermal Tumbler 500ml',
      nameAr: 'كوب أورا الحراري المقاوم 500مل',
      category: 'Merchandise',
      sellPrice: 115.0,
      stock: 45,
      imageUrl: '',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = inventoryList.where((p) {
      final name = widget.isArabic ? p.nameAr : p.nameEn;
      return name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().contains(searchQuery.toLowerCase()) ||
          p.barcode.contains(searchQuery);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.get('inventory', isArabic: widget.isArabic)),
        actions: [
          DropdownButton<String>(
            value: selectedBranch,
            dropdownColor: AppTheme.darkSurface,
            underline: const SizedBox(),
            items: ['فرع الرياض الرئيسي', 'فرع كورنيش جدة'].map((b) {
              return DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontSize: 13)));
            }).toList(),
            onChanged: (val) => setState(() => selectedBranch = val!),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'ابحث بالاسم أو الباركود أو SKU...',
                prefixIcon: const Icon(Icons.search, color: AppTheme.primaryViolet),
                filled: true,
                fillColor: AppTheme.darkSurface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.darkBorder)),
              ),
              onChanged: (val) => setState(() => searchQuery = val),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, idx) {
                final p = filtered[idx];
                final isLowStock = p.stock < 20;

                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    leading: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryViolet.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.inventory_2, color: AppTheme.primaryViolet),
                    ),
                    title: Text(
                      widget.isArabic ? p.nameAr : p.nameEn,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    subtitle: Text(
                      'SKU: ${p.sku} • Barcode: ${p.barcode}\nسعر البيع: SAR ${p.sellPrice.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${p.stock} وحدة',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: isLowStock ? AppTheme.coralAccent : AppTheme.primaryMint,
                          ),
                        ),
                        if (isLowStock)
                          const Text(
                            'مخزون منخفض!',
                            style: TextStyle(fontSize: 10, color: AppTheme.coralAccent, fontWeight: FontWeight.bold),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
