# خطة تنفيذ المرحلة أ — الأساس الهيكلي

## السياق
تنفيذ المرحلة أ من الخطة المعتمدة في `plans/enchanted-stargazing-firefly.md`:
1. طبقة بيانات مركزية (src/data/)
2. مكتبة مكوّنات مشتركة (src/components/ui/)
3. توحيد Tailwind tokens

---

## الخطوات

### ١. src/utils/format.ts
دالة `toArabicNum(n: number): string` — تحويل أرقام خام لعربي منسّق.

### ٢. src/data/ — طبقة البيانات
**الملفات:**
- `types.ts` — واجهات TypeScript: `Customer`, `Vehicle`, `Part`, `Service`, `Technician`, `WorkOrder`, `Appointment`, `Invoice`, `Quotation`, `PurchaseOrder`, `Employee`, `Warehouse`, `InspectionTemplate`
- `mockData.ts` — مصفوفات البيانات الوهمية الموحّدة (نقل + دمج البيانات من كل وحدة)، بأرقام خام بدل نصوص عربية
- `AppDataContext.tsx` — React Context + Provider + hook `useAppData`

**المحتوى الرئيسي للـContext:**
```ts
{
  customers, technicians, workOrders, parts, services,
  appointments, invoices, quotations, purchaseOrders,
  employees, warehouses, inspectionTemplates,
  // mutations:
  addCustomer, updateWorkOrderStatus, addWorkOrder, ...
}
```

### ٣. src/components/ui/ — المكوّنات المشتركة

| ملف | الاستخدام |
|-----|-----------|
| `StatusBadge.tsx` | خريطة ألوان مشتركة + badge موحّد |
| `PageHeader.tsx` | عنوان + وصف + زر إجراء (يُستخدم في كل وحدة) |
| `StatCard.tsx` | بطاقة KPI مع أيقونة + قيمة + وصف |
| `StatGrid.tsx` | grid يلفّ StatCards |
| `DataTable.tsx` | جدول بيانات عام (columns, rows, onRowClick) |
| `FilterPills.tsx` | أزرار الفلتر/التابات |
| `SearchBox.tsx` | حقل بحث |
| `Modal.tsx` | مودال قابل لإعادة الاستخدام مع Escape + backdrop |
| `FormField.tsx` | label + input/select/textarea موحّد |
| `ProgressBar.tsx` | شريط تقدّم ملوّن حسب النسبة |
| `EntityCard.tsx` | بطاقة كيان عامة (تُستخدم في Technicians/Cars) |

### ٤. تحديث main.tsx
لفّ `<App>` بـ `<AppDataProvider>`.

### ٥. تحديث App.tsx
تحسين: عرض `pages[activePage]` مباشرة بدل إنشاء الـRecord كاملاً في كل render (استخدام switch أو lazy rendering).

### ٦. تحديث الوحدات لتستهلك الـContext
بدءاً بالوحدات ذات التكرار الأعلى (البيانات المكررة):
- `Dashboard.tsx` — استخدام workOrders, appointments, technicians من الـcontext
- `WorkOrders.tsx` — استخدام workOrders
- `Technicians.tsx` — استخدام technicians
- `Customers.tsx` — استخدام customers
- `SpareParts.tsx` — استخدام parts
- `Invoices.tsx` — استخدام invoices
- باقي الوحدات: تحديث لاستهلاك بياناتها من الـcontext

### ٧. توحيد tokens
استبدال hex ثابت في مكوّنات ui/ الجديدة بـ Tailwind tokens المعرّفة في index.css:
- `bg-[#111827]` → `bg-card`
- `bg-[#0a0e1a]` → `bg-background`
- `border-[#1e293b]` → `border-border`
- `bg-[#1e293b]` → `bg-secondary`
- `bg-amber-500` → `bg-primary`
- `text-slate-500` → `text-muted-foreground`

---

## الملفات الجديدة
```
src/utils/format.ts
src/data/types.ts
src/data/mockData.ts
src/data/AppDataContext.tsx
src/components/ui/StatusBadge.tsx
src/components/ui/PageHeader.tsx
src/components/ui/StatCard.tsx
src/components/ui/StatGrid.tsx
src/components/ui/DataTable.tsx
src/components/ui/FilterPills.tsx
src/components/ui/SearchBox.tsx
src/components/ui/Modal.tsx
src/components/ui/FormField.tsx
src/components/ui/ProgressBar.tsx
src/components/ui/EntityCard.tsx
```

## الملفات المعدَّلة
```
src/main.tsx           — إضافة AppDataProvider
src/App.tsx            — تحسين الـrender
src/components/*.tsx   — كل الوحدات (استهلاك الـcontext + استخدام ui/)
src/index.css          — إزالة * { font-family } وتنظيف بسيط
index.html             — إضافة lang="ar" dir="rtl"
```

## التحقق
بعد التنفيذ:
- التصفّح في المعاينة: الداشبورد → أوامر التشغيل → الفنيون → العملاء → قطع الغيار
- التأكد من تطابق الأرقام بين الوحدات (نفس الفنيين، نفس الأوامر)
- التأكد من عمل الفلاتر والبحث
- `pnpm build` للتحقق من TypeScript
