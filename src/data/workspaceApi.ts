import { gql, ApiError } from "./api";
import type { Customer, Vehicle, Part, Service, ServiceCategory, Technician, WorkOrder, Appointment, Invoice, Quotation, PurchaseOrder, Employee, Department, Supplier, WarehouseTransaction, Role, SystemUser, InspectionTemplate, CustomInspection } from "./types";

export interface WorkspaceData {
  customers: Customer[]; vehicles: Vehicle[]; parts: Part[]; services: Service[]; serviceCategories: ServiceCategory[];
  technicians: Technician[]; workOrders: WorkOrder[]; appointments: Appointment[]; invoices: Invoice[]; quotations: Quotation[];
  purchaseOrders: PurchaseOrder[]; employees: Employee[]; departments: Department[]; suppliers: Supplier[];
  warehouseTransactions: WarehouseTransaction[]; roles: Role[]; systemUsers: SystemUser[];
  inspectionTemplates: InspectionTemplate[]; customInspections: CustomInspection[];
}
export type WorkspaceKey = keyof WorkspaceData;
type Row = Record<string, unknown>;
const text = (row: Row | undefined, key: string, fallback = "") => typeof row?.[key] === "string" ? row[key] as string : fallback;
const value = (row: Row | undefined, key: string) => typeof row?.[key] === "number" ? row[key] as number : 0;
const rows = (row: Row, key: string) => Array.isArray(row[key]) ? row[key] as Row[] : [];
const strings = (row: Row, key: string) => Array.isArray(row[key]) ? row[key] as string[] : [];
const id = (row: Row) => text(row, "id");
const date = (input: unknown) => typeof input === "string" && !Number.isNaN(Date.parse(input)) ? new Date(input).toLocaleDateString("ar-SA", { calendar: "gregory" }) : "—";
const time = (input: unknown) => typeof input === "string" ? new Date(input).toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" }) : "—";
const state = (status: string, map: Record<string, string>) => map[status] ?? status;
const active = (status: string) => status === "ACTIVE" ? "نشط" : "موقوف";
const workStatus = { PENDING: "مجدول", IN_PROGRESS: "جاري", WAITING_PARTS: "انتظار قطع", COMPLETED: "مكتمل", DELIVERED: "تم التسليم", CANCELLED: "ملغي" };
const estimateStatus = { DRAFT: "معلق", PRESENTED: "انتظار موافقة", APPROVED: "موافق", PARTIALLY_APPROVED: "موافق", REJECTED: "مرفوض", EXPIRED: "منتهي الصلاحية" };
const purchaseStatus = { DRAFT: "معلق", SENT: "في الطريق", PARTIALLY_RECEIVED: "في الطريق", RECEIVED: "وصل", CANCELLED: "ملغى" };
const employeeStatus = { ACTIVE: "نشط", ON_LEAVE: "إجازة", SUSPENDED: "موقوف", TERMINATED: "موقوف" };
const technicianStatus = { AVAILABLE: "نشط", BUSY: "مشغول", ON_BREAK: "إجازة", OFF: "موقوف" };

export const emptyWorkspace = (): WorkspaceData => ({ customers: [], vehicles: [], parts: [], services: [], serviceCategories: [], technicians: [], workOrders: [], appointments: [], invoices: [], quotations: [], purchaseOrders: [], employees: [], departments: [], suppliers: [], warehouseTransactions: [], roles: [], systemUsers: [], inspectionTemplates: [], customInspections: [] });

const selections: Record<string, string> = {
  customers: "id name phone email address type status outstandingBalance createdAt",
  vehicles: "id customerId plate make model year trim color vin mileage createdAt ownershipHistory { customerId fromDate toDate }",
  spareParts: "id sku name category brand barcode oem salesUoM price minStock compatibleVehicles alternativeIds",
  inventoryItems: "id sparePartId quantity allocatedQuantity averageCost availableQuantity",
  services: "id name categoryId description basePrice extraPrice durationHours pricingModel requiredBayType requiredSpecialty status",
  serviceCategories: "id name description icon color",
  technicians: "id employeeId specialty status maxTasks rating completedJobs efficiency createdAt timeLogs { task clockIn clockOut status }",
  employees: "id name jobTitle departmentId phone email address status statusReason basicSalary joinDate",
  departments: "id name description color headEmployeeId",
  suppliers: "id name code category contactName phone status",
  purchaseOrders: "id number supplierId orderDate expectedDate status notes total items { sparePartId name quantity unit unitPrice total }",
  appointments: "id customerId vehicleId serviceId technicianId scheduledAt complaintNotes estimatedDurationHours status",
  inspectionTemplates: "id name type sections { name items }",
  inspections: "id name templateId vehicleId technicianId status result customerSignatureUrl createdAt damages { location note photoUrl }",
  estimates: "id number customerId vehicleId inspectionSessionId validUntil discount subtotal vat total status presentedAt approvedAt createdAt lineItems { kind name price quantity decision rejectionReason }",
  workOrders: "id number customerId vehicleId technicianId estimateId status priority total progress notes startedAt completedAt createdAt lines { kind name price quantity } supplements { reason amount status requestedAt }",
  invoices: "id number customerId vehicleId workOrderId subtotal discount vat total paidAmount balance status paidAt createdAt payments { amount method reference paidAt }",
  stockTransactions: "id sparePartId type quantity unitCost referenceId referenceType createdBy createdAt",
  roles: "id key name color permissions",
  systemUsers: "id name email roles isActive lastLoginAt",
};
const unpaged = new Set(["serviceCategories", "departments", "suppliers", "roles", "inspectionTemplates"]);

async function readCollection(name: string): Promise<Row[]> {
  if (unpaged.has(name)) return (await gql<Record<string, Row[]>>(`query { ${name} { ${selections[name]} } }`))[name];
  const result: Row[] = [];
  let total = Infinity;
  while (result.length < total) {
    const response = await gql<Record<string, { items: Row[]; totalCount: number }>>(`query($skip: Int!) { ${name}(skip: $skip, take: 100${name === "systemUsers" ? "" : ", order: { id: ASC }"}) { items { ${selections[name]} } totalCount } }`, { skip: result.length });
    const page = response[name];
    result.push(...page.items); total = page.totalCount;
    if (!page.items.length) break;
  }
  return result;
}

export async function fetchWorkspace(): Promise<WorkspaceData> {
  const { me, accessPermissions } = await gql<{ me: { roles: string[] } | null; accessPermissions: string[] }>("query { me { roles } accessPermissions }");
  if (!me) throw new ApiError("انتهت الجلسة، يرجى تسجيل الدخول", "UNAUTHENTICATED");
  const { workspaceReferences } = await gql<{ workspaceReferences: Record<string, Row[]> }>("query { workspaceReferences { customers { id name } vehicles { id customerId make model year plate } services { id name basePrice } technicians { id employeeId } employees { id name } } }");
  const raw: Record<string, Row[]> = {};
  const collectionPermissions: Record<string, string> = {
    customers: "customers", vehicles: "vehicles", spareParts: "inventory", inventoryItems: "warehouse",
    stockTransactions: "warehouse", services: "services", serviceCategories: "services",
    employees: "employees", departments: "employees", technicians: "technicians",
    suppliers: "purchases", purchaseOrders: "purchases", appointments: "appointments",
    inspectionTemplates: "inspections", inspections: "inspections", estimates: "estimates",
    workOrders: "workorders", invoices: "invoices", roles: "administration", systemUsers: "administration",
  };
  for (const name of Object.keys(selections)) {
    if (!accessPermissions.includes(collectionPermissions[name])) { raw[name] = workspaceReferences[name] ?? []; continue; }
    if (["roles", "systemUsers"].includes(name) && !accessPermissions.includes("administration")) { raw[name] = []; continue; }
    if (name === "invoices" && !accessPermissions.includes("invoices")) { raw[name] = []; continue; }
    raw[name] = await readCollection(name);
  }
  const lookup = (collection: string, identifier: unknown) => raw[collection].find(item => id(item) === identifier);
  const name = (collection: string, identifier: unknown) => text(lookup(collection, identifier), "name", "—");
  const car = (identifier: unknown) => { const vehicle = lookup("vehicles", identifier); return vehicle ? `${text(vehicle, "make")} ${text(vehicle, "model")} ${value(vehicle, "year")}` : "—"; };
  const techName = (identifier: unknown) => name("employees", lookup("technicians", identifier)?.employeeId);
  const result = emptyWorkspace();
  result.customers = raw.customers.map(item => {
    const visits = raw.workOrders.filter(order => order.customerId === item.id);
    const customerInvoices = raw.invoices.filter(invoice => invoice.customerId === item.id);
    return { apiId: id(item), id: id(item), name: text(item, "name"), phone: text(item, "phone"), email: text(item, "email"), address: text(item, "address"), type: item.type === "COMPANY" ? "شركة" : "فرد", status: value(item, "outstandingBalance") > 0 ? "دين" : active(text(item, "status")), debt: value(item, "outstandingBalance"), cars: raw.vehicles.filter(vehicle => vehicle.customerId === item.id).length, totalSpent: customerInvoices.reduce((sum, invoice) => sum + value(invoice, "paidAmount"), 0), lastVisit: visits.length ? date(visits.sort((first, second) => text(second, "createdAt").localeCompare(text(first, "createdAt")))[0].createdAt) : "لم يزر بعد", createdAt: date(item.createdAt) };
  });
  result.vehicles = raw.vehicles.map(item => ({ apiId: id(item), plate: text(item, "plate"), make: text(item, "make"), model: text(item, "model"), year: String(value(item, "year")), trim: text(item, "trim"), color: text(item, "color"), vin: text(item, "vin"), mileage: value(item, "mileage"), owner: name("customers", item.customerId), registeredAt: date(item.createdAt), lastService: date(raw.workOrders.filter(order => order.vehicleId === item.id && order.completedAt).sort((first, second) => text(second, "completedAt").localeCompare(text(first, "completedAt")))[0]?.completedAt), ownershipHistory: rows(item, "ownershipHistory").map(owner => name("customers", owner.customerId)) }));
  result.parts = raw.spareParts.map(item => {
    const stock = raw.inventoryItems.find(entry => entry.sparePartId === item.id);
    return { apiId: id(item), sku: text(item, "sku"), name: text(item, "name"), category: text(item, "category"), brand: text(item, "brand"), price: value(item, "price"), stock: value(stock, "quantity"), minStock: value(item, "minStock"), compatible: strings(item, "compatibleVehicles"), alternatives: strings(item, "alternativeIds"), barcode: text(item, "barcode"), oem: text(item, "oem"), salesUoM: text(item, "salesUoM"), averageCost: value(stock, "averageCost"), available: value(stock, "availableQuantity"), allocated: value(stock, "allocatedQuantity") };
  });
  result.serviceCategories = raw.serviceCategories.map(item => ({ apiId: id(item), id: id(item), name: text(item, "name"), description: text(item, "description"), icon: text(item, "icon"), color: text(item, "color", "sky") }));
  result.services = raw.services.map(item => ({ apiId: id(item), id: id(item), name: text(item, "name"), category: name("serviceCategories", item.categoryId), description: text(item, "description"), basePrice: value(item, "basePrice"), extraPrice: item.extraPrice === null ? null : value(item, "extraPrice"), duration: `${Math.round(value(item, "durationHours") * 60)} دقيقة`, status: active(text(item, "status")), pricingModel: item.pricingModel === "HOURLY" ? "حسب العمالة" : "ثابت", requiredBay: text(item, "requiredBayType"), requiredSpecialty: text(item, "requiredSpecialty") }));
  result.workOrders = raw.workOrders.map(item => ({ apiId: id(item), id: text(item, "number"), customer: name("customers", item.customerId), car: car(item.vehicleId), tech: item.technicianId ? techName(item.technicianId) : "غير مسند", status: state(text(item, "status"), workStatus), priority: item.priority === "URGENT" ? "عاجل" : "عادي", total: value(item, "total"), progress: value(item, "progress"), date: date(item.createdAt), startedAt: text(item, "startedAt"), completedAt: text(item, "completedAt"), estimateId: text(item, "estimateId"), notes: text(item, "notes"), services: rows(item, "lines").filter(line => line.kind === "SERVICE").map(line => text(line, "name")), parts: rows(item, "lines").filter(line => line.kind === "PART").map(line => text(line, "name")), supplements: rows(item, "supplements").map(line => ({ reason: text(line, "reason"), amount: value(line, "amount"), status: state(text(line, "status"), { PENDING: "بانتظار الموافقة", APPROVED: "موافق", REJECTED: "مرفوض" }), requestedAt: date(line.requestedAt) })) }));
  result.technicians = raw.technicians.map(item => {
    const employee = lookup("employees", item.employeeId);
    const tasks = result.workOrders.filter(order => order.tech === text(employee, "name") && ["جاري", "انتظار قطع"].includes(order.status));
    return { apiId: id(item), id: id(item), employeeId: text(item, "employeeId"), name: text(employee, "name"), phone: text(employee, "phone"), specialty: text(item, "specialty"), status: state(text(item, "status"), technicianStatus), tasks: tasks.length, maxTasks: value(item, "maxTasks"), rating: value(item, "rating"), completedJobs: value(item, "completedJobs"), efficiency: value(item, "efficiency"), joinDate: date(employee?.joinDate), currentTasks: tasks.map(order => ({ id: order.id, car: order.car, service: order.services.join("، "), progress: order.progress })), timeLogs: rows(item, "timeLogs").map(log => ({ task: text(log, "task"), clockIn: time(log.clockIn), clockOut: log.clockOut ? time(log.clockOut) : null, status: state(text(log, "status"), { RUNNING: "جاري", PAUSED: "متوقف", COMPLETED: "منتهي" }) })) };
  });
  result.employees = raw.employees.map(item => ({ apiId: id(item), id: id(item), name: text(item, "name"), role: text(item, "jobTitle"), dept: name("departments", item.departmentId), phone: text(item, "phone"), email: text(item, "email"), address: text(item, "address"), basicSalary: value(item, "basicSalary"), status: state(text(item, "status"), employeeStatus), statusReason: text(item, "statusReason"), since: date(item.joinDate), tasks: result.technicians.find(tech => tech.employeeId === item.id)?.tasks ?? 0 }));
  result.departments = raw.departments.map(item => ({ apiId: id(item), name: text(item, "name"), head: name("employees", item.headEmployeeId), count: raw.employees.filter(employee => employee.departmentId === item.id).length, color: text(item, "color", "sky"), description: text(item, "description") }));
  result.suppliers = raw.suppliers.map(item => ({ apiId: id(item), name: text(item, "name"), code: text(item, "code"), category: text(item, "category"), contact: text(item, "contactName"), phone: text(item, "phone"), status: active(text(item, "status")), orders: raw.purchaseOrders.filter(order => order.supplierId === item.id).length, lastOrder: date(raw.purchaseOrders.filter(order => order.supplierId === item.id).sort((first, second) => text(second, "orderDate").localeCompare(text(first, "orderDate")))[0]?.orderDate) }));
  result.purchaseOrders = raw.purchaseOrders.map(item => ({ apiId: id(item), id: text(item, "number"), supplier: name("suppliers", item.supplierId), supplierCode: text(lookup("suppliers", item.supplierId), "code"), date: text(item, "orderDate"), expectedDate: text(item, "expectedDate"), status: state(text(item, "status"), purchaseStatus), notes: text(item, "notes"), total: value(item, "total"), items: rows(item, "items").map(line => ({ name: text(line, "name"), qty: value(line, "quantity"), unit: text(line, "unit"), unitPrice: value(line, "unitPrice"), total: value(line, "total") })) }));
  result.appointments = raw.appointments.filter(item => item.status !== "CANCELLED").map(item => { const scheduled = new Date(text(item, "scheduledAt")); return { apiId: id(item), id: id(item), scheduledAt: text(item, "scheduledAt"), customer: name("customers", item.customerId), car: car(item.vehicleId), service: name("services", item.serviceId), tech: item.technicianId ? techName(item.technicianId) : "غير مسند", day: (scheduled.getDay() + 1) % 7, hour: scheduled.getHours() - 8, color: "sky", displayTime: time(item.scheduledAt), displayStatus: state(text(item, "status"), { SCHEDULED: "قادم", CONFIRMED: "مؤكد", CHECKED_IN: "وصل", COMPLETED: "مكتمل", NO_SHOW: "لم يحضر" }), complaintNotes: text(item, "complaintNotes"), estimatedDuration: String(value(item, "estimatedDurationHours")) }; });
  result.inspectionTemplates = raw.inspectionTemplates.map(item => ({ apiId: id(item), id: id(item), name: text(item, "name"), type: text(item, "type"), points: rows(item, "sections").reduce((sum, section) => sum + strings(section, "items").length, 0), usedCount: raw.inspections.filter(inspection => inspection.templateId === item.id).length, sections: rows(item, "sections").map(section => ({ name: text(section, "name"), items: strings(section, "items") })) }));
  result.customInspections = raw.inspections.map(item => ({ apiId: id(item), id: id(item), templateId: text(item, "templateId"), name: text(item, "name"), car: car(item.vehicleId), tech: item.technicianId ? techName(item.technicianId) : "غير مسند", date: date(item.createdAt), points: result.inspectionTemplates.find(template => template.id === item.templateId)?.points ?? 0, result: text(item, "result", "بانتظار الفحص"), status: state(text(item, "status"), { DRAFT: "مجدول", IN_PROGRESS: "جاري", COMPLETED: "مكتمل" }), customerSignature: Boolean(item.customerSignatureUrl), damages: rows(item, "damages").map(damage => ({ location: text(damage, "location"), note: text(damage, "note"), hasPhoto: Boolean(damage.photoUrl) })) }));
  result.quotations = raw.estimates.map(item => {
    const lines = (kind: string) => rows(item, "lineItems").filter(line => line.kind === kind).map(line => ({ name: text(line, "name"), price: value(line, "price"), qty: value(line, "quantity"), decision: text(line, "decision"), rejectionReason: text(line, "rejectionReason") }));
    return { apiId: id(item), id: text(item, "number"), customer: name("customers", item.customerId), car: car(item.vehicleId), date: date(item.createdAt), validUntil: text(item, "validUntil"), discount: value(item, "discount"), subtotal: value(item, "subtotal"), vat: value(item, "vat"), total: value(item, "total"), status: state(text(item, "status"), estimateStatus), approvedAt: date(item.approvedAt), presentedAt: date(item.presentedAt), linkedInspection: text(item, "inspectionSessionId"), services: lines("SERVICE"), parts: lines("PART") };
  });
  result.invoices = raw.invoices.map(item => ({ apiId: id(item), id: text(item, "number"), customer: name("customers", item.customerId), car: car(item.vehicleId), workOrder: text(lookup("workOrders", item.workOrderId), "number"), date: date(item.createdAt), subtotal: value(item, "subtotal"), discount: value(item, "discount"), vat: value(item, "vat"), total: value(item, "total"), paid: value(item, "paidAmount"), balance: value(item, "balance"), status: state(text(item, "status"), { UNPAID: "معلق", PARTIALLY_PAID: "جزئي", PAID: "مدفوع", CANCELLED: "ملغى" }), paidAt: date(item.paidAt), payments: rows(item, "payments").map(payment => ({ amount: value(payment, "amount"), method: state(text(payment, "method"), { CASH: "نقدي", CARD: "بطاقة", BANK_TRANSFER: "تحويل بنكي", CHEQUE: "شيك" }), date: date(payment.paidAt), reference: text(payment, "reference") })) }));
  result.warehouseTransactions = raw.stockTransactions.map(item => ({ apiId: id(item), id: id(item), type: item.type === "OUT" ? "صادر" : "وارد", part: name("spareParts", item.sparePartId), qty: value(item, "quantity"), unit: text(lookup("spareParts", item.sparePartId), "salesUoM"), ref: text(lookup("purchaseOrders", item.referenceId), "number", text(item, "referenceId", "—")), date: date(item.createdAt), cost: value(item, "unitCost") * value(item, "quantity"), createdBy: text(item, "createdBy"), refType: text(item, "referenceType") }));
  result.roles = raw.roles.map(item => ({ apiId: id(item), id: id(item), key: text(item, "key"), name: text(item, "name"), color: text(item, "color", "sky"), permissions: strings(item, "permissions"), users: raw.systemUsers.filter(user => strings(user, "roles").includes(text(item, "key"))).length }));
  result.systemUsers = raw.systemUsers.map(item => ({ apiId: id(item), id: id(item), name: text(item, "name"), email: text(item, "email"), role: result.roles.find(role => role.key === strings(item, "roles")[0])?.name ?? strings(item, "roles")[0] ?? "", status: item.isActive ? "نشط" : "موقوف", lastLogin: date(item.lastLoginAt), avatar: text(item, "name").slice(0, 2) }));
  return result;
}

const reverse = (label: string, mapping: Record<string, string>, fallback: string) => Object.keys(mapping).find(key => mapping[key] === label) ?? fallback;
const ascii = (input: string) => input.replace(/[٠-٩]/g, character => String("٠١٢٣٤٥٦٧٨٩".indexOf(character)));
const numeric = (input: string) => Number(ascii(input).match(/[\d.]+/)?.[0] ?? 0);
const unique = <T extends { apiId?: string }>(collection: T[], test: (item: T) => boolean, label: string) => { const found = collection.filter(test); if (found.length !== 1 || !found[0].apiId) throw new ApiError(`اختر ${label} مسجلاً وغير ملتبس`); return found[0].apiId; };
const carId = (data: WorkspaceData, label: string) => unique(data.vehicles, item => `${item.make} ${item.model} ${item.year}` === label || `${item.make} ${item.model}` === label || item.plate === label, "سيارة");
const customerId = (data: WorkspaceData, label: string) => unique(data.customers, item => item.name === label || item.id === label, "عميلاً");
const techId = (data: WorkspaceData, label: string) => !label || label === "غير مسند" ? null : unique(data.technicians, item => item.name === label || item.id === label, "فنياً");

export async function mutateWorkspace(field: string, type: string, input: unknown): Promise<void> {
  await gql(`mutation($input: ${type}!) { ${field}(input: $input) { id } }`, { input });
}

export async function saveWorkspaceItem<Key extends WorkspaceKey>(key: Key, item: WorkspaceData[Key][number], data: WorkspaceData): Promise<void> {
  const inputId = item.apiId ?? null;
  switch (key) {
    case "serviceCategories": { const row = item as ServiceCategory; await mutateWorkspace("saveServiceCategory", "SaveCategoryInput", { id: inputId, name: row.name, description: row.description || null, color: row.color, icon: row.icon }); break; }
    case "inspectionTemplates": { const row = item as InspectionTemplate; await mutateWorkspace("saveInspectionTemplate", "SaveTemplateInput", { id: inputId, name: row.name, type: row.type, sections: row.sections }); break; }
    case "customers": { const row = item as Customer; await mutateWorkspace(inputId ? "updateCustomer" : "createCustomer", inputId ? "UpdateCustomerInput" : "CreateCustomerInput", { ...(inputId ? { id: inputId, status: row.status === "موقوف" ? "INACTIVE" : "ACTIVE" } : {}), name: row.name, phone: row.phone, email: row.email || null, address: row.address || null, type: row.type === "شركة" ? "COMPANY" : "INDIVIDUAL" }); break; }
    case "vehicles": { const row = item as Vehicle; const input = { customerId: customerId(data, row.owner), plate: row.plate, make: row.make, model: row.model, year: numeric(row.year), color: row.color, mileage: row.mileage, vin: row.vin }; await mutateWorkspace(inputId ? "saveVehicle" : "createVehicle", inputId ? "SaveVehicleInput" : "CreateVehicleInput", inputId ? { ...input, id: inputId } : { ...input, trim: row.trim || null }); break; }
    case "parts": { const row = item as Part; await mutateWorkspace("saveSparePart", "SavePartInput", { id: inputId, sku: row.sku, name: row.name, category: row.category, brand: row.brand, unit: row.salesUoM || "قطعة", price: row.price, minStock: row.minStock, quantity: row.stock, cost: row.averageCost ?? row.price, compatible: row.compatible, barcode: row.barcode || null, oem: row.oem || null }); break; }
    case "services": { const row = item as Service; await mutateWorkspace("saveService", "SaveServiceInput", { id: inputId, name: row.name, categoryId: unique(data.serviceCategories, category => category.name === row.category, "تصنيفاً"), basePrice: row.basePrice, extraPrice: row.extraPrice, durationHours: numeric(row.duration) / (row.duration.includes("ساعة") ? 1 : 60), status: row.status === "نشط" ? "ACTIVE" : "INACTIVE", description: row.description || null, pricingModel: row.pricingModel === "حسب العمالة" ? "HOURLY" : "FIXED", requiredBay: row.requiredBay || null, requiredSpecialty: row.requiredSpecialty || null }); break; }
    case "departments": { const row = item as Department; await mutateWorkspace("saveDepartment", "SaveDepartmentInput", { id: inputId, name: row.name, color: row.color, description: row.description || null, headEmployeeId: !row.head || row.head === "—" ? null : unique(data.employees, employee => employee.name === row.head, "رئيس قسم") }); break; }
    case "employees": { const row = item as Employee; await mutateWorkspace("saveEmployee", "SaveEmployeeInput", { id: inputId, name: row.name, jobTitle: row.role, departmentId: unique(data.departments, department => department.name === row.dept, "قسماً"), phone: row.phone, email: row.email || null, address: row.address || null, basicSalary: row.basicSalary ?? 0, status: reverse(row.status, employeeStatus, "ACTIVE") }); break; }
    case "technicians": { const row = item as Technician; await mutateWorkspace("saveTechnician", "SaveTechnicianInput", { id: inputId, name: row.name, phone: row.phone, specialty: row.specialty, status: reverse(row.status, technicianStatus, "AVAILABLE"), maxTasks: row.maxTasks }); break; }
    case "suppliers": { const row = item as Supplier; await mutateWorkspace("saveSupplier", "SaveSupplierInput", { id: inputId, name: row.name, code: row.code, category: row.category, contactName: row.contact, phone: row.phone, status: row.status === "نشط" ? "ACTIVE" : "INACTIVE" }); break; }
    case "purchaseOrders": { const row = item as PurchaseOrder; await mutateWorkspace("savePurchaseOrder", "SavePurchaseOrderInput", { id: inputId, supplierId: unique(data.suppliers, supplier => supplier.code === row.supplierCode, "مورداً"), expectedDate: row.expectedDate || null, notes: row.notes || null, status: reverse(row.status, purchaseStatus, "DRAFT"), items: row.items.map(line => ({ sparePartId: unique(data.parts, part => part.name === line.name, "قطعة"), quantity: line.qty, unit: line.unit, unitPrice: line.unitPrice })) }); break; }
    case "appointments": { const row = item as Appointment; const scheduled = new Date(); scheduled.setDate(scheduled.getDate() - ((scheduled.getDay() + 1) % 7) + row.day); scheduled.setHours(8 + row.hour, 0, 0, 0); await mutateWorkspace("saveAppointment", "SaveAppointmentInput", { id: inputId, customerId: customerId(data, row.customer), vehicleId: carId(data, row.car), serviceId: unique(data.services, service => service.name === row.service, "خدمة"), technicianId: techId(data, row.tech), scheduledAt: row.scheduledAt || scheduled.toISOString(), estimatedDurationHours: numeric(row.estimatedDuration || "1") || 1, complaintNotes: row.complaintNotes || null, status: row.displayStatus === "ملغي" ? "CANCELLED" : "SCHEDULED" }); break; }
    case "customInspections": { const row = item as CustomInspection; if (!row.templateId) throw new ApiError("اختر قالب فحص"); await mutateWorkspace("saveInspection", "SaveInspectionInput", { id: inputId, name: row.name, templateId: row.templateId, vehicleId: carId(data, row.car), technicianId: techId(data, row.tech), status: row.status === "مكتمل" ? "COMPLETED" : row.status === "جاري" ? "IN_PROGRESS" : "DRAFT", result: row.result }); break; }
    case "quotations": { const row = item as Quotation; await mutateWorkspace("saveEstimate", "SaveEstimateInput", { id: inputId, customerId: customerId(data, row.customer), vehicleId: carId(data, row.car), validUntil: /^\d{4}-\d{2}-\d{2}$/.test(row.validUntil) ? row.validUntil : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), discount: row.discount, status: reverse(row.status, estimateStatus, "PRESENTED"), inspectionSessionId: row.linkedInspection || null, lines: [...row.services.map(line => ({ ...line, kind: "SERVICE" })), ...row.parts.map(line => ({ ...line, kind: "PART" }))].map(line => ({ kind: line.kind, name: line.name, price: line.price, quantity: line.qty, decision: row.status === "موافق" ? "ACCEPTED" : line.decision || "PENDING", rejectionReason: line.rejectionReason || null })) }); break; }
    case "workOrders": { const row = item as WorkOrder; if (inputId) { await mutateWorkspace("changeWorkOrder", "ChangeWorkOrderInput", { id: inputId, technicianId: techId(data, row.tech), status: reverse(row.status, workStatus, "PENDING"), progress: row.progress, notes: row.notes || null }); } else { await mutateWorkspace("createWorkOrder", "CreateWorkOrderInput", { customerId: customerId(data, row.customer), vehicleId: carId(data, row.car), technicianId: techId(data, row.tech), estimateId: row.estimateId || null, priority: row.priority === "عاجل" ? "URGENT" : "NORMAL", notes: row.notes || null, lines: [...row.services.map(name => ({ kind: "SERVICE", name, price: data.services.find(service => service.name === name)?.basePrice ?? 0, quantity: 1 })), ...row.parts.map(name => ({ kind: "PART", name, price: data.parts.find(part => part.name === name)?.price ?? 0, quantity: 1 }))] }); } break; }
    case "invoices": { const row = item as Invoice; if (inputId) throw new ApiError("استخدم تسجيل الدفعات لتعديل الفاتورة"); await mutateWorkspace("createInvoice", "CreateInvoiceInput", { workOrderId: unique(data.workOrders, order => order.id === row.workOrder, "أمر تشغيل"), discount: row.discount ?? 0 }); break; }
    case "roles": { const row = item as Role; await mutateWorkspace("saveRole", "SaveRoleInput", { id: inputId, key: row.key || `custom-${crypto.randomUUID()}`, name: row.name, color: row.color, permissions: row.permissions }); break; }
    case "systemUsers": { const row = item as SystemUser; await mutateWorkspace("saveSystemUser", "SaveSystemUserInput", { id: inputId, name: row.name, email: row.email, roleKey: data.roles.find(role => role.name === row.role)?.key, isActive: row.status === "نشط", password: row.password || null }); break; }
    default: throw new ApiError("هذه البيانات محسوبة؛ استخدم عملية الوحدة المرتبطة");
  }
}

export async function deleteWorkspaceItem<Key extends WorkspaceKey>(key: Key, item: WorkspaceData[Key][number]): Promise<void> {
  if (key !== "employees" || !item.apiId) throw new ApiError("لا يمكن حذف هذا السجل؛ استخدم تغيير الحالة");
  await gql("mutation($id: UUID!) { deleteEmployee(id: $id) }", { id: item.apiId });
}
