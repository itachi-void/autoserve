import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpLeft, Check, Eye, EyeOff, Fingerprint, Layers3, LoaderCircle, Moon, Server, ShieldCheck, Sun, Wrench } from "lucide-react";
import { useAuth } from "../../data/AuthContext";
import { useTheme } from "../../data/ThemeContext";
import { API_ENABLED, gql } from "../../data/api";
import Modal from "../ui/Modal";
import FormField, { inputClass } from "../ui/FormField";
import ServerConnectionModal from "../ui/ServerConnectionModal";
import { LogoOrbital } from "../logos/AutoServeLogo";
import "./login.css";

interface Props { onForgotPassword: () => void; }

export default function Login({ onForgotPassword }: Props) {
  const { login, startTrial } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showServerModal, setShowServerModal] = useState(false);
  const showAccounts = !API_ENABLED || import.meta.env.DEV;
  const [trialsEnabled, setTrialsEnabled] = useState(false);
  const [trialAvailabilityError, setTrialAvailabilityError] = useState("");
  const [trialCheckAttempt, setTrialCheckAttempt] = useState(0);
  const [showTrial, setShowTrial] = useState(false);
  const [creating, setCreating] = useState(false);
  const [trialError, setTrialError] = useState("");
  const [trial, setTrial] = useState({ companyName: "", email: "", password: "" });
  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    setTrialAvailabilityError("");
    gql<{ trialsEnabled: boolean }>("query { trialsEnabled }").then(data => { if (active) setTrialsEnabled(data.trialsEnabled); }).catch(cause => {
      if (active) setTrialAvailabilityError(cause instanceof Error ? cause.message : "تعذّر التحقق من إتاحة التجربة");
    });
    return () => { active = false; };
  }, [trialCheckAttempt]);
  const createTrial = async (event: FormEvent) => {
    event.preventDefault();
    if (creating) return;
    setCreating(true); setTrialError("");
    try {
      const result = await startTrial({ ...trial, companyName: trial.companyName.trim(), email: trial.email.trim() });
      if (!result.ok) setTrialError(result.error ?? "تعذّر إنشاء التجربة");
    } finally { setCreating(false); }
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || !email || !password) return;
    setLoading(true); setError("");
    try {
      const result = await login(email.trim(), password);
      if (!result.ok) setError(result.error ?? "حدث خطأ غير متوقع");
    } catch { setError("تعذّر تسجيل الدخول، حاول مرة أخرى"); }
    finally { setLoading(false); }
  }

  return (
    <div className="studio-login" dir="rtl">
      <Modal open={showTrial} onClose={() => { if (!creating) setShowTrial(false); }} title="تجربة مستقلة لمركزك">
        <p className="text-sm text-muted-foreground leading-7">مساحة خاصة ببيانات اختبار جاهزة، ومدة محدودة تظهر بعد الدخول. لا تستخدم بيانات عملاء حقيقية؛ محاكاة Telegram تتطلب ربط بوت خاص بك من صفحة الصلاحيات.</p>
        <form onSubmit={createTrial} className="space-y-4" aria-busy={creating}>
          <fieldset disabled={creating} className="space-y-4">
            <FormField label="اسم المركز" htmlFor="trial-company"><input id="trial-company" className={inputClass} required minLength={2} maxLength={120} autoComplete="organization" value={trial.companyName} onChange={event => setTrial(previous => ({ ...previous, companyName: event.target.value }))} /></FormField>
            <FormField label="بريدك الإلكتروني" htmlFor="trial-email"><input id="trial-email" className={inputClass} type="email" dir="ltr" required maxLength={254} autoComplete="email" value={trial.email} onChange={event => setTrial(previous => ({ ...previous, email: event.target.value }))} /></FormField>
            <FormField label="كلمة مرور — ١٢ حرفاً على الأقل" htmlFor="trial-password"><input id="trial-password" className={inputClass} type="password" dir="ltr" required minLength={12} maxLength={128} autoComplete="new-password" value={trial.password} onChange={event => setTrial(previous => ({ ...previous, password: event.target.value }))} /></FormField>
            <label className="flex items-start gap-2 text-xs text-muted-foreground leading-6"><input type="checkbox" required className="mt-1" />أفهم أن هذه مساحة اختبار، وأن العمليات تغيّر بيانات تجربتي فعلياً.</label>
            {trialError && <p role="alert" className="text-sm text-destructive">{trialError}</p>}
            <button type="submit" className="login-submit" disabled={creating}><span>{creating ? "جارٍ تجهيز المساحة والبيانات…" : "إنشاء تجربتي والدخول"}</span></button>
          </fieldset>
        </form>
      </Modal>
      <header className="login-header">
        <div className="login-wordmark" aria-label="AutoServe"><LogoOrbital size={36} lightMode={theme !== "dark"} /><span>auto<span>serve</span></span><small>WORKSHOP OS</small></div>
        <span className="login-header-label">مصمم لورش تتحرك للأمام.</span>
        <button className="login-theme" onClick={toggleTheme} aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}<span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span></button>
      </header>

      <main className="login-layout">
        <section className="login-showcase" aria-labelledby="login-intro">
          <div className="login-kicker"><span /> THE WORKSHOP, REIMAGINED <small>01 / STUDIO</small></div>
          <h1 id="login-intro">كل التفاصيل.<br /><span>تحت سيطرتك.</span></h1>
          <p className="login-intro">من أول موعد لآخر تسليم.<br />مساحة واحدة تدير منها مركزك، وتبقى سابق بخطوة.</p>
          <div className="login-vehicle-stage">
            <div className="login-stage-orbit" aria-hidden="true" /><div className="login-stage-light" aria-hidden="true" />
            <span className="login-stage-label">PRECISION IN EVERY DETAIL</span>
            <img src="/images/studio-vehicle.webp" alt="سيارة فضية توضيحية في مساحة الصيانة" className="login-vehicle" fetchPriority="high" />
            <div className="login-vehicle-note"><span><Wrench size={15} /> دورة صيانة متكاملة</span><small>استقبال ← تشخيص ← صيانة ← تسليم</small></div>
            <div className="login-stage-caption"><span>VEHICLE STUDIO / 01</span><small>نموذج توضيحي</small></div>
          </div>
          <div className="login-capabilities"><span><Layers3 size={16} /> عمليات مترابطة</span><span><ShieldCheck size={16} /> صلاحيات لكل دور</span><span><Check size={16} /> رؤية أوضح لمركزك</span></div>
        </section>

        <section className="login-access" aria-labelledby="login-title">
          <div className="login-panel">
            <div className="login-panel-top"><span>YOUR WORKSPACE</span><Fingerprint size={26} strokeWidth={1.3} /></div>
            <div className="login-welcome">أهلاً برجوعك</div>
            <h2 id="login-title">ابدأ يومك.<br />ادخل غرفة التحكم.</h2>
            <p className="login-panel-description">سجّل الدخول للوصول إلى مساحة عملك.</p>
            <form onSubmit={handleSubmit} aria-busy={loading}>
              <fieldset disabled={loading} className="login-fields">
                <FormField label="البريد الإلكتروني" htmlFor="auth-email"><input id="auth-email" type="email" autoComplete="username" dir="ltr" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@workshop.com" className={inputClass} /></FormField>
                <div><div className="login-password-label"><label htmlFor="auth-password">كلمة المرور</label><button type="button" onClick={onForgotPassword}>نسيت كلمة المرور؟</button></div><div className="login-password"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete="current-password" dir="ltr" required value={password} onChange={event => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" className={inputClass} /><button type="button" onClick={() => setShowPassword(previous => !previous)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                {error && <p className="login-error" role="alert">{error}</p>}
                <button type="submit" className="login-submit" disabled={loading || !email || !password}><span>{loading ? "جاري التحقق…" : "الدخول إلى مساحة العمل"}</span>{loading ? <LoaderCircle size={19} className="animate-spin" /> : <ArrowUpLeft size={20} />}</button>
              </fieldset>
            </form>
            <div className="login-security"><ShieldCheck size={15} /><span>وصول محمي لحسابك ومساحة عملك</span></div>
            {trialsEnabled && <button type="button" disabled={loading} className="w-full border border-border text-foreground rounded-xl px-4 py-3 text-sm font-semibold hover:bg-secondary transition-colors" onClick={() => { setTrialError(""); setShowTrial(true); }}>جديد هنا؟ أنشئ تجربة مستقلة لمركزك</button>}
            {trialAvailabilityError && <div className="login-error" role="alert"><p>{trialAvailabilityError}</p><button type="button" disabled={loading} onClick={() => setTrialCheckAttempt(previous => previous + 1)}>إعادة التحقق من التجربة</button></div>}
            {showAccounts && <div className="login-demo"><div className="login-demo-heading"><span>{API_ENABLED ? "حسابات بيئة التطوير" : "جرّب مساحة العمل"}</span><small>{API_ENABLED ? "تستخدم قاعدة بيانات التطوير" : "بيانات تجريبية، بدون حفظ في الخادم"}</small></div><div className="login-demo-accounts">{[{ email: "admin@fixsys.sa", label: "مدير النظام", pass: "admin123", avatar: "أ" }, { email: "manager@fixsys.sa", label: "مشرف العمليات", pass: "manager123", avatar: "م" }].map(account => <button key={account.email} type="button" disabled={loading} onClick={() => { setEmail(account.email); setPassword(account.pass); setError(""); }}><span>{account.avatar}</span><div>{account.label}<small>تعبئة بيانات الدخول</small></div><ArrowUpLeft size={14} /></button>)}</div></div>}
            <button
              type="button"
              onClick={() => setShowServerModal(true)}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5 border border-dashed border-border rounded-xl"
            >
              <Server size={13} />
              <span>إعدادات ربط الخادم (Backend Settings)</span>
            </button>
          </div>
          <ServerConnectionModal open={showServerModal} onClose={() => setShowServerModal(false)} />
          <div className="login-access-caption"><span>BUILT FOR THE WAY YOU WORK.</span><small>تنظيم أقل تعقيداً. أداء أكثر وضوحاً.</small></div>
        </section>
      </main>
      <footer className="login-footer"><span>© {new Date().getFullYear()} AutoServe</span><span>منصة إدارة مراكز صيانة السيارات <span className="login-footer-dot">·</span> صُممت لكل تفاصيل يومك</span><span>WORKSHOP EXPERIENCE / 02</span></footer>
    </div>
  );
}
