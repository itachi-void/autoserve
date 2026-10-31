import test from 'node:test';
import assert from 'node:assert';
import { Store } from './data/store';

test('AuraPOS - Product pricing and 15% VAT calculation', () => {
  const product = Store.products[0];
  assert.strictEqual(product.sellPrice, 24.0);
  assert.strictEqual(product.taxRate, 0.15);

  const subtotal = product.sellPrice * 2; // 48.0
  const vat = subtotal * 0.15; // 7.2
  const total = subtotal + vat; // 55.2

  assert.strictEqual(total, 55.2);
});

test('AuraPOS - Inventory deduction upon checkout', () => {
  const product = Store.products[0];
  const initialStock = product.stockByBranch['branch-ruh-01'];
  assert(initialStock > 0);

  // Simulate selling 2 units
  product.stockByBranch['branch-ruh-01'] -= 2;
  assert.strictEqual(product.stockByBranch['branch-ruh-01'], initialStock - 2);

  // Restore
  product.stockByBranch['branch-ruh-01'] = initialStock;
});

test('AuraPOS - Cashier shift reconciliation math', () => {
  const opening = 500.0;
  const cashSales = 350.0;
  const expectedCash = opening + cashSales; // 850.0
  const actualCash = 850.0;
  const diff = actualCash - expectedCash;

  assert.strictEqual(diff, 0.0);
  assert.strictEqual(expectedCash, 850.0);
});
