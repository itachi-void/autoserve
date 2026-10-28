import { createContext, useContext, useState, type ReactNode } from "react";
import { API_ENABLED } from "./api";
import LiveAppDataProvider from "./LiveAppDataProvider";
import type {
  Customer, Vehicle, Part, Service, ServiceCategory, Technician,
  WorkOrder, Appointment, Invoice, Quotation, PurchaseOrder,
  Employee, Department, Supplier, WarehouseTransaction,
  Role, SystemUser, InspectionTemplate, CustomInspection,
} from "./types";
import {
  initialCustomers, initialVehicles, initialParts, initialServices,
  initialServiceCategories, initialTechnicians, initialWorkOrders,
  initialAppointments, initialInvoices, initialQuotations,
  initialPurchaseOrders, initialDepartments, initialEmployees,
  initialSuppliers, initialWarehouseTransactions, initialRoles,
  initialSystemUsers, initialInspectionTemplates, initialCustomInspections,
} from "./mockData";

export type DataOperation = void | Promise<boolean>;
export type DataSetter<Item> = (action: React.SetStateAction<Item[]>) => DataOperation;

export interface AppDataContextValue {
  loading?: boolean;
  pending?: boolean;
  error?: string | null;
  dataSource?: "api" | "demo";
  refresh?: () => Promise<boolean>;
  customers: Customer[];
  vehicles: Vehicle[];
  parts: Part[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  technicians: Technician[];
  workOrders: WorkOrder[];
  appointments: Appointment[];
  invoices: Invoice[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  departments: Department[];
  employees: Employee[];
  suppliers: Supplier[];
  warehouseTransactions: WarehouseTransaction[];
  roles: Role[];
  systemUsers: SystemUser[];
  inspectionTemplates: InspectionTemplate[];
  customInspections: CustomInspection[];

  setCustomers: DataSetter<Customer>;
  setVehicles: DataSetter<Vehicle>;
  setParts: DataSetter<Part>;
  setServices: DataSetter<Service>;
  setTechnicians: DataSetter<Technician>;
  setWorkOrders: DataSetter<WorkOrder>;
  setAppointments: DataSetter<Appointment>;
  setInvoices: DataSetter<Invoice>;
  setQuotations: DataSetter<Quotation>;
  setPurchaseOrders: DataSetter<PurchaseOrder>;
  setEmployees: DataSetter<Employee>;
  setSystemUsers: DataSetter<SystemUser>;

  updateQuotation: (id: string, update: Partial<Quotation>) => DataOperation;
  updateWorkOrder: (id: string, update: Partial<WorkOrder>) => DataOperation;
  updateInvoice: (id: string, update: Partial<Invoice>) => DataOperation;
  addCustomer: (customer: Customer) => DataOperation;
  addVehicle: (vehicle: Vehicle) => DataOperation;
  addService: (service: Service) => DataOperation;
  addAppointment: (appointment: Appointment) => DataOperation;
  cancelAppointment: (id: string) => DataOperation;
  addQuotation: (quotation: Quotation) => DataOperation;
  addWorkOrder: (order: WorkOrder) => DataOperation;
  addInvoice: (invoice: Invoice) => DataOperation;
  recordPayment: (id: string, amount: number) => DataOperation;
  addPurchaseOrder: (order: PurchaseOrder) => DataOperation;
  receivePurchaseOrder: (id: string) => DataOperation;
  addSystemUser: (user: SystemUser) => DataOperation;
  addCustomInspection: (inspection: CustomInspection) => DataOperation;
  addPart: (part: Part) => DataOperation;
  addTechnician: (technician: Technician) => DataOperation;
  assignWorkOrder: (orderId: string, technicianName: string) => DataOperation;
  addSupplier: (supplier: Supplier) => DataOperation;
  addDepartment: (department: Department) => DataOperation;
  addEmployee: (employee: Employee) => DataOperation;
  addRole: (role: Role) => DataOperation;
  addServiceCategory: (category: ServiceCategory) => DataOperation;
  addInspectionTemplate: (template: InspectionTemplate) => DataOperation;
  updateInspection: (id: string, update: Partial<CustomInspection>) => DataOperation;
  adjustStock: (sku: string, quantity: number, type: "وارد" | "صادر", unitCost: number) => DataOperation;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  return API_ENABLED ? <LiveAppDataProvider>{children}</LiveAppDataProvider> : <DemoAppDataProvider>{children}</DemoAppDataProvider>;
}

function DemoAppDataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [parts, setParts] = useState(initialParts);
  const [services, setServices] = useState(initialServices);
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [quotations, setQuotations] = useState(initialQuotations);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [employees, setEmployees] = useState(initialEmployees);
  const [departments, setDepartments] = useState(initialDepartments);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [roles, setRoles] = useState(initialRoles);
  const [systemUsers, setSystemUsers] = useState(initialSystemUsers);
  const [warehouseTransactions, setWarehouseTransactions] = useState(initialWarehouseTransactions);
  const [customInspections, setCustomInspections] = useState(initialCustomInspections);
  const [serviceCategories, setServiceCategories] = useState(initialServiceCategories);
  const [inspectionTemplates, setInspectionTemplates] = useState(initialInspectionTemplates);

  function updateQuotation(id: string, update: Partial<Quotation>) {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...update } : q)));
  }

  function updateWorkOrder(id: string, update: Partial<WorkOrder>) {
    setWorkOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...update } : o)));
  }

  function updateInvoice(id: string, update: Partial<Invoice>) {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...update } : i)));
  }

  const addCustomer = (customer: Customer) => setCustomers((prev) => [customer, ...prev]);
  const addVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev]);
    setCustomers((prev) => prev.map((c) => c.name === vehicle.owner ? { ...c, cars: c.cars + 1 } : c));
  };
  const addService = (service: Service) => setServices((prev) => [service, ...prev]);
  const addAppointment = (appointment: Appointment) => setAppointments((prev) => [...prev, appointment]);
  const cancelAppointment = (id: string) => setAppointments((prev) => prev.filter((a) => a.id !== id));
  const addQuotation = (quotation: Quotation) => setQuotations((prev) => [quotation, ...prev]);
  const addWorkOrder = (order: WorkOrder) => setWorkOrders((prev) => [order, ...prev]);
  const addInvoice = (invoice: Invoice) => setInvoices((prev) => [invoice, ...prev]);
  const recordPayment = (id: string, amount: number) => {
    setInvoices((prev) => prev.map((invoice) => {
      if (invoice.id !== id) return invoice;
      const paid = Math.min(invoice.total, invoice.paid + amount);
      const balance = invoice.total - paid;
      return { ...invoice, paid, balance, status: balance === 0 ? "مدفوع" : "جزئي" };
    }));
  };
  const addPurchaseOrder = (order: PurchaseOrder) => setPurchaseOrders((prev) => [order, ...prev]);
  const receivePurchaseOrder = (id: string) => {
    const order = purchaseOrders.find((item) => item.id === id);
    if (!order || order.status === "وصل") return;
    setPurchaseOrders((prev) => prev.map((item) => item.id === id ? { ...item, status: "وصل" } : item));
    setParts((prev) => prev.map((part) => {
      const item = order.items.find((entry) => entry.name === part.name);
      return item ? { ...part, stock: part.stock + item.qty } : part;
    }));
    setWarehouseTransactions((prev) => [
      ...order.items.map((item, index) => ({ id: `TX-${Date.now()}-${index}`, type: "توريد", part: item.name, qty: item.qty, unit: item.unit, ref: order.id, date: "٢٧ أغسطس ٢٠٢٦", cost: item.total })),
      ...prev,
    ]);
  };
  const addSystemUser = (user: SystemUser) => setSystemUsers((prev) => [user, ...prev]);
  const addCustomInspection = (inspection: CustomInspection) => setCustomInspections((prev) => [inspection, ...prev]);
  const addPart = (part: Part) => setParts((prev) => [part, ...prev]);
  const addTechnician = (technician: Technician) => setTechnicians((prev) => [technician, ...prev]);
  const assignWorkOrder = (orderId: string, technicianName: string) => {
    const order = workOrders.find((item) => item.id === orderId);
    if (!order) return;
    setWorkOrders((prev) => prev.map((item) => item.id === orderId ? { ...item, tech: technicianName, status: item.status === "مجدول" ? "جاري" : item.status } : item));
    setTechnicians((prev) => prev.map((tech) => tech.name === technicianName ? { ...tech, tasks: tech.tasks + (order.tech === technicianName ? 0 : 1), currentTasks: tech.currentTasks.some((task) => task.id === orderId) ? tech.currentTasks : [...tech.currentTasks, { id: orderId, car: order.car, service: order.services.join("، "), progress: order.progress }] } : tech));
  };
  const addSupplier = (supplier: Supplier) => setSuppliers((prev) => [supplier, ...prev]);
  const addDepartment = (department: Department) => setDepartments((prev) => [department, ...prev]);
  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [employee, ...prev]);
    setDepartments((prev) => prev.map((department) => department.name === employee.dept ? { ...department, count: department.count + 1 } : department));
  };
  const addRole = (role: Role) => setRoles((prev) => [role, ...prev]);

  return (
    <AppDataContext.Provider
      value={{
        dataSource: "demo",
        customers, vehicles, parts, services,
        serviceCategories,
        technicians, workOrders, appointments, invoices, quotations,
        purchaseOrders,
        departments,
        employees,
        suppliers,
        warehouseTransactions,
        roles,
        systemUsers,
        inspectionTemplates,
        customInspections,
        setCustomers, setVehicles, setParts, setServices, setTechnicians,
        setWorkOrders, setAppointments, setInvoices, setQuotations,
        setPurchaseOrders, setEmployees, setSystemUsers,
        updateQuotation, updateWorkOrder, updateInvoice,
        addCustomer, addVehicle, addService, addAppointment, cancelAppointment,
        addQuotation, addWorkOrder, addInvoice, recordPayment, addPurchaseOrder,
        receivePurchaseOrder, addSystemUser, addCustomInspection,
        addPart, addTechnician, assignWorkOrder, addSupplier, addDepartment, addEmployee, addRole,
        addServiceCategory: category => setServiceCategories(previous => [...previous, category]),
        addInspectionTemplate: template => setInspectionTemplates(previous => [...previous, template]),
        updateInspection: (id, update) => setCustomInspections(previous => previous.map(item => item.id === id ? { ...item, ...update } : item)),
        adjustStock: (sku, quantity, type, unitCost) => {
          const part = parts.find(item => item.sku === sku);
          if (!part || quantity <= 0 || type === "صادر" && quantity > part.stock) return;
          setParts(previous => previous.map(item => item.sku === sku ? { ...item, stock: item.stock + (type === "صادر" ? -quantity : quantity) } : item));
          setWarehouseTransactions(previous => [{ id: crypto.randomUUID(), type, part: part.name, qty: quantity, unit: part.salesUoM || "قطعة", ref: "يدوي", date: new Date().toLocaleDateString("ar-SA"), cost: quantity * unitCost }, ...previous]);
        },
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
