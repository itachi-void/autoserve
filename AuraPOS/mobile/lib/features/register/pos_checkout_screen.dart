import 'package:flutter/material.dart';
import '../../core/hardware/esc_pos_printer.dart';
import '../../core/localization/app_strings.dart';
import '../../core/models/models.dart';
import '../../core/theme/app_theme.dart';

class PosCheckoutScreen extends StatefulWidget {
  final bool isArabic;
  final VoidCallback onOpenDrawer;

  const PosCheckoutScreen({
    Key? key,
    required this.isArabic,
    required this.onOpenDrawer,
  }) : super(key: key);

  @override
  State<PosCheckoutScreen> createState() => _PosCheckoutScreenState();
}

class _PosCheckoutScreenState extends State<PosCheckoutScreen> {
  String selectedCategory = 'All';
  final List<CartEntry> cart = [];

  final List<ProductItem> products = const [
    ProductItem(
      id: 'prod-01',
      sku: 'COF-ETH-001',
      barcode: '6285001122334',
      nameEn: 'Ethiopian Yirgacheffe V60',
      nameAr: 'قهوة مختصة إثيوبية V60',
      category: 'Specialty Coffee',
      sellPrice: 24.0,
      stock: 350,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
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
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300',
    ),
    ProductItem(
      id: 'prod-03',
      sku: 'BAK-CRO-003',
      barcode: '6285003344556',
      nameEn: 'Almond Butter Croissant',
      nameAr: 'كرواسون زبدة باللوز الفاخر',
      category: 'Artisan Bakery',
      sellPrice: 18.0,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300',
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
      imageUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=300',
    ),
  ];

  double get subtotal => cart.fold(0.0, (sum, item) => sum + item.lineTotal);
  double get vatAmount => subtotal * 0.15;
  double get grandTotal => subtotal + vatAmount;

  void addToCart(ProductItem product) {
    setState(() {
      final index = cart.indexWhere((c) => c.product.id == product.id);
      if (index >= 0) {
        cart[index].quantity++;
      } else {
        cart.add(CartEntry(product: product, quantity: 1));
      }
    });
  }

  void completeSale(String paymentMethod) {
    if (cart.isEmpty) return;

    final invoiceNo = 'INV-${DateTime.now().year}-${(100000 + cart.length * 42).toString()}';
    EscPosPrinterAdapter.openCashDrawer();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.darkSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: AppTheme.primaryMint, size: 28),
            const SizedBox(width: 8),
            Text(
              widget.isArabic ? 'تمت العملية بنجاح' : 'Sale Completed',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${AppStrings.get('invoice_no', isArabic: widget.isArabic)}: $invoiceNo',
              style: const TextStyle(fontFamily: 'monospace', color: AppTheme.primaryViolet, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              '${AppStrings.get('total', isArabic: widget.isArabic)}: SAR ${grandTotal.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryMint),
            ),
            const SizedBox(height: 6),
            Text('طريقة الدفع: $paymentMethod • تم فتح درج النقود وإرسال أمر الطباعة الحرارية'),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  const Icon(Icons.qr_code_2, size: 80, color: Colors.black),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.get('zatca_qr', isArabic: widget.isArabic),
                    style: const TextStyle(fontSize: 10, color: Colors.black54, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryViolet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                cart.clear();
              });
            },
            child: Text(widget.isArabic ? 'فاتورة جديدة' : 'New Sale'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = selectedCategory == 'All'
        ? products
        : products.where((p) => p.category == selectedCategory).toList();

    return Row(
      children: [
        // 1. Left/Main Products Grid
        Expanded(
          flex: 3,
          child: Column(
            children: [
              // Categories Ribbon
              Container(
                height: 54,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: ['All', 'Specialty Coffee', 'Artisan Bakery', 'Merchandise'].map((cat) {
                    final isSel = selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSel,
                        label: Text(
                          cat == 'All' ? AppStrings.get('all_categories', isArabic: widget.isArabic) : cat,
                          style: TextStyle(
                            color: isSel ? Colors.white : AppTheme.textMuted,
                            fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                            fontSize: 12,
                          ),
                        ),
                        backgroundColor: AppTheme.darkSurface,
                        selectedColor: AppTheme.primaryViolet,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        side: BorderSide.none,
                        onSelected: (_) => setState(() => selectedCategory = cat),
                      ),
                    );
                  }).toList(),
                ),
              ),

              // Products Grid
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.85,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                  ),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, idx) {
                    final item = filtered[idx];
                    return InkWell(
                      onTap: () => addToCart(item),
                      borderRadius: BorderRadius.circular(16),
                      child: Card(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                  color: AppTheme.primaryViolet.withOpacity(0.1),
                                ),
                                child: Center(
                                  child: Icon(
                                    item.category == 'Specialty Coffee'
                                        ? Icons.coffee
                                        : item.category == 'Artisan Bakery'
                                            ? Icons.bakery_dining
                                            : Icons.shopping_bag,
                                    size: 44,
                                    color: AppTheme.primaryViolet,
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.isArabic ? item.nameAr : item.nameEn,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'SAR ${item.sellPrice.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryMint,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        '${AppStrings.get('stock', isArabic: widget.isArabic)}: ${item.stock}',
                                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
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
        ),

        // 2. Right Cart & Checkout Panel
        Expanded(
          flex: 2,
          child: Container(
            decoration: const BoxDecoration(
              color: AppTheme.darkSurface,
              border: Border(left: BorderSide(color: AppTheme.darkBorder, width: 1)),
            ),
            child: Column(
              children: [
                // Cart Header
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        AppStrings.get('cart', isArabic: widget.isArabic),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_sweep, color: AppTheme.coralAccent, size: 22),
                        onPressed: () => setState(() => cart.clear()),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: AppTheme.darkBorder),

                // Cart Line Items List
                Expanded(
                  child: cart.isEmpty
                      ? Center(
                          child: Text(
                            AppStrings.get('empty_cart', isArabic: widget.isArabic),
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(12),
                          itemCount: cart.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, idx) {
                            final entry = cart[idx];
                            return Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.isArabic ? entry.product.nameAr : entry.product.nameEn,
                                        maxLines: 1,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                                      ),
                                      Text(
                                        'SAR ${entry.product.sellPrice.toStringAsFixed(2)}',
                                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline, size: 18),
                                      onPressed: () {
                                        setState(() {
                                          if (entry.quantity > 1) {
                                            entry.quantity--;
                                          } else {
                                            cart.removeAt(idx);
                                          }
                                        });
                                      },
                                    ),
                                    Text('${entry.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline, size: 18, color: AppTheme.primaryViolet),
                                      onPressed: () => setState(() => entry.quantity++),
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                        ),
                ),

                const Divider(height: 1, color: AppTheme.darkBorder),

                // Financial Breakdown
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(AppStrings.get('subtotal', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted)),
                          Text('SAR ${subtotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(AppStrings.get('vat_15', isArabic: widget.isArabic), style: const TextStyle(color: AppTheme.textMuted)),
                          Text('SAR ${vatAmount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(AppStrings.get('total', isArabic: widget.isArabic), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(
                            'SAR ${grandTotal.toStringAsFixed(2)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryMint),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Pay Buttons
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryMint,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              onPressed: () => completeSale('MadaTap'),
                              child: Text(
                                AppStrings.get('pay_mada', isArabic: widget.isArabic),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryViolet,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              onPressed: () => completeSale('Cash'),
                              child: Text(
                                AppStrings.get('pay_cash', isArabic: widget.isArabic),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
