import { Router, Request, Response } from 'express';
import { Store } from '../data/store';
import { CashierShift } from '../types';

export const shiftsRouter = Router();

shiftsRouter.get('/current', (req: Request, res: Response) => {
  const currentShift = Store.shifts.find(s => s.status === 'Open');
  if (!currentShift) {
    return res.status(404).json({ message: 'No open shift found.' });
  }
  return res.json(currentShift);
});

shiftsRouter.post('/open', (req: Request, res: Response) => {
  const { openingBalance, cashierId, cashierName, branchId } = req.body;

  const activeShift = Store.shifts.find(s => s.status === 'Open');
  if (activeShift) {
    return res.status(400).json({ message: 'A shift is already open.' });
  }

  const shift: CashierShift = {
    id: 'shf-' + Date.now(),
    orgId: Store.orgId,
    branchId: branchId || 'branch-ruh-01',
    cashierId: cashierId || 'usr-cashier-02',
    cashierName: cashierName || 'Zaid Al-Mutairi',
    openingBalance: Number(openingBalance) || 500,
    cashSales: 0,
    cardSales: 0,
    expectedCash: Number(openingBalance) || 500,
    actualCash: Number(openingBalance) || 500,
    difference: 0,
    status: 'Open',
    openedAt: new Date().toISOString()
  };

  Store.shifts.unshift(shift);
  return res.status(201).json(shift);
});

shiftsRouter.post('/close', (req: Request, res: Response) => {
  const { shiftId, actualCash, notes } = req.body;
  const shift = Store.shifts.find(s => s.id === shiftId || s.status === 'Open');

  if (!shift) {
    return res.status(404).json({ message: 'Open shift not found.' });
  }

  const actual = Number(actualCash) || shift.expectedCash;
  const diff = Number((actual - shift.expectedCash).toFixed(2));

  shift.actualCash = actual;
  shift.difference = diff;
  shift.status = diff === 0 ? 'Closed' : 'Discrepancy';
  shift.closedAt = new Date().toISOString();
  shift.notes = notes;

  return res.json({
    message: 'Shift closed successfully. Z-Report generated.',
    zReport: {
      shiftId: shift.id,
      cashier: shift.cashierName,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      openingBalance: shift.openingBalance,
      cashSales: shift.cashSales,
      cardSales: shift.cardSales,
      expectedCash: shift.expectedCash,
      actualCash: shift.actualCash,
      difference: shift.difference,
      isReconciled: diff === 0
    }
  });
});
