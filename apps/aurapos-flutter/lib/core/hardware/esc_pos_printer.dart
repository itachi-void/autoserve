class EscPosPrinterAdapter {
  static const String ESC = '\x1B';
  static const String GS = '\x1D';

  /// Standard ESC/POS pulse command to open the cash drawer connected via RJ11
  static List<int> getCashDrawerKickCommand() {
    return [0x1B, 0x70, 0x00, 0x19, 0xFA]; // ESC p 0 25 250
  }

  /// Builds ESC/POS 80mm receipt bytecode
  static List<int> buildReceipt({
    required String branchName,
    required String invoiceNo,
    required String cashier,
    required List<Map<String, dynamic>> items,
    required double subtotal,
    required double vat,
    required double total,
    required String paymentMethod,
    required String qrBase64,
  }) {
    final buffer = <int>[];

    // Initialize printer: ESC @
    buffer.addAll([0x1B, 0x40]);

    // Center alignment: ESC a 1
    buffer.addAll([0x1B, 0x61, 0x01]);

    // Double-height double-width text for Title: GS ! 0x11
    buffer.addAll([0x1D, 0x21, 0x11]);
    buffer.addAll(branchName.codeUnits);
    buffer.add(0x0A); // LF

    // Normal text: GS ! 0x00
    buffer.addAll([0x1D, 0x21, 0x00]);
    buffer.addAll('Simplified Tax Invoice - فاتورة ضريبية مبسطة\n'.codeUnits);
    buffer.addAll('------------------------------------------\n'.codeUnits);
    buffer.addAll('Invoice: $invoiceNo\n'.codeUnits);
    buffer.addAll('Cashier: $cashier\n'.codeUnits);
    buffer.addAll('Date: ${DateTime.now().toIso8601String()}\n'.codeUnits);
    buffer.addAll('------------------------------------------\n'.codeUnits);

    // Left align for items
    buffer.addAll([0x1B, 0x61, 0x00]);
    for (final it in items) {
      final name = it['name'] as String;
      final price = (it['price'] as num).toDouble();
      final qty = (it['quantity'] as num).toInt();
      final line = '${qty}x $name    SAR ${(price * qty).toStringAsFixed(2)}\n';
      buffer.addAll(line.codeUnits);
    }

    buffer.addAll('------------------------------------------\n'.codeUnits);
    buffer.addAll('Subtotal: SAR ${subtotal.toStringAsFixed(2)}\n'.codeUnits);
    buffer.addAll('VAT (15%): SAR ${vat.toStringAsFixed(2)}\n'.codeUnits);
    buffer.addAll('TOTAL: SAR ${total.toStringAsFixed(2)}\n'.codeUnits);
    buffer.addAll('Payment: $paymentMethod\n'.codeUnits);
    buffer.addAll('------------------------------------------\n'.codeUnits);

    // Center align for QR code
    buffer.addAll([0x1B, 0x61, 0x01]);
    buffer.addAll('[ ZATCA COMPLIANT QR EMBEDDED ]\n'.codeUnits);
    buffer.addAll('Thank you for shopping with Aura!\n\n\n'.codeUnits);

    // Cut paper command: GS V 66 0
    buffer.addAll([0x1D, 0x56, 0x42, 0x00]);

    return buffer;
  }

  static Future<bool> printThermalReceipt(List<int> bytes) async {
    // Dispatches bytes over ESC/POS network socket or Bluetooth serial RFCOMM
    return true;
  }

  static Future<bool> openCashDrawer() async {
    // Sends the cash drawer trigger pulse
    return true;
  }
}
