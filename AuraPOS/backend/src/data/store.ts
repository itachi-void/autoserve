import { Branch, CashierShift, Product, Sale, User } from '../types';
import bcrypt from 'bcryptjs';

export class Store {
  public static orgId = 'org-aura-01';

  public static branches: Branch[] = [
    {
      id: 'branch-ruh-01',
      orgId: Store.orgId,
      nameEn: 'Aura Flagship Riyadh',
      nameAr: 'فرع أورا الرئيسي - الرياض',
      code: 'RUH-01',
      city: 'Riyadh',
      address: 'Tahlia Street, Centria District',
      taxNumber: '310294857600003',
      receiptHeader: 'أورا للتجزئة والمقاهي المختصة\nAura Specialty Retail & Cafe',
      receiptFooter: 'شكراً لزيارتكم • أسعدتنا خدمتكم\nThanks for your visit!'
    },
    {
      id: 'branch-jed-02',
      orgId: Store.orgId,
      nameEn: 'Aura Corniche Jeddah',
      nameAr: 'فرع أورا كورنيش جدة',
      code: 'JED-02',
      city: 'Jeddah',
      address: 'North Corniche Promenade',
      taxNumber: '310294857600003',
      receiptHeader: 'أورا للتجزئة والمقاهي المختصة - جدة',
      receiptFooter: 'الفاتورة الضريبية المبسطة • E-Invoicing'
    }
  ];

  public static users: User[] = [
    {
      id: 'usr-admin-01',
      orgId: Store.orgId,
      branchId: 'branch-ruh-01',
      fullName: 'Sarah Al-Ghamdi',
      email: 'admin@aurapos.com',
      passwordHash: bcrypt.hashSync('Admin@123456', 10),
      role: 'OrganizationAdmin',
      language: 'ar'
    },
    {
      id: 'usr-cashier-02',
      orgId: Store.orgId,
      branchId: 'branch-ruh-01',
      fullName: 'Zaid Al-Mutairi',
      email: 'cashier@aurapos.com',
      passwordHash: bcrypt.hashSync('Cashier@123456', 10),
      role: 'Cashier',
      language: 'ar'
    }
  ];

  public static products: Product[] = [
    {
      id: 'prod-01',
      orgId: Store.orgId,
      sku: 'COF-ETH-001',
      barcode: '6285001122334',
      nameEn: 'Ethiopian Yirgacheffe V60',
      nameAr: 'قهوة مختصة إثيوبية يرقاتشيفي V60',
      categoryEn: 'Specialty Coffee',
      categoryAr: 'قهوة مختصة',
      unit: 'Cup',
      costPrice: 6.5,
      sellPrice: 24.0,
      taxRate: 0.15,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
      stockByBranch: { 'branch-ruh-01': 350, 'branch-jed-02': 210 }
    },
    {
      id: 'prod-02',
      orgId: Store.orgId,
      sku: 'COF-COL-002',
      barcode: '6285002233445',
      nameEn: 'Colombian Geisha Cold Brew',
      nameAr: 'كولد برو كولومبي جيزا',
      categoryEn: 'Specialty Coffee',
      categoryAr: 'قهوة مختصة',
      unit: 'Bottle',
      costPrice: 9.0,
      sellPrice: 32.0,
      taxRate: 0.15,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300',
      stockByBranch: { 'branch-ruh-01': 140, 'branch-jed-02': 95 }
    },
    {
      id: 'prod-03',
      orgId: Store.orgId,
      sku: 'BAK-CRO-003',
      barcode: '6285003344556',
      nameEn: 'Almond Butter Croissant',
      nameAr: 'كرواسون زبدة باللوز الفاخر',
      categoryEn: 'Artisan Bakery',
      categoryAr: 'مخبوزات فرنسية',
      unit: 'Piece',
      costPrice: 4.5,
      sellPrice: 18.0,
      taxRate: 0.15,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300',
      stockByBranch: { 'branch-ruh-01': 80, 'branch-jed-02': 45 }
    },
    {
      id: 'prod-04',
      orgId: Store.orgId,
      sku: 'RET-TUM-004',
      barcode: '6285004455667',
      nameEn: 'Aura Thermal Tumbler 500ml',
      nameAr: 'كوب أورا الحراري المقاوم للصدأ 500مل',
      categoryEn: 'Merchandise',
      categoryAr: 'أكواب وإكسسوارات',
      unit: 'Piece',
      costPrice: 45.0,
      sellPrice: 115.0,
      taxRate: 0.15,
      imageUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=300',
      stockByBranch: { 'branch-ruh-01': 45, 'branch-jed-02': 30 }
    }
  ];

  public static sales: Sale[] = [
    {
      id: 'sale-001',
      orgId: Store.orgId,
      branchId: 'branch-ruh-01',
      invoiceNumber: 'INV-2026-00812',
      cashierId: 'usr-cashier-02',
      cashierName: 'Zaid Al-Mutairi',
      customerName: 'Nasser Al-Husseini',
      customerPhone: '+966503332211',
      subtotal: 42.0,
      taxAmount: 6.3,
      discountAmount: 0.0,
      totalAmount: 48.3,
      paymentMethod: 'MadaTap',
      amountPaid: 48.3,
      changeGiven: 0.0,
      status: 'Completed',
      items: [
        {
          productId: 'prod-01',
          sku: 'COF-ETH-001',
          nameEn: 'Ethiopian Yirgacheffe V60',
          nameAr: 'قهوة مختصة إثيوبية يرقاتشيفي V60',
          unitPrice: 24.0,
          quantity: 1,
          discount: 0,
          taxRate: 0.15,
          total: 24.0
        },
        {
          productId: 'prod-03',
          sku: 'BAK-CRO-003',
          nameEn: 'Almond Butter Croissant',
          nameAr: 'كرواسون زبدة باللوز الفاخر',
          unitPrice: 18.0,
          quantity: 1,
          discount: 0,
          taxRate: 0.15,
          total: 18.0
        }
      ],
      zatcaQrCode: 'AQZBdXJhIFNwZWNpYWx0eSBDYWZlAg8zMTAyOTQ4NTc2MDAwMDMDFDIwMjYtMTAtMzFUMDE6MzI6MDBaBAY0OC4zMAUFNi4zMA==',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  public static shifts: CashierShift[] = [
    {
      id: 'shf-001',
      orgId: Store.orgId,
      branchId: 'branch-ruh-01',
      cashierId: 'usr-cashier-02',
      cashierName: 'Zaid Al-Mutairi',
      openingBalance: 500.0,
      cashSales: 340.0,
      cardSales: 1250.0,
      expectedCash: 840.0,
      actualCash: 840.0,
      difference: 0.0,
      status: 'Open',
      openedAt: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ];
}
