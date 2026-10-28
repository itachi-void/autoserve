import { useId, useState } from "react";
import { BookOpen, KeyRound } from "lucide-react";
import { API_ENABLED, gql } from "../data/api";
import FormField, { inputClass } from "./ui/FormField";
import Modal from "./ui/Modal";

export type BotStatus = { configured: boolean; simulationEnabled: boolean; connected: boolean; username: string | null; botUsername: string | null; ownBot: boolean };
export const statusFields = "configured simulationEnabled connected username botUsername ownBot";

export default function TelegramSetup({ status, busy, run, onConfigured }: {
  status: BotStatus | null; busy: boolean; run: (operation: () => Promise<void>) => Promise<void>; onConfigured: (status: BotStatus) => void;
}) {
  const fieldId = useId();
  const [token, setToken] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  return <>
    <button type="button" className="border border-border text-foreground px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-secondary transition-colors" onClick={() => setGuideOpen(true)}><BookOpen size={16} />خطوات تشغيل المحاكاة</button>
    <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="خطوات تشغيل محاكاة Telegram" maxWidth="max-w-xl">
      <p className="text-sm text-muted-foreground leading-7 mb-4">بوت مستقل لمركزك، وحساب Telegram واحد يمثّل الأدوار الثلاثة أثناء الاختبار. الأزرار تغيّر سجلات تجربتك فعلياً؛ هذه ليست إدارة صلاحيات أطراف حقيقية.</p>
      <ol className="space-y-4 text-sm leading-7 list-decimal pr-5">
        <li>افتح <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">BotFather الرسمي</a>، وأرسل <code dir="ltr">/newbot</code>. اختر اسم البوت ثم اسم مستخدم ينتهي بـ <code dir="ltr">bot</code>.</li>
        <li>انسخ التوكن إلى الحقل هنا واضغط «تحقّق واحفظ البوت». لا ترسله في الدردشة، ولا تستخدم بوتاً مربوطاً بخدمة أخرى أو webhook.</li>
        <li>اضغط «إنشاء رابط آمن»، وافتح الرابط من حساب Telegram الذي سيحاكي الأدوار، ثم اضغط <strong>Start</strong>. الرابط صالح لعشر دقائق؛ لا تشاركه.</li>
        <li>ارجع واضغط «تحقّق من الاتصال». يجب أن تظهر حالة «متصل» قبل الإرسال.</li>
        <li>اختر دوراً وسجلاً مفتوحاً: طلب شراء للشحن، عرض سعر ينتظر الموافقة للعميل، أو أمر تشغيل مفتوح للموظف. اضغط «إرسال الرسالة بأزرار الإجراء».</li>
        <li>اضغط زر الإجراء في Telegram، ثم ارجع للنظام. تتزامن البيانات كل ١٠ ثوانٍ ويمكن تحديثها يدوياً. لإكمال أمر تشغيل، ابدأ التنفيذ أولاً.</li>
      </ol>
      <p className="text-xs text-muted-foreground leading-6 mt-5">أثناء التشغيل المحلي: أبقِ Docker ونفق Cloudflare مفتوحين. لو انكشف التوكن، ألغِه من BotFather وأدخل البديل. انتهاء التجربة يوقف بوتها.</p>
    </Modal>
    <Modal open={removeOpen} onClose={() => { if (!busy) setRemoveOpen(false); }} title="حذف البوت الخاص" actions={<button type="button" disabled={busy} className="bg-destructive text-white rounded-xl px-4 py-2 text-sm disabled:opacity-40" onClick={() => void run(async () => {
      await gql("mutation { removeTelegramBot }");
      setToken(""); setRemoveOpen(false);
      const data = await gql<{ telegramStatus: BotStatus }>(`query { telegramStatus { ${statusFields} } }`);
      onConfigured(data.telegramStatus);
    })}>تأكيد حذف الربط والتوكن</button>}>
      <p className="text-sm leading-7 text-muted-foreground">سيُحذف التوكن المحفوظ في الخادم وتُلغى روابط وأزرار المحاكاة لهذه المساحة. سجلات المركز والبوت نفسه في Telegram لن يُحذفا.</p>
    </Modal>
    {API_ENABLED && <form className="bg-secondary rounded-xl p-4 space-y-3" onSubmit={event => {
      event.preventDefault();
      if (busy || !token.trim()) return;
      const submittedToken = token.trim();
      setToken("");
      void run(async () => {
        const data = await gql<{ configureTelegramBot: BotStatus }>(`mutation($token: String!) { configureTelegramBot(token: $token) { ${statusFields} } }`, { token: submittedToken });
        onConfigured(data.configureTelegramBot);
      });
    }}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><KeyRound size={16} />{status?.ownBot ? `بوت مساحتك: @${status.botUsername}` : "أضف بوت Telegram الخاص بتجربتك"}</div>
      <FormField label={status?.ownBot ? "توكن بديل — يستبدل البوت ويلغي الربط السابق" : "توكن البوت من BotFather"} htmlFor={`${fieldId}-token`}><input id={`${fieldId}-token`} type="password" dir="ltr" autoComplete="off" spellCheck={false} required maxLength={160} disabled={busy} value={token} onChange={event => setToken(event.target.value)} className={inputClass} placeholder="Bot token" /></FormField>
      <p className="text-xs text-muted-foreground leading-6">يُرسل للخادم عبر HTTPS ويُحفظ مشفّراً هناك. لا يُحفظ في المتصفح أو يُعرض بعد الحفظ. استخدم بوتاً مخصصاً للاختبار وليس بوت خدمة أخرى.</p>
      <div className="flex flex-wrap gap-2"><button type="submit" disabled={busy || !token.trim()} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-40">{busy ? "جارٍ التنفيذ…" : "تحقّق واحفظ البوت"}</button>{status?.ownBot && <button type="button" disabled={busy} className="border border-border text-destructive rounded-xl px-4 py-2 text-sm" onClick={() => setRemoveOpen(true)}>حذف البوت الخاص</button>}</div>
    </form>}
  </>;
}
