import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Moon, ShieldCheck, Sun } from "lucide-react";
import { useAuth } from "../../data/AuthContext";
import { useTheme } from "../../data/ThemeContext";
import { API_ENABLED } from "../../data/api";
import FormField, { inputClass } from "../ui/FormField";
import "./login.css";

interface Props { onBack: () => void; }
type Step = "email" | "otp" | "done";

export default function ForgotPassword({ onBack }: Props) {
  const { sendOtp, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (!cooldown) return; const timer = window.setTimeout(() => setCooldown(previous => Math.max(0, previous - 1)), 1000); return () => clearTimeout(timer); }, [cooldown]);
  async function send() {
    if (loading || cooldown) return;
    setLoading(true); setError(""); setNotice("");
    try { const result = await sendOtp(email.trim()); if (!result.ok) { setError(result.error ?? "تعذّر إرسال الرمز، حاول مرة أخرى."); return; } setStep("otp"); setOtp(""); setCooldown(60); setNotice("إذا كان البريد مرتبطاً بحساب، ستصلك رسالة برمز التحقق. راجع أيضاً البريد غير المرغوب فيه."); }
    catch { setError("تعذّر الاتصال. حاول مرة أخرى."); }
    finally { setLoading(false); }
  }
  async function handleReset(event: FormEvent) {
    event.preventDefault(); if (loading) return;
    if (!/^\d{6}$/.test(otp)) { setError("أدخل رمز التحقق المكوّن من ٦ أرقام."); return; }
    if (newPassword.length < 8) { setError("كلمة المرور يجب أن تكون ٨ أحرف على الأقل."); return; }
    if (newPassword !== confirmPassword) { setError("كلمتا المرور غير متطابقتين."); return; }
    setLoading(true); setError("");
    try { const result = await resetPassword(email.trim(), otp, newPassword); if (!result.ok) { setError(result.error ?? "الرمز غير صحيح أو انتهت صلاحيته."); return; } setStep("done"); setNotice(""); }
    catch { setError("تعذّر الاتصال. حاول مرة أخرى."); }
    finally { setLoading(false); }
  }
  const stepIndex = ["email", "otp", "done"].indexOf(step);
  return <div className="studio-login" dir="rtl">
    <header className="login-header"><button onClick={onBack} className="login-wordmark" aria-label="AutoServe — العودة لتسجيل الدخول"><span>auto<span>serve</span></span><small>WORKSHOP OS</small></button><span className="login-header-label">مساحة عملك، في أمان.</span><button className="login-theme" onClick={toggleTheme} aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</button></header>
    <main className="login-layout"><section className="login-showcase"><div className="login-kicker"><span /> WORKSPACE ACCESS <small>ACCOUNT RECOVERY</small></div><h1>ارجع لمساحتك.<br /><span>بخطوات واضحة.</span></h1><p className="login-intro">تحقق من بريدك، أنشئ كلمة مرور جديدة،<br />وكمّل يومك من المكان اللي وقفت فيه.</p><div className="login-vehicle-stage"><div className="login-stage-orbit" aria-hidden="true" /><div className="login-stage-light" aria-hidden="true" /><img className="login-vehicle" src="/images/studio-vehicle.webp" alt="سيارة فضية توضيحية في مساحة الصيانة" /><div className="login-vehicle-note"><span><ShieldCheck size={16} /> حسابك، تحت حمايتك</span><small>لا تشارك رمز التحقق مع أي شخص</small></div></div></section>
      <section className="login-access"><div className="login-panel"><div className="login-panel-top"><span>ACCOUNT RECOVERY</span><LockKeyhole size={25} /></div><ol className="recovery-steps" aria-label="خطوات استعادة الحساب">{["البريد", "التحقق", "جاهز"].map((label, index) => <li key={label} aria-current={index === stepIndex ? "step" : undefined} className={index <= stepIndex ? "active" : ""}><span>{index < stepIndex ? <Check size={13} /> : index + 1}</span>{label}</li>)}</ol><h2>{step === "email" ? "استعادة حسابك" : step === "otp" ? "كلمة مرور جديدة" : "حسابك جاهز للعودة"}</h2><p className="login-panel-description">{step === "email" ? "أدخل البريد المرتبط بحسابك لإرسال رمز التحقق." : step === "otp" ? "أدخل الرمز الذي وصلك واختر كلمة مرور جديدة." : "تم تحديث كلمة المرور. سجّل الدخول ببياناتك الجديدة."}</p>
      {error && <p className="login-error" role="alert">{error}</p>}{notice && <p className="recovery-notice" role="status">{notice}</p>}
      {step === "email" && <form onSubmit={event => { event.preventDefault(); void send(); }}><fieldset disabled={loading} className="login-fields"><FormField label="البريد الإلكتروني" htmlFor="recovery-email"><input id="recovery-email" type="email" autoComplete="email" required dir="ltr" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} placeholder="you@workshop.com" /></FormField><button type="submit" disabled={loading || !email} className="login-submit"><span>{loading ? "جاري الإرسال…" : cooldown ? `إعادة الإرسال متاحة بعد ${cooldown} ثانية` : "إرسال رمز التحقق"}</span>{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}</button></fieldset></form>}
      {step === "otp" && <><div className="recovery-email"><span dir="ltr">{email}</span><button disabled={loading} onClick={() => { setStep("email"); setError(""); setNotice(""); }}>تعديل البريد</button></div><form onSubmit={handleReset}><fieldset disabled={loading} className="login-fields"><FormField label="رمز التحقق — ٦ أرقام" htmlFor="recovery-otp"><input id="recovery-otp" autoComplete="one-time-code" inputMode="numeric" maxLength={6} required pattern="[0-9]{6}" dir="ltr" value={otp} onChange={event => setOtp(event.target.value.replace(/[٠-٩]/g, character => String("٠١٢٣٤٥٦٧٨٩".indexOf(character))).replace(/\D/g, "").slice(0, 6))} className={inputClass} /></FormField><FormField label="كلمة المرور الجديدة" htmlFor="recovery-password"><div className="login-password"><input id="recovery-password" autoComplete="new-password" type={showPass ? "text" : "password"} dir="ltr" required minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} className={inputClass} aria-describedby="recovery-password-hint" /><button type="button" aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={showPass} onClick={() => setShowPass(previous => !previous)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><p id="recovery-password-hint" className="text-xs text-muted-foreground mt-2">٨ أحرف على الأقل. استخدم كلمة مرور لا تستخدمها في حساب آخر.</p></FormField><FormField label="تأكيد كلمة المرور" htmlFor="recovery-confirm"><input id="recovery-confirm" autoComplete="new-password" type={showPass ? "text" : "password"} required dir="ltr" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass} aria-invalid={Boolean(confirmPassword && newPassword !== confirmPassword)} />{confirmPassword && newPassword !== confirmPassword && <p className="field-error">كلمتا المرور غير متطابقتين.</p>}</FormField><button type="submit" disabled={loading} className="login-submit">{loading ? "جاري التحديث…" : "تعيين كلمة المرور"}{loading ? <LoaderCircle className="animate-spin" size={18} /> : <Check size={18} />}</button></fieldset></form><button className="recovery-resend" disabled={loading || cooldown > 0} onClick={() => void send()}>{cooldown ? `إعادة الإرسال بعد ${cooldown} ثانية` : "لم يصلك الرمز؟ أعد الإرسال"}</button>{!API_ENABLED && <p className="recovery-notice">في الوضع التجريبي فقط: رمز التحقق 123456.</p>}</>}
      {step === "done" && <button onClick={onBack} className="login-submit w-full">العودة لتسجيل الدخول<ArrowRight size={18} /></button>}
      {step !== "done" && <button onClick={onBack} disabled={loading} className="recovery-back"><ArrowRight size={15} />العودة لتسجيل الدخول</button>}
      </div></section></main><footer className="login-footer"><span>© {new Date().getFullYear()} AutoServe</span><span>منصة إدارة مراكز صيانة السيارات</span><span>WORKSPACE ACCESS / 02</span></footer>
  </div>;
}
