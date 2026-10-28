import { useState, useEffect } from "react";
import { useAuth } from "./data/AuthContext";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import CommandDashboard from "./components/CommandDashboard";
import StudioShell from "./components/studio/StudioShell";
import Customers from "./components/Customers";
import Cars from "./components/Cars";
import SpareParts from "./components/SpareParts";
import Services from "./components/Services";
import WorkOrders from "./components/WorkOrders";
import Appointments from "./components/Appointments";
import Technicians from "./components/Technicians";
import Inspections from "./components/Inspections";
import Quotations from "./components/Quotations";
import Invoices from "./components/Invoices";
import Employees from "./components/Employees";
import Warehouse from "./components/Warehouse";
import Permissions from "./components/Permissions";
import PurchaseOrders from "./components/PurchaseOrders";
import WorkspaceGuide from "./components/WorkspaceGuide";

export type PageKey =
  | "dashboard"
  | "permissions"
  | "employees"
  | "customers"
  | "cars"
  | "spare-parts"
  | "services"
  | "appointments"
  | "technicians"
  | "inspections"
  | "quotations"
  | "work-orders"
  | "invoices"
  | "warehouse"
  | "purchase-orders";

const VALID_PAGES = new Set<PageKey>([
  "dashboard", "permissions", "employees", "customers", "cars", "spare-parts",
  "services", "appointments", "technicians", "inspections", "quotations",
  "work-orders", "invoices", "warehouse", "purchase-orders",
]);

type AuthScreen = "login" | "forgot-password";
export interface RecordFocus { id: string; request: number; }

export default function App() {
  const { user } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [recordFocus, setRecordFocus] = useState<RecordFocus | undefined>();

  const [activePage, setActivePage] = useState<PageKey>(() => {
    const saved = localStorage.getItem("activePage") as PageKey;
    return VALID_PAGES.has(saved) ? saved : "dashboard";
  });
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem("activePage") as PageKey;
      setActivePage(VALID_PAGES.has(saved) ? saved : "dashboard");
      setRecordFocus(undefined);
    }
  }, [user?.email]);
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("preload");
      });
    });
  }, []);

  function handleSetActivePage(p: PageKey, recordId?: string) {
    setRecordFocus(recordId ? { id: recordId, request: Date.now() } : undefined);
    localStorage.setItem("activePage", p);
    setActivePage(p);
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard": return <><WorkspaceGuide onNavigate={handleSetActivePage} /><CommandDashboard onNavigate={handleSetActivePage} /></>;
      case "permissions": return <Permissions />;
      case "employees": return <Employees />;
      case "customers": return <Customers recordFocus={recordFocus} />;
      case "cars": return <Cars />;
      case "spare-parts": return <SpareParts onNavigate={handleSetActivePage} />;
      case "services": return <Services />;
      case "appointments": return <Appointments />;
      case "technicians": return <Technicians />;
      case "inspections": return <Inspections />;
      case "quotations": return <Quotations onNavigate={handleSetActivePage} />;
      case "work-orders": return <WorkOrders recordFocus={recordFocus} />;
      case "invoices": return <Invoices />;
      case "warehouse": return <Warehouse onNavigate={handleSetActivePage} />;
      case "purchase-orders": return <PurchaseOrders />;
    }
  }

  if (!user) {
    if (authScreen === "forgot-password") {
      return <ForgotPassword onBack={() => setAuthScreen("login")} />;
    }
    return <Login onForgotPassword={() => setAuthScreen("forgot-password")} />;
  }

  return <StudioShell activePage={activePage} onNavigate={handleSetActivePage}>{renderPage()}</StudioShell>;
}
