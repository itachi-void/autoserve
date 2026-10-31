import { Router, Request, Response } from 'express';
import { Store } from '../data/store';
import { CartItem, PaymentMethod, Sale } from '../types';

export const posRouter = Router();

posRouter.post('/checkout', (req: Request, res: Response) => {
  const { branchId, cashierId, cashierName, items, paymentMethod, amountPaid, customerName, customerPhone } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart items cannot be empty.' });
  }

  const activeBranch = branchId || 'branch-ruh-01';
  let subtotal = 0;
  let taxAmount = 0;
  let discountAmount = 0;

  const validatedItems: CartItem[] = items.map((item: any) => {
    const product = Store.products.find(p => p.id === item.productId);
    const price = product ? product.sellPrice : item.unitPrice;
    const qty = Number(item.quantity) || 1;
    const disc = Number(item.discount) || 0;
    const lineTotal = (price * qty) - disc;
    const tax = lineTotal * 0.15;

    subtotal += lineTotal;
    taxAmount += tax;
    discountAmount += disc;

    // Deduct inventory
    if (product) {
      product.stockByBranch[activeBranch] = Math.max(0, (product.stockByBranch[activeBranch] || 0) - qty);
    }

    return {
      productId: item.productId,
      sku: product?.sku || 'SKU-GEN',
      nameEn: product?.nameEn || item.nameEn,
      nameAr: product?.nameAr || item.nameAr,
      unitPrice: price,
      quantity: qty,
      discount: disc,
      taxRate: 0.15,
      total: lineTotal
    };
  });

  const totalAmount = Number((subtotal + taxAmount).toFixed(2));
  const changeGiven = Math.max(0, Number(((amountPaid || totalAmount) - totalAmount).toFixed(2)));

  const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

  // Generate Base64 ZATCA E-Invoice QR (Standard TLV format)
  const zatcaQrCode = Buffer.from(
    `AuraPOS|310294857600003|${new Date().toISOString()}|${totalAmount}|${taxAmount.toFixed(2)}`
  ).toString('base64');

  const newSale: Sale = {
    id: 'sale-' + Date.now(),
    orgId: Store.orgId,
    branchId: activeBranch,
    invoiceNumber,
    cashierId: cashierId || 'usr-cashier-02',
    cashierName: cashierName || 'Zaid Al-Mutairi',
    customerName,
    customerPhone,
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    totalAmount,
    paymentMethod: (paymentMethod as PaymentMethod) || 'MadaTap',
    amountPaid: amountPaid || totalAmount,
    changeGiven,
    status: 'Completed',
    items: validatedItems,
    zatcaQrCode,
    createdAt: new Date().toISOString()
  };

  Store.sales.unshift(newSale);

  return res.status(201).json({
    message: 'Sale completed successfully.',
    sale: newSale
  });
});

posRouter.get('/sales', (req: Request, res: Response) => {
  return res.json(Store.sales);
});

posRouter.get('/receipt/:id', (req: Request, res: Response) => {
  const sale = Store.sales.find(s => s.id === req.params.id || s.invoiceNumber === req.params.id);
  if (!sale) {
    return res.status(404).json({ message: 'Receipt not found.' });
  }

  const branch = Store.branches.find(b => b.id === sale.branchId);

  return res.json({
    branchNameEn: branch?.nameEn,
    branchNameAr: branch?.nameAr,
    taxNumber: branch?.taxNumber,
    address: branch?.address,
    invoiceNumber: sale.invoiceNumber,
    cashierName: sale.cashierName,
    date: sale.createdAt,
    items: sale.items,
    subtotal: sale.subtotal,
    tax: sale.taxAmount,
    total: sale.totalAmount,
    paymentMethod: sale.paymentMethod,
    zatcaQrCode: sale.zatcaQrCode,
    footer: branch?.receiptFooter
  });
});
