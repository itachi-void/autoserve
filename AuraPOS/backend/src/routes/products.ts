import { Router, Request, Response } from 'express';
import { Store } from '../data/store';

export const productsRouter = Router();

productsRouter.get('/', (req: Request, res: Response) => {
  const { search, category, branchId } = req.query;
  const activeBranch = (branchId as string) || 'branch-ruh-01';

  let list = Store.products.map(p => ({
    ...p,
    availableStock: p.stockByBranch[activeBranch] ?? 0
  }));

  if (search) {
    const s = (search as string).toLowerCase().trim();
    list = list.filter(p =>
      p.nameEn.toLowerCase().includes(s) ||
      p.nameAr.includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.barcode.includes(s)
    );
  }

  if (category) {
    list = list.filter(p => p.categoryEn === category || p.categoryAr === category);
  }

  return res.json(list);
});

productsRouter.get('/barcode/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const product = Store.products.find(p => p.barcode === code || p.sku === code);
  if (!product) {
    return res.status(404).json({ message: 'Product not found for barcode' });
  }
  return res.json(product);
});
