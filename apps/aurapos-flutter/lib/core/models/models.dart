class ProductItem {
  final String id;
  final String sku;
  final String barcode;
  final String nameEn;
  final String nameAr;
  final String category;
  final double sellPrice;
  final double taxRate;
  final int stock;
  final String imageUrl;

  const ProductItem({
    required this.id,
    required this.sku,
    required this.barcode,
    required this.nameEn,
    required this.nameAr,
    required this.category,
    required this.sellPrice,
    this.taxRate = 0.15,
    required this.stock,
    required this.imageUrl,
  });
}

class CartEntry {
  final ProductItem product;
  int quantity;
  double discount;

  CartEntry({
    required this.product,
    this.quantity = 1,
    this.discount = 0.0,
  });

  double get lineTotal => (product.sellPrice * quantity) - discount;
  double get taxAmount => lineTotal * product.taxRate;
}

class ShiftSummary {
  final String id;
  final String cashierName;
  final double openingBalance;
  double cashSales;
  double cardSales;
  bool isOpen;

  ShiftSummary({
    required this.id,
    required this.cashierName,
    required this.openingBalance,
    this.cashSales = 0.0,
    this.cardSales = 0.0,
    this.isOpen = true,
  });

  double get expectedCash => openingBalance + cashSales;
}
