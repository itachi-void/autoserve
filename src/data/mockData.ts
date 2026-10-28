import type {
  Customer, Vehicle, Part, Service, ServiceCategory, Technician,
  WorkOrder, Appointment, Invoice, Quotation, PurchaseOrder,
  Employee, Department, Supplier, WarehouseTransaction,
  Role, SystemUser, InspectionTemplate, CustomInspection,
} from "./types";

export const initialCustomers: Customer[] = [
  { id: "C-٠٠١", name: "أحمد محمد السيد", phone: "٠٥٠١٢٣٤٥٦٧", cars: 2, totalSpent: 12400, debt: 0, lastVisit: "٢٧ أغسطس ٢٠٢٦", status: "نشط", email: "ahmed.sayed@gmail.com", address: "الرياض — حي الملك فهد", type: "فرد", createdAt: "يناير ٢٠٢٣" },
  { id: "C-٠٠٢", name: "سارة عبدالله الغامدي", phone: "٠٥٥٩٨٧٦٥٤٣", cars: 1, totalSpent: 4200, debt: 850, lastVisit: "٢٤ أغسطس ٢٠٢٦", status: "دين", email: "sara.ghamdi@hotmail.com", address: "الرياض — حي العليا", type: "فرد", createdAt: "مارس ٢٠٢٤" },
  { id: "C-٠٠٣", name: "فيصل عبدالعزيز الحربي", phone: "٠٥٦٣٣٢١١٠٠", cars: 3, totalSpent: 32700, debt: 0, lastVisit: "٢٠ أغسطس ٢٠٢٦", status: "نشط", email: "f.harbi@company.sa", address: "الرياض — حي اليرموك", type: "فرد", createdAt: "أغسطس ٢٠٢١" },
  { id: "C-٠٠٤", name: "ريم سعد العتيبي", phone: "٠٥٤٤٤٥٥٦٦٧", cars: 1, totalSpent: 6100, debt: 1200, lastVisit: "١٥ أغسطس ٢٠٢٦", status: "دين", email: "reem.otaibi@gmail.com", address: "الرياض — حي النزهة", type: "فرد", createdAt: "يونيو ٢٠٢٣" },
  { id: "C-٠٠٥", name: "ناصر محمد القحطاني", phone: "٠٥٩٨٨٧٧٦٦٥", cars: 2, totalSpent: 21500, debt: 0, lastVisit: "١٨ أغسطس ٢٠٢٦", status: "نشط", email: "nasser.q@gmail.com", address: "الرياض — حي الربوة", type: "فرد", createdAt: "فبراير ٢٠٢٢" },
  { id: "C-٠٠٦", name: "هند عبدالله الشمري", phone: "٠٥٣٢١٢٣٤٥٦", cars: 1, totalSpent: 8900, debt: 3400, lastVisit: "١٠ أغسطس ٢٠٢٦", status: "دين", email: "hind.shammari@gmail.com", address: "الرياض — حي الصحافة", type: "فرد", createdAt: "نوفمبر ٢٠٢٢" },
  { id: "C-٠٠٧", name: "طارق سلطان العمري", phone: "٠٥٧٦٥٤٣٢١٠", cars: 4, totalSpent: 48200, debt: 0, lastVisit: "٢٦ أغسطس ٢٠٢٦", status: "VIP", email: "tariq.omari@enterprise.com", address: "الرياض — حي الحمراء", type: "شركة", createdAt: "مارس ٢٠٢٠" },
  { id: "C-٠٠٨", name: "نورة خالد الدوسري", phone: "٠٥٠٩٩٨٨٧٧٦", cars: 1, totalSpent: 2300, debt: 0, lastVisit: "٥ أغسطس ٢٠٢٦", status: "نشط", email: "noura.d@hotmail.com", address: "الرياض — حي الوادي", type: "فرد", createdAt: "أبريل ٢٠٢٥" },
];

export const initialVehicles: Vehicle[] = [
  { plate: "أ ب ج ١٢٣٤", make: "تويوتا", model: "كامري", year: "٢٠٢٢", color: "أبيض", owner: "أحمد محمد السيد", mileage: 45200, lastService: "٢٧ أغسطس ٢٠٢٦", vin: "JT2BF22K1W0156789", trim: "SE Sport", registeredAt: "مارس ٢٠٢٢", ownershipHistory: ["أحمد محمد السيد"] },
  { plate: "د هـ و ٥٦٧٨", make: "هونداي", model: "سوناتا", year: "٢٠٢١", color: "رمادي", owner: "سارة عبدالله", mileage: 62800, lastService: "٢٤ أغسطس ٢٠٢٦", vin: "KMHCT4AE5CU123456", trim: "Smart", registeredAt: "يوليو ٢٠٢١", ownershipHistory: ["خالد ماجد", "سارة عبدالله"] },
  { plate: "ز ح ط ٩١١٢", make: "نيسان", model: "باترول", year: "٢٠٢٣", color: "أسود", owner: "فيصل الحربي", mileage: 23100, lastService: "٢٠ أغسطس ٢٠٢٦", vin: "JN8AY2ND0H9700123", trim: "Platinum LE", registeredAt: "يناير ٢٠٢٣", ownershipHistory: ["فيصل الحربي"] },
  { plate: "ي ك ل ٣٤٥٦", make: "كيا", model: "سبورتاج", year: "٢٠٢٢", color: "أحمر", owner: "ريم العتيبي", mileage: 38500, lastService: "١٥ أغسطس ٢٠٢٦", vin: "KNDPM3AC1H7123456", trim: "EX", registeredAt: "أغسطس ٢٠٢٢", ownershipHistory: ["ريم العتيبي"] },
  { plate: "م ن س ٧٨٩٠", make: "لكزس", model: "LX 570", year: "٢٠٢٣", color: "فضي", owner: "ناصر القحطاني", mileage: 15700, lastService: "١٨ أغسطس ٢٠٢٦", vin: "JTJHY7AX5G4123456", trim: "Executive", registeredAt: "مارس ٢٠٢٣", ownershipHistory: ["ناصر القحطاني"] },
  { plate: "ع غ ف ٢١٣٤", make: "BMW", model: "X5", year: "٢٠٢٣", color: "أزرق", owner: "طارق العمري", mileage: 28900, lastService: "٢٦ أغسطس ٢٠٢٦", vin: "5UXCR6C04L9B12345", trim: "xDrive40i", registeredAt: "فبراير ٢٠٢٣", ownershipHistory: ["طارق العمري"] },
];

export const initialParts: Part[] = [
  { sku: "FLT-OIL-001", name: "فلتر زيت محرك", category: "فلاتر", brand: "Mann Filter", stock: 42, minStock: 10, price: 35, compatible: ["تويوتا كامري", "هونداي سوناتا"], barcode: "4011558036173", oem: "90915-10003", salesUoM: "قطعة", alternatives: ["FLT-OIL-002", "FLT-OIL-003"], averageCost: 22, available: 38, allocated: 4 },
  { sku: "BRK-PAD-F01", name: "تيل فرامل أمامي", category: "فرامل", brand: "Brembo", stock: 8, minStock: 10, price: 220, compatible: ["نيسان باترول", "تويوتا لاند كروزر"], barcode: "8020584018842", oem: "44060-VJ325", salesUoM: "طقم", alternatives: ["BRK-PAD-F02"], averageCost: 150, available: 6, allocated: 2 },
  { sku: "AIR-FLT-002", name: "فلتر هواء محرك", category: "فلاتر", brand: "K&N", stock: 25, minStock: 8, price: 85, compatible: ["كيا سبورتاج", "هيونداي توسان"], barcode: "24844007482", oem: "28113-2S000", salesUoM: "قطعة", alternatives: ["AIR-FLT-003"], averageCost: 58, available: 23, allocated: 2 },
  { sku: "OIL-5W30-003", name: "زيت محرك 5W-30 4L", category: "زيوت", brand: "Mobil 1", stock: 60, minStock: 20, price: 140, compatible: ["جميع السيارات"], barcode: "00717122002688", oem: "—", salesUoM: "لتر", alternatives: ["OIL-5W40-004"], averageCost: 95, available: 60, allocated: 0 },
  { sku: "SPK-PLG-004", name: "شمعات إشعال NGK", category: "إشعال", brand: "NGK", stock: 3, minStock: 20, price: 45, compatible: ["تويوتا", "لكزس"], barcode: "77353048000", oem: "90919-01233", salesUoM: "قطعة", alternatives: [], averageCost: 32, available: 3, allocated: 0 },
  { sku: "ABS-SNS-005", name: "حساس ABS أمامي", category: "كهرباء", brand: "Bosch", stock: 6, minStock: 5, price: 380, compatible: ["كيا سبورتاج ٢٠٢٢"], barcode: "3165143196204", oem: "95671-2T100", salesUoM: "قطعة", alternatives: [], averageCost: 265, available: 4, allocated: 2 },
  { sku: "SHK-FNT-006", name: "مساعد أمامي يسار", category: "تعليق", brand: "KYB", stock: 0, minStock: 4, price: 850, compatible: ["BMW X5", "BMW X3"], barcode: "4961854340537", oem: "31316792457", salesUoM: "قطعة", alternatives: ["SHK-FNT-007"], averageCost: 590, available: 0, allocated: 0 },
  { sku: "BLT-ALT-007", name: "سير دينامو", category: "محرك", brand: "Gates", stock: 14, minStock: 6, price: 120, compatible: ["هونداي", "كيا"], barcode: "078037431174", oem: "25212-2E000", salesUoM: "قطعة", alternatives: [], averageCost: 78, available: 14, allocated: 0 },
];

export const initialServiceCategories: ServiceCategory[] = [
  { id: "CAT-٠١", name: "صيانة دورية", icon: "🔄", color: "sky" },
  { id: "CAT-٠٢", name: "فرامل وتعليق", icon: "🛞", color: "amber" },
  { id: "CAT-٠٣", name: "كهرباء وكمبيوتر", icon: "⚡", color: "violet" },
  { id: "CAT-٠٤", name: "محرك وناقل حركة", icon: "⚙️", color: "rose" },
  { id: "CAT-٠٥", name: "تكييف وتبريد", icon: "❄️", color: "emerald" },
  { id: "CAT-٠٦", name: "هيكل ودهان", icon: "🎨", color: "orange" },
];

export const initialServices: Service[] = [
  { id: "SVC-٠٠١", name: "تغيير زيت المحرك", category: "صيانة دورية", basePrice: 150, extraPrice: 50, duration: "٣٠ دقيقة", status: "نشط", description: "تغيير زيت المحرك وفلتره حسب توصيات المصنع مع فحص مستويات السوائل", pricingModel: "ثابت", requiredBay: "صيانة عامة" },
  { id: "SVC-٠٠٢", name: "فحص شامل ٣٠ نقطة", category: "صيانة دورية", basePrice: 250, extraPrice: null, duration: "٩٠ دقيقة", status: "نشط", description: "فحص دوري شامل يغطي ٣٠ نقطة رئيسية في السيارة مع تقرير مفصل للعميل", pricingModel: "ثابت", requiredBay: "فحص متخصص" },
  { id: "SVC-٠٠٣", name: "تغيير تيل الفرامل الأمامي", category: "فرامل وتعليق", basePrice: 350, extraPrice: 100, duration: "٦٠ دقيقة", status: "نشط", description: "استبدال تيل الفرامل الأمامي مع فحص الأقراص وسائل الفرامل", pricingModel: "ثابت", requiredBay: "رفع هيدروليكي" },
  { id: "SVC-٠٠٤", name: "فحص الكمبيوتر وقراءة الأعطال", category: "كهرباء وكمبيوتر", basePrice: 120, extraPrice: null, duration: "٤٥ دقيقة", status: "نشط", description: "قراءة وتفسير رموز الأعطال OBD-II وتقرير كامل بالحالة", pricingModel: "ثابت", requiredBay: "كهرباء متخصص" },
  { id: "SVC-٠٠٥", name: "شحن فريون المكيف", category: "تكييف وتبريد", basePrice: 200, extraPrice: 80, duration: "٦٠ دقيقة", status: "نشط", description: "فحص وشحن نظام التكييف بغاز R134a مع اختبار الأداء الكامل", pricingModel: "حسب الكمية", requiredBay: "صيانة عامة" },
  { id: "SVC-٠٠٦", name: "ميزان العجلات وضبط الزوايا", category: "فرامل وتعليق", basePrice: 180, extraPrice: null, duration: "٤٥ دقيقة", status: "نشط", description: "موازنة العجلات وضبط زوايا الإطارات (التو-إن، الكامبر، الكاستر)", pricingModel: "ثابت", requiredBay: "زوايا وإطارات" },
  { id: "SVC-٠٠٧", name: "إصلاح خط مكيف", category: "تكييف وتبريد", basePrice: 400, extraPrice: 150, duration: "١٢٠ دقيقة", status: "موقوف", description: "إصلاح أو استبدال خطوط غاز الفريون المتسربة", pricingModel: "حسب العمالة", requiredBay: "تكييف متخصص" },
  { id: "SVC-٠٠٨", name: "صيانة علبة التروس", category: "محرك وناقل حركة", basePrice: 800, extraPrice: 200, duration: "١٨٠ دقيقة", status: "نشط", description: "تغيير زيت علبة التروس الأوتوماتيك وفحص شامل لمنظومة الناقل", pricingModel: "حسب العمالة", requiredBay: "محرك متخصص" },
];

export const initialTechnicians: Technician[] = [
  {
    id: "TECH-٠١", name: "خالد إبراهيم", specialty: "ميكانيكا عامة",
    phone: "٠٥٠١١١٢٢٣٣", status: "نشط", tasks: 4, maxTasks: 6,
    rating: 4.8, completedJobs: 312, joinDate: "يناير ٢٠٢٠",
    employeeId: "EMP-٠١", efficiency: 94,
    currentTasks: [
      { id: "WO-١٠٤٧", car: "تويوتا كامري", service: "تغيير زيت", progress: 100 },
      { id: "WO-١٠٤٣", car: "لكزس LX", service: "صيانة دورية", progress: 85 },
    ],
    timeLogs: [
      { task: "WO-١٠٤٧", clockIn: "٨:٠٠ص", clockOut: "٨:٣٥ص", status: "منتهي" },
      { task: "WO-١٠٤٣", clockIn: "٩:٠٠ص", clockOut: null, status: "جاري" },
    ],
  },
  {
    id: "TECH-٠٢", name: "محمد علي", specialty: "كهرباء وكمبيوتر",
    phone: "٠٥٥٢٢٣٣٤٤٥", status: "نشط", tasks: 5, maxTasks: 6,
    rating: 4.6, completedJobs: 248, joinDate: "مارس ٢٠٢١",
    employeeId: "EMP-٠٢", efficiency: 88,
    currentTasks: [
      { id: "WO-١٠٤٦", car: "هونداي سوناتا", service: "فحص شامل", progress: 60 },
      { id: "WO-١٠٤٤", car: "كيا سبورتاج", service: "كهرباء", progress: 40 },
    ],
    timeLogs: [
      { task: "WO-١٠٤٦", clockIn: "٨:١٥ص", clockOut: null, status: "جاري" },
    ],
  },
  {
    id: "TECH-٠٣", name: "عمر حسن", specialty: "هيكل ودهان",
    phone: "٠٥٦٣٣٤٤٥٥٦", status: "نشط", tasks: 2, maxTasks: 6,
    rating: 4.9, completedJobs: 407, joinDate: "يوليو ٢٠١٩",
    employeeId: "EMP-٠٣", efficiency: 97,
    currentTasks: [
      { id: "WO-١٠٤٥", car: "نيسان باترول", service: "تغيير فرامل", progress: 30 },
    ],
    timeLogs: [
      { task: "WO-١٠٤٥", clockIn: "٩:٣٠ص", clockOut: null, status: "جاري" },
    ],
  },
  {
    id: "TECH-٠٤", name: "سامي نور", specialty: "مكيفات وتبريد",
    phone: "٠٥٤٤٤٥٥٦٦٧", status: "مشغول", tasks: 6, maxTasks: 6,
    rating: 4.5, completedJobs: 189, joinDate: "أكتوبر ٢٠٢٢",
    employeeId: "EMP-٠٤", efficiency: 82,
    currentTasks: [
      { id: "WO-١٠٤٤", car: "كيا سبورتاج", service: "تكييف", progress: 75 },
    ],
    timeLogs: [
      { task: "WO-١٠٤٤", clockIn: "٧:٤٥ص", clockOut: null, status: "جاري" },
    ],
  },
  {
    id: "TECH-٠٥", name: "يوسف كريم", specialty: "إطارات وتوازن",
    phone: "٠٥٩٦٦٧٧٨٨٩", status: "نشط", tasks: 1, maxTasks: 6,
    rating: 4.3, completedJobs: 156, joinDate: "فبراير ٢٠٢٣",
    employeeId: "EMP-٠٥", efficiency: 79,
    currentTasks: [
      { id: "WO-١٠٤٢", car: "BMW X5", service: "تعليق وإطارات", progress: 10 },
    ],
    timeLogs: [
      { task: "WO-١٠٤٢", clockIn: "١٠:٠٠ص", clockOut: null, status: "جاري" },
    ],
  },
];

export const initialWorkOrders: WorkOrder[] = [
  { id: "WO-١٠٤٧", customer: "أحمد محمد السيد", car: "تويوتا كامري ٢٠٢٢", services: ["تغيير زيت", "فلتر هواء"], parts: ["فلتر زيت", "زيت محرك ٥W-30"], tech: "خالد إبراهيم", status: "مكتمل", priority: "عادي", total: 350, date: "٢٧ أغسطس ٢٠٢٦", progress: 100, estimateId: "QT-٢٠٢٦-٠٢٠", startedAt: "٢٧ أغسطس ٨:٠٠ص", completedAt: "٢٧ أغسطس ٩:٣٠ص", notes: "العميل طلب استخدام زيت موبيل ١ فقط" },
  { id: "WO-١٠٤٦", customer: "سارة عبدالله", car: "هونداي سوناتا ٢٠٢١", services: ["فحص شامل", "تنظيف"], parts: [], tech: "محمد علي", status: "جاري", priority: "عادي", total: 800, date: "٢٧ أغسطس ٢٠٢٦", progress: 60, startedAt: "٢٧ أغسطس ٨:١٥ص", notes: "صوت طقطقة من الأمام الأيسر" },
  { id: "WO-١٠٤٥", customer: "فيصل الحربي", car: "نيسان باترول ٢٠٢٣", services: ["تغيير فرامل أمامية"], parts: ["تيل فرامل", "قرص فرامل"], tech: "عمر حسن", status: "انتظار قطع", priority: "عاجل", total: 1200, date: "٢٦ أغسطس ٢٠٢٦", progress: 30, startedAt: "٢٦ أغسطس ٩:٠٠ص", notes: "", supplements: [{ reason: "تآكل أقراص الفرامل الخلفية أيضاً", amount: 380, status: "بانتظار الموافقة", requestedAt: "٢٦ أغسطس ٢٠٢٦" }] },
  { id: "WO-١٠٤٤", customer: "ريم العتيبي", car: "كيا سبورتاج ٢٠٢٢", services: ["فحص كمبيوتر", "كهرباء"], parts: ["حساس ABS"], tech: "سامي نور", status: "جاري", priority: "عاجل", total: 650, date: "٢٦ أغسطس ٢٠٢٦", progress: 75, startedAt: "٢٦ أغسطس ٧:٤٥ص", notes: "ضوء ABS مضيء — تشخيص مطلوب" },
  { id: "WO-١٠٤٣", customer: "ناصر القحطاني", car: "لكزس LX ٢٠٢٣", services: ["صيانة دورية ١٠K"], parts: ["زيت", "فلاتر", "شمعات"], tech: "خالد إبراهيم", status: "مكتمل", priority: "VIP", total: 2100, date: "٢٥ أغسطس ٢٠٢٦", progress: 100, estimateId: "QT-٢٠٢٦-٠٢٠", startedAt: "٢٥ أغسطس ٩:٠٠ص", completedAt: "٢٥ أغسطس ١٢:٣٠م", notes: "عميل VIP — تنبيه قبل تسليم السيارة" },
  { id: "WO-١٠٤٢", customer: "طارق العمري", car: "BMW X5 ٢٠٢٣", services: ["تعليق وإطارات"], parts: ["مساعد أمامي يسار"], tech: "يوسف كريم", status: "مجدول", priority: "VIP", total: 3400, date: "٢٨ أغسطس ٢٠٢٦", progress: 0, notes: "موعد مؤكد الساعة ١٠:٠٠ص" },
];

export const initialAppointments: Appointment[] = [
  { id: "APT-٠١", day: 0, hour: 1, customer: "عبدالرحمن سالم", service: "فحص محرك", car: "BMW X5", tech: "محمد علي", color: "sky", displayTime: "٩:٠٠ ص", displayStatus: "قادم", complaintNotes: "أصوات غير طبيعية عند التسارع", estimatedDuration: "١.٥ ساعة" },
  { id: "APT-٠٢", day: 0, hour: 3, customer: "نورة محمد", service: "تغيير زيت", car: "مرسيدس C200", tech: "خالد إبراهيم", color: "emerald", displayTime: "١٠:٣٠ ص", displayStatus: "وصل", complaintNotes: "", estimatedDuration: "٠.٥ ساعة" },
  { id: "APT-٠٣", day: 1, hour: 2, customer: "طارق العمري", service: "فرامل وإطارات", car: "فورد F-150", tech: "عمر حسن", color: "amber", displayTime: "١٢:٠٠ م", displayStatus: "قادم", complaintNotes: "اهتزاز عند الفرملة على سرعات عالية", estimatedDuration: "٢ ساعة" },
  { id: "APT-٠٤", day: 2, hour: 0, customer: "هند الشمري", service: "تكييف", car: "شيفرولية تاهو", tech: "سامي نور", color: "rose", displayTime: "٢:٠٠ م", displayStatus: "قادم", complaintNotes: "المكيف لا يبرد بشكل كافٍ", estimatedDuration: "١ ساعة" },
  { id: "APT-٠٥", day: 2, hour: 4, customer: "سلطان الدوسري", service: "صيانة شاملة", car: "تويوتا لاند كروزر", tech: "خالد إبراهيم", color: "amber", displayTime: "٤:٠٠ م", displayStatus: "مؤكد", complaintNotes: "", estimatedDuration: "٣ ساعات" },
  { id: "APT-٠٦", day: 3, hour: 1, customer: "أحمد السيد", service: "كهرباء", car: "كامري ٢٠٢٢", tech: "سامي نور", color: "sky", displayTime: "٩:٠٠ ص", displayStatus: "قادم", complaintNotes: "ضوء المحرك مضيء ورمز خطأ على لوحة التحكم", estimatedDuration: "١ ساعة" },
  { id: "APT-٠٧", day: 4, hour: 2, customer: "فيصل الحربي", service: "تعليق", car: "باترول ٢٠٢٣", tech: "يوسف كريم", color: "emerald", displayTime: "١١:٠٠ ص", displayStatus: "قادم", complaintNotes: "", estimatedDuration: "١.٥ ساعة" },
  { id: "APT-٠٨", day: 5, hour: 0, customer: "ريم العتيبي", service: "فحص شامل", car: "سبورتاج ٢٠٢٢", tech: "محمد علي", color: "rose", displayTime: "٨:٠٠ ص", displayStatus: "قادم", complaintNotes: "فحص شامل قبل رحلة طويلة", estimatedDuration: "١.٥ ساعة" },
];

export const initialInvoices: Invoice[] = [
  { id: "INV-٢٠٢٦-٠٤٧", customer: "أحمد محمد السيد", workOrder: "WO-١٠٤٧", date: "٢٧ أغسطس ٢٠٢٦", subtotal: 350, vat: 52.5, total: 402.5, paid: 402.5, balance: 0, status: "مدفوع", discount: 0, car: "تويوتا كامري ٢٠٢٢", paidAt: "٢٧ أغسطس ٢٠٢٦", payments: [{ amount: 402.5, method: "بطاقة ائتمانية", date: "٢٧ أغسطس ٢٠٢٦" }] },
  { id: "INV-٢٠٢٦-٠٤٦", customer: "سارة عبدالله", workOrder: "WO-١٠٤٦", date: "٢٧ أغسطس ٢٠٢٦", subtotal: 800, vat: 120, total: 920, paid: 0, balance: 920, status: "معلق", discount: 0, car: "هونداي سوناتا ٢٠٢١", payments: [] },
  { id: "INV-٢٠٢٦-٠٤٣", customer: "ناصر القحطاني", workOrder: "WO-١٠٤٣", date: "٢٥ أغسطس ٢٠٢٦", subtotal: 2100, vat: 315, total: 2415, paid: 1200, balance: 1215, status: "جزئي", discount: 0, car: "لكزس LX ٢٠٢٣", payments: [{ amount: 1200, method: "تحويل بنكي", date: "٢٥ أغسطس ٢٠٢٦" }] },
  { id: "INV-٢٠٢٦-٠٤٠", customer: "طارق العمري", workOrder: "WO-١٠٤٠", date: "٢٣ أغسطس ٢٠٢٦", subtotal: 1800, vat: 270, total: 2070, paid: 2070, balance: 0, status: "مدفوع", discount: 0, car: "BMW X5 ٢٠٢٣", paidAt: "٢٣ أغسطس ٢٠٢٦", payments: [{ amount: 2070, method: "نقداً", date: "٢٣ أغسطس ٢٠٢٦" }] },
  { id: "INV-٢٠٢٦-٠٣٨", customer: "ريم العتيبي", workOrder: "WO-١٠٣٨", date: "٢١ أغسطس ٢٠٢٦", subtotal: 650, vat: 97.5, total: 747.5, paid: 0, balance: 747.5, status: "متأخر", discount: 0, car: "كيا سبورتاج ٢٠٢٢", payments: [] },
  { id: "INV-٢٠٢٦-٠٣٥", customer: "فيصل الحربي", workOrder: "WO-١٠٣٥", date: "١٩ أغسطس ٢٠٢٦", subtotal: 4200, vat: 630, total: 4830, paid: 4830, balance: 0, status: "مدفوع", discount: 5, car: "نيسان باترول ٢٠٢٣", paidAt: "١٩ أغسطس ٢٠٢٦", payments: [{ amount: 2000, method: "نقداً", date: "١٩ أغسطس ٢٠٢٦" }, { amount: 2830, method: "بطاقة ائتمانية", date: "١٩ أغسطس ٢٠٢٦" }] },
];

export const initialQuotations: Quotation[] = [
  {
    id: "QT-٢٠٢٦-٠٢٣", customer: "فيصل الحربي", car: "نيسان باترول ٢٠٢٣",
    date: "٢٧ أغسطس ٢٠٢٦", validUntil: "٣ سبتمبر ٢٠٢٦",
    services: [{ name: "تغيير فرامل أمامية", price: 350, qty: 1, decision: "مقبول" }, { name: "فحص شامل", price: 250, qty: 1, decision: "مقبول" }],
    parts: [{ name: "تيل فرامل Brembo", price: 220, qty: 1, decision: "مقبول" }, { name: "قرص فرامل أمامي", price: 380, qty: 2, decision: "مقبول" }],
    discount: 5, subtotal: 1580, vat: 237, total: 1782, status: "موافق", approvedAt: "٢٧ أغسطس ٢٠٢٦",
    linkedInspection: "INSP-٠٠٣", presentedAt: "٢٧ أغسطس ٢٠٢٦",
  },
  {
    id: "QT-٢٠٢٦-٠٢٢", customer: "طارق العمري", car: "BMW X5 ٢٠٢٣",
    date: "٢٦ أغسطس ٢٠٢٦", validUntil: "٢ سبتمبر ٢٠٢٦",
    services: [{ name: "تعليق وتوازن", price: 500, qty: 1 }],
    parts: [{ name: "مساعد أمامي KYB", price: 850, qty: 2 }],
    discount: 10, subtotal: 2650, vat: 397.5, total: 2847.5, status: "انتظار موافقة", approvedAt: "—",
    presentedAt: "٢٦ أغسطس ٢٠٢٦",
  },
  {
    id: "QT-٢٠٢٦-٠٢١", customer: "سارة عبدالله", car: "هونداي سوناتا ٢٠٢١",
    date: "٢٥ أغسطس ٢٠٢٦", validUntil: "١ سبتمبر ٢٠٢٦",
    services: [{ name: "فحص شامل", price: 250, qty: 1, decision: "مرفوض", rejectionReason: "العميل يريد مراجعة عرض آخر" }, { name: "تنظيف محرك", price: 150, qty: 1, decision: "مرفوض", rejectionReason: "خارج الميزانية" }],
    parts: [],
    discount: 0, subtotal: 400, vat: 60, total: 460, status: "مرفوض", approvedAt: "٢٦ أغسطس ٢٠٢٦",
    presentedAt: "٢٥ أغسطس ٢٠٢٦",
  },
  {
    id: "QT-٢٠٢٦-٠٢٠", customer: "ناصر القحطاني", car: "لكزس LX ٢٠٢٣",
    date: "٢٤ أغسطس ٢٠٢٦", validUntil: "٣١ أغسطس ٢٠٢٦",
    services: [{ name: "صيانة دورية ١٠K", price: 800, qty: 1, decision: "مقبول" }],
    parts: [{ name: "زيت محرك Mobil 1 5W-40", price: 280, qty: 1, decision: "مقبول" }, { name: "فلتر زيت", price: 45, qty: 1, decision: "مقبول" }, { name: "فلتر هواء", price: 85, qty: 1, decision: "مقبول" }],
    discount: 0, subtotal: 1210, vat: 181.5, total: 1391.5, status: "موافق", approvedAt: "٢٥ أغسطس ٢٠٢٦",
    linkedInspection: "INSP-٠٠١", presentedAt: "٢٤ أغسطس ٢٠٢٦",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  { id: "PO-٢٠٢٦-٠٣٢", supplier: "شركة موبيل للزيوت", supplierCode: "SUP-٠٠١", date: "٢٧ أغسطس ٢٠٢٦", expectedDate: "٢٩ أغسطس ٢٠٢٦", items: [{ name: "زيت محرك 5W-30 4L", qty: 50, unit: "لتر", unitPrice: 140, total: 7000 }], total: 7000, status: "وصل", notes: "" },
  { id: "PO-٢٠٢٦-٠٣١", supplier: "مؤسسة الخليج للقطع", supplierCode: "SUP-٠٠٢", date: "٢٥ أغسطس ٢٠٢٦", expectedDate: "٢٧ أغسطس ٢٠٢٦", items: [{ name: "شمعات إشعال NGK", qty: 100, unit: "قطعة", unitPrice: 45, total: 4500 }, { name: "فلتر هواء K&N", qty: 10, unit: "قطعة", unitPrice: 85, total: 850 }], total: 5350, status: "وصل", notes: "تم استلام الكمية كاملة" },
  { id: "PO-٢٠٢٦-٠٣٠", supplier: "Bosch الشرق الأوسط", supplierCode: "SUP-٠٠٣", date: "٢٦ أغسطس ٢٠٢٦", expectedDate: "٣٠ أغسطس ٢٠٢٦", items: [{ name: "حساس ABS أمامي", qty: 10, unit: "قطعة", unitPrice: 380, total: 3800 }], total: 3800, status: "في الطريق", notes: "شحن جوي — رقم التتبع: BX٢٠٢٦٠٨٢٦" },
  { id: "PO-٢٠٢٦-٠٢٩", supplier: "مؤسسة الخليج للقطع", supplierCode: "SUP-٠٠٢", date: "٢٣ أغسطس ٢٠٢٦", expectedDate: "٢٦ أغسطس ٢٠٢٦", items: [{ name: "تيل فرامل Brembo أمامي", qty: 20, unit: "طقم", unitPrice: 220, total: 4400 }, { name: "قرص فرامل أمامي", qty: 10, unit: "قطعة", unitPrice: 380, total: 3800 }], total: 8200, status: "معلق", notes: "بانتظار موافقة المدير" },
  { id: "PO-٢٠٢٦-٠٢٨", supplier: "شركة الفرامل المتحدة", supplierCode: "SUP-٠٠٤", date: "٢٠ أغسطس ٢٠٢٦", expectedDate: "٢٤ أغسطس ٢٠٢٦", items: [{ name: "مساعد أمامي KYB يسار", qty: 4, unit: "قطعة", unitPrice: 850, total: 3400 }], total: 3400, status: "متأخر", notes: "تأخر الشحن — يُنصح بالتواصل مع المورد" },
];

export const initialDepartments: Department[] = [
  { name: "الميكانيكا العامة", head: "خالد إبراهيم", count: 5, color: "sky", description: "صيانة المحركات والناقل والتعليق وجميع الأنظمة الميكانيكية" },
  { name: "الكهرباء والكمبيوتر", head: "محمد علي", count: 3, color: "amber", description: "تشخيص وإصلاح الأنظمة الكهربائية وبرمجة وحدات التحكم" },
  { name: "الهيكل والدهان", head: "عمر حسن", count: 4, color: "emerald", description: "إصلاح هياكل السيارات وأعمال الدهان والتلميع" },
  { name: "خدمة العملاء", head: "ليلى أحمد", count: 3, color: "rose", description: "استقبال العملاء والمتابعة وإدارة المواعيد والشكاوى" },
];

export const initialEmployees: Employee[] = [
  { id: "EMP-٠١", name: "خالد إبراهيم", role: "رئيس قسم", dept: "الميكانيكا العامة", phone: "٠٥٠١١١٢٢٣٣", status: "نشط", since: "يناير ٢٠٢٠", tasks: 4, email: "k.ibrahim@autoserve.sa", address: "الرياض — حي النزهة", basicSalary: 8500 },
  { id: "EMP-٠٢", name: "محمد علي", role: "فني أول", dept: "الكهرباء والكمبيوتر", phone: "٠٥٥٢٢٣٣٤٤٥", status: "نشط", since: "مارس ٢٠٢١", tasks: 5, email: "m.ali@autoserve.sa", address: "الرياض — حي الملز", basicSalary: 6800 },
  { id: "EMP-٠٣", name: "عمر حسن", role: "رئيس قسم", dept: "الهيكل والدهان", phone: "٠٥٦٣٣٤٤٥٥٦", status: "نشط", since: "يوليو ٢٠١٩", tasks: 2, email: "o.hassan@autoserve.sa", address: "الرياض — حي العليا", basicSalary: 9000 },
  { id: "EMP-٠٤", name: "سامي نور", role: "فني مكيفات", dept: "الميكانيكا العامة", phone: "٠٥٤٤٤٥٥٦٦٧", status: "مشغول", since: "أكتوبر ٢٠٢٢", tasks: 6, email: "s.noor@autoserve.sa", address: "الرياض — حي الروضة", basicSalary: 5500, statusReason: "مكلّف بمهمة طارئة حتى نهاية الأسبوع" },
  { id: "EMP-٠٥", name: "يوسف كريم", role: "فني إطارات", dept: "الميكانيكا العامة", phone: "٠٥٩٦٦٧٧٨٨٩", status: "نشط", since: "فبراير ٢٠٢٣", tasks: 1, email: "y.karim@autoserve.sa", address: "الرياض — حي الصحافة", basicSalary: 4800 },
  { id: "EMP-٠٦", name: "ليلى أحمد", role: "رئيسة خدمة عملاء", dept: "خدمة العملاء", phone: "٠٥٣٧٧٨٨٩٩٠", status: "نشط", since: "يونيو ٢٠٢٠", tasks: 0, email: "l.ahmed@autoserve.sa", address: "الرياض — حي الياسمين", basicSalary: 7200 },
];

export const initialSuppliers: Supplier[] = [
  { name: "شركة موبيل للزيوت", code: "SUP-٠٠١", category: "زيوت ومواد", contact: "أحمد الجهني", phone: "٠١٢٣٤٥٦٧٨٩", orders: 15, lastOrder: "٢٧ أغسطس ٢٠٢٦", status: "نشط" },
  { name: "مؤسسة الخليج للقطع", code: "SUP-٠٠٢", category: "قطع غيار", contact: "سالم العمري", phone: "٠١٩٨٧٦٥٤٣٢", orders: 28, lastOrder: "٢٥ أغسطس ٢٠٢٦", status: "نشط" },
  { name: "Bosch الشرق الأوسط", code: "SUP-٠٠٣", category: "كهرباء وأجهزة", contact: "فريق المبيعات", phone: "٠١٢٢٣٣٤٤٥٥", orders: 9, lastOrder: "١٨ أغسطس ٢٠٢٦", status: "نشط" },
  { name: "شركة الفرامل المتحدة", code: "SUP-٠٠٤", category: "فرامل", contact: "خالد البقمي", phone: "٠١٣٣٤٤٥٥٦٦", orders: 6, lastOrder: "١٠ أغسطس ٢٠٢٦", status: "متأخر" },
];

export const initialWarehouseTransactions: WarehouseTransaction[] = [
  { id: "TXN-٠٨٢٧-٠١", type: "وارد", part: "زيت محرك 5W-30", qty: 50, unit: "لتر", ref: "PO-٢٠٢٦-٠٣٢", date: "٢٧ أغسطس ٢٠٢٦", cost: 7000, createdBy: "محمد أحمد", refType: "أمر شراء" },
  { id: "TXN-٠٨٢٧-٠٢", type: "صادر", part: "فلتر زيت Mann", qty: 3, unit: "قطعة", ref: "WO-١٠٤٧", date: "٢٧ أغسطس ٢٠٢٦", cost: 105, createdBy: "خالد إبراهيم", refType: "أمر تشغيل" },
  { id: "TXN-٠٨٢٦-٠١", type: "صادر", part: "تيل فرامل Brembo", qty: 1, unit: "طقم", ref: "WO-١٠٤٥", date: "٢٦ أغسطس ٢٠٢٦", cost: 220, createdBy: "عمر حسن", refType: "أمر تشغيل" },
  { id: "TXN-٠٨٢٥-٠١", type: "وارد", part: "شمعات NGK", qty: 100, unit: "قطعة", ref: "PO-٢٠٢٦-٠٣١", date: "٢٥ أغسطس ٢٠٢٦", cost: 4500, createdBy: "محمد أحمد", refType: "أمر شراء" },
  { id: "TXN-٠٨٢٤-٠١", type: "صادر", part: "مساعد KYB", qty: 1, unit: "قطعة", ref: "WO-١٠٤٠", date: "٢٤ أغسطس ٢٠٢٦", cost: 850, createdBy: "يوسف كريم", refType: "أمر تشغيل" },
];

export const initialRoles: Role[] = [
  { id: "ROLE-٠١", name: "مدير النظام", users: 2, color: "amber", permissions: ["كل الصلاحيات"] },
  { id: "ROLE-٠٢", name: "مدير الورشة", users: 3, color: "sky", permissions: ["أوامر التشغيل", "الفنيون", "الفحوصات", "عروض الأسعار", "الفواتير"] },
  { id: "ROLE-٠٣", name: "موظف استقبال", users: 4, color: "emerald", permissions: ["العملاء", "السيارات", "المواعيد", "عروض الأسعار"] },
  { id: "ROLE-٠٤", name: "فني ورشة", users: 8, color: "rose", permissions: ["أوامر التشغيل (قراءة)", "الفحوصات"] },
  { id: "ROLE-٠٥", name: "مسؤول مخزن", users: 2, color: "violet", permissions: ["قطع الغيار", "المخازن", "التوريد"] },
];

export const initialSystemUsers: SystemUser[] = [
  { id: "USR-٠٠١", name: "محمد أحمد", email: "m.ahmed@autoserve.sa", role: "مدير النظام", status: "نشط", lastLogin: "٢٧ أغسطس ٢٠٢٦ ٩:١٢ص", avatar: "م" },
  { id: "USR-٠٠٢", name: "فهد الشهري", email: "f.shahri@autoserve.sa", role: "مدير الورشة", status: "نشط", lastLogin: "٢٧ أغسطس ٢٠٢٦ ٨:٤٥ص", avatar: "ف" },
  { id: "USR-٠٠٣", name: "ليلى أحمد", email: "l.ahmed@autoserve.sa", role: "موظف استقبال", status: "نشط", lastLogin: "٢٧ أغسطس ٢٠٢٦ ٨:٠٠ص", avatar: "ل" },
  { id: "USR-٠٠٤", name: "خالد إبراهيم", email: "k.ibrahim@autoserve.sa", role: "فني ورشة", status: "نشط", lastLogin: "٢٦ أغسطس ٢٠٢٦ ٥:٣٠م", avatar: "خ" },
  { id: "USR-٠٠٥", name: "سامي نور", email: "s.noor@autoserve.sa", role: "فني ورشة", status: "نشط", lastLogin: "٢٧ أغسطس ٢٠٢٦ ٧:٥٠ص", avatar: "س" },
  { id: "USR-٠٠٦", name: "عمر حسن", email: "o.hassan@autoserve.sa", role: "مسؤول مخزن", status: "موقوف مؤقتاً", lastLogin: "٢٠ أغسطس ٢٠٢٦ ٢:٠٠م", avatar: "ع" },
];

export const initialInspectionTemplates: InspectionTemplate[] = [
  {
    id: "TMPL-٠١", name: "فحص دوري شامل ٣٠ نقطة", type: "ثابت", points: 30, usedCount: 142,
    sections: [
      { name: "المحرك", items: ["مستوى الزيت", "سائل التبريد", "سير التايمنج", "البطارية"] },
      { name: "الفرامل", items: ["سماكة التيل", "حالة الأقراص", "سائل الفرامل"] },
      { name: "الإطارات", items: ["ضغط الإطارات", "عمق المداس", "التشقق"] },
      { name: "الكهرباء", items: ["الأنوار الأمامية", "الأنوار الخلفية", "الشاشات"] },
    ],
  },
  {
    id: "TMPL-٠٢", name: "فحص ما قبل الشراء", type: "ثابت", points: 45, usedCount: 67,
    sections: [
      { name: "الهيكل الخارجي", items: ["علامات حوادث", "الصدأ", "تطابق الألوان"] },
      { name: "المحرك التفصيلي", items: ["تسريب زيت", "دخان العادم", "أصوات غير طبيعية"] },
    ],
  },
  {
    id: "TMPL-٠٣", name: "فحص التكييف", type: "ثابت", points: 12, usedCount: 89,
    sections: [
      { name: "التبريد", items: ["ضغط الفريون", "حالة الضاغط", "الفلاتر"] },
    ],
  },
];

export const initialCustomInspections: CustomInspection[] = [
  { id: "INSP-٠٠١", name: "فحص ما قبل رحلة طويلة — ناصر القحطاني", car: "لكزس LX ٢٠٢٣", date: "٢٥ أغسطس ٢٠٢٦", tech: "خالد إبراهيم", points: 18, result: "ممتاز", status: "مكتمل", customerSignature: true, damages: [] },
  { id: "INSP-٠٠٢", name: "فحص ضمان — هونداي سوناتا", car: "هونداي سوناتا ٢٠٢١", date: "٢٦ أغسطس ٢٠٢٦", tech: "محمد علي", points: 22, result: "يحتاج صيانة", status: "مكتمل", customerSignature: true, damages: [{ location: "الركن الأمامي الأيسر", note: "خدش قديم من حادث سابق", hasPhoto: true }, { location: "الباب الخلفي الأيمن", note: "أثر صدأ خفيف", hasPhoto: false }] },
  { id: "INSP-٠٠٣", name: "فحص بعد حادث", car: "كيا سبورتاج ٢٠٢٢", date: "٢٧ أغسطس ٢٠٢٦", tech: "عمر حسن", points: 35, result: "—", status: "جاري", customerSignature: false, damages: [{ location: "المقدمة", note: "تلف واضح في الرادياتير وسطح المحرك", hasPhoto: true }] },
];
