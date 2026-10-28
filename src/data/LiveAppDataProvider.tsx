import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppDataContext, type AppDataContextValue, type DataSetter } from "./AppDataContext";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { ApiError, gql } from "./api";
import { emptyWorkspace, fetchWorkspace, saveWorkspaceItem, deleteWorkspaceItem, mutateWorkspace, type WorkspaceData, type WorkspaceKey } from "./workspaceApi";

export default function LiveAppDataProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<WorkspaceData>(emptyWorkspace);
  const [loading, setLoading] = useState(Boolean(user));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentData = useRef(data);
  const operationLock = useRef(false);
  const sessionGeneration = useRef(0);
  const requestGeneration = useRef(0);
  currentData.current = data;
  const reportError = useCallback((cause: unknown) => {
    const message = cause instanceof Error ? cause.message : "تعذّر الاتصال بالخادم";
    setError(message); toast(message, "error");
    if (cause instanceof ApiError && cause.code === "UNAUTHENTICATED") logout();
  }, [logout, toast]);
  const reportRef = useRef(reportError);
  reportRef.current = reportError;

  const refresh = useCallback(async (silent = false) => {
    if (silent && operationLock.current) return false;
    const session = sessionGeneration.current;
    const request = ++requestGeneration.current;
    try {
      const next = await fetchWorkspace();
      if (session !== sessionGeneration.current || request !== requestGeneration.current || (silent && operationLock.current)) return false;
      currentData.current = next; setData(next); setError(null); return true;
    } catch (cause) {
      if (session === sessionGeneration.current && request === requestGeneration.current) {
        if (!silent || (cause instanceof ApiError && cause.code === "UNAUTHENTICATED")) reportRef.current(cause);
        else setError(cause instanceof Error ? cause.message : "تعذّرت المزامنة التلقائية؛ أعد تحديث البيانات");
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const session = ++sessionGeneration.current;
    setData(emptyWorkspace()); currentData.current = emptyWorkspace(); setError(null);
    if (!user) { setLoading(false); return; }
    setLoading(true);
    void refresh().finally(() => { if (session === sessionGeneration.current) setLoading(false); });
    return () => { sessionGeneration.current++; };
  }, [user?.email, user?.accessToken, refresh]);

  useEffect(() => {
    if (!user || loading) return;
    let stopped = false;
    let running = false;
    let delay = 10_000;
    let timer: ReturnType<typeof setTimeout>;
    const sync = async () => {
      if (stopped || running) return;
      clearTimeout(timer);
      if (document.visibilityState === "visible" && navigator.onLine && !operationLock.current) {
        running = true;
        try { delay = await refresh(true) ? 10_000 : Math.min(delay * 2, 60_000); }
        finally { running = false; }
      }
      if (!stopped) timer = setTimeout(() => void sync(), delay);
    };
    const resume = () => { if (document.visibilityState === "visible") void sync(); };
    timer = setTimeout(() => void sync(), delay);
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [user?.email, user?.accessToken, loading, refresh]);

  const execute = async (operation: (snapshot: WorkspaceData) => Promise<void>) => {
    if (operationLock.current) { toast("عملية حفظ قيد التنفيذ؛ انتظر اكتمالها", "info"); return false; }
    operationLock.current = true; ++requestGeneration.current; setPending(true);
    const session = sessionGeneration.current;
    try {
      await operation(currentData.current);
      if (session !== sessionGeneration.current) return false;
      const refreshed = await refresh();
      if (!refreshed) toast("تم الحفظ في الخادم، لكن تحديث البيانات تعذّر؛ أعد تحميل البيانات قبل المحاولة مجدداً", "warning");
      return true;
    } catch (cause) {
      if (session === sessionGeneration.current) { await refresh(); reportRef.current(cause); }
      return false;
    } finally { operationLock.current = false; setPending(false); }
  };

  const add = <Key extends WorkspaceKey>(key: Key, item: WorkspaceData[Key][number]) => execute(snapshot => saveWorkspaceItem(key, item, snapshot));
  const setter = <Key extends WorkspaceKey>(key: Key): DataSetter<WorkspaceData[Key][number]> => action => execute(async snapshot => {
    const before = snapshot[key] as WorkspaceData[Key][number][];
    const after = typeof action === "function" ? action(before) : action;
    for (const item of after) {
      const existing = before.find(candidate => candidate.apiId && candidate.apiId === item.apiId);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) await saveWorkspaceItem(key, item, snapshot);
    }
    for (const item of before) if (!after.some(candidate => candidate.apiId === item.apiId)) await deleteWorkspaceItem(key, item);
  });
  const update = <Key extends WorkspaceKey>(key: Key, identifier: string, patch: Partial<WorkspaceData[Key][number]>) => execute(async snapshot => {
    const item = snapshot[key].find(candidate => "id" in candidate && candidate.id === identifier);
    if (!item) throw new ApiError("السجل غير موجود");
    await saveWorkspaceItem(key, { ...item, ...patch }, snapshot);
  });
  const values: AppDataContextValue = {
    ...data, loading, pending, error, refresh, dataSource: "api",
    setCustomers: setter("customers"), setVehicles: setter("vehicles"), setParts: setter("parts"), setServices: setter("services"),
    setTechnicians: setter("technicians"), setWorkOrders: setter("workOrders"), setAppointments: setter("appointments"), setInvoices: setter("invoices"),
    setQuotations: setter("quotations"), setPurchaseOrders: setter("purchaseOrders"), setEmployees: setter("employees"), setSystemUsers: setter("systemUsers"),
    addCustomer: item => add("customers", item), addVehicle: item => add("vehicles", item), addService: item => add("services", item),
    addAppointment: item => add("appointments", item), addQuotation: item => add("quotations", item), addWorkOrder: item => add("workOrders", item),
    addInvoice: item => add("invoices", item), addPurchaseOrder: item => add("purchaseOrders", item), addSystemUser: item => add("systemUsers", item),
    addCustomInspection: item => add("customInspections", item), addPart: item => add("parts", item), addTechnician: item => add("technicians", item),
    addSupplier: item => add("suppliers", item), addDepartment: item => add("departments", item), addEmployee: item => add("employees", item), addRole: item => add("roles", item),
    addServiceCategory: item => add("serviceCategories", item), addInspectionTemplate: item => add("inspectionTemplates", item),
    updateInspection: (identifier, patch) => update("customInspections", identifier, patch),
    adjustStock: (sku, quantity, type, unitCost) => execute(async snapshot => { const part = snapshot.parts.find(item => item.sku === sku); if (!part?.apiId) throw new ApiError("القطعة غير موجودة"); await mutateWorkspace("adjustStock", "StockAdjustmentInput", { sparePartId: part.apiId, quantity, unitCost, type: type === "صادر" ? "OUT" : "IN", referenceType: "manual" }); }),
    updateQuotation: (identifier, patch) => update("quotations", identifier, patch), updateWorkOrder: (identifier, patch) => update("workOrders", identifier, patch), updateInvoice: (identifier, patch) => update("invoices", identifier, patch),
    cancelAppointment: identifier => execute(async snapshot => { const item = snapshot.appointments.find(candidate => candidate.id === identifier); if (!item) throw new ApiError("الموعد غير موجود"); await saveWorkspaceItem("appointments", { ...item, displayStatus: "ملغي" }, snapshot); }),
    recordPayment: (identifier, amount) => execute(async snapshot => {
      const item = snapshot.invoices.find(candidate => candidate.id === identifier);
      if (!item?.apiId) throw new ApiError("الفاتورة غير موجودة");
      const key = `payment-attempt:${item.apiId}:${amount}:CASH`;
      const requestId = sessionStorage.getItem(key) ?? crypto.randomUUID();
      sessionStorage.setItem(key, requestId);
      await mutateWorkspace("recordPayment", "RecordPaymentInput", { invoiceId: item.apiId, amount, method: "CASH", reference: null, requestId });
      sessionStorage.removeItem(key);
    }),
    receivePurchaseOrder: identifier => execute(async snapshot => { const item = snapshot.purchaseOrders.find(candidate => candidate.id === identifier); if (!item?.apiId) throw new ApiError("أمر الشراء غير موجود"); await gql("mutation($id: UUID!) { receivePurchaseOrder(id: $id) { id } }", { id: item.apiId }); }),
    assignWorkOrder: (identifier, technician) => execute(async snapshot => { const item = snapshot.workOrders.find(candidate => candidate.id === identifier); if (!item) throw new ApiError("الأمر غير موجود"); await saveWorkspaceItem("workOrders", { ...item, tech: technician, status: item.status === "مجدول" ? "جاري" : item.status }, snapshot); }),
  };

  return <AppDataContext.Provider value={values}>{children}</AppDataContext.Provider>;
}
