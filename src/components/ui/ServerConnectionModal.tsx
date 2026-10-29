import { useState } from "react";
import { Server, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Laptop, Sparkles } from "lucide-react";
import Modal from "./Modal";
import { getActiveApiUrl, setActiveApiUrl } from "../../data/api";

interface ServerConnectionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ServerConnectionModal({ open, onClose }: ServerConnectionModalProps) {
  const currentUrl = getActiveApiUrl();
  const [url, setUrl] = useState(currentUrl);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleTest = async () => {
    if (!url.trim()) {
      setStatus("success");
      setStatusMsg("سيتم استخدام وضع التجربة الداخلي (Demo Mode) بدون خادم.");
      return;
    }
    setStatus("testing");
    setStatusMsg("جاري فحص الاتصال بالخادم…");
    try {
      // Test the endpoint with a minimal GraphQL introspection or query
      const res = await fetch(url.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ __typename }" }),
      });
      if (res.ok) {
        setStatus("success");
        setStatusMsg("تم الاتصال بالخادم بنجاح! خادم GraphQL متاح ومستجيب.");
      } else {
        setStatus("error");
        setStatusMsg(`أعاد الخادم استجابة برمز HTTP ${res.status}.`);
      }
    } catch (err) {
      setStatus("error");
      setStatusMsg("تعذّر الوصول إلى العنوان. تأكد من تشغيل الخادم وشبكة الاتصال والسماح بـ CORS.");
    }
  };

  const handleSave = () => {
    setActiveApiUrl(url.trim());
    onClose();
    // Reload to re-initialize contexts with new endpoint mode
    window.location.reload();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إعدادات الاتصال بالخادم (Backend Settings)"
      maxWidth="max-w-lg"
      actions={
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-xs sm:text-sm font-medium hover:bg-secondary/40 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-semibold hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            حفظ وتطبيق
          </button>
        </div>
      }
    >
      <div className="space-y-4" dir="rtl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          يتيح لك هذا الخيار ربط التطبيق (سواء على تطبيق الويندوز أو هاتف أندرويد) بخادم الباك إند الحي في الورشة، أو التبديل لوضع التجربة (Demo Mode).
        </p>

        {/* Current Mode Badge */}
        <div className="bg-secondary/50 border border-border rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">الوضع الحالي:</span>
          {currentUrl ? (
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Server size={12} /> متصل بـ Live API
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles size={12} /> وضع التجربة (Demo Mode)
            </span>
          )}
        </div>

        {/* Endpoint Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Server size={14} className="text-primary" />
            عنوان الـ GraphQL Endpoint:
          </label>
          <input
            type="text"
            dir="ltr"
            placeholder="https://api.yourworkshop.com/graphql أو http://192.168.1.100:8080/graphql"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setStatus("idle");
            }}
            className="w-full bg-card text-foreground border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-muted-foreground block font-medium">اختصارات سريعة للتهيئة:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setStatus("idle");
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-medium transition-all"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>وضع تجريبي</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl("http://10.0.2.2:8080/graphql");
                setStatus("idle");
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-medium transition-all"
            >
              <Smartphone size={13} className="text-sky-400" />
              <span>محاكي أندرويد</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl("http://localhost:8080/graphql");
                setStatus("idle");
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-foreground text-xs font-medium transition-all"
            >
              <Laptop size={13} className="text-primary" />
              <span>كمبيوتر محلي</span>
            </button>
          </div>
        </div>

        {/* Test Connection Button */}
        <button
          type="button"
          onClick={handleTest}
          disabled={status === "testing"}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-medium transition-all"
        >
          <RefreshCw size={14} className={status === "testing" ? "animate-spin text-primary" : ""} />
          <span>{status === "testing" ? "جاري الفحص…" : "فحص الاتصال بالخادم"}</span>
        </button>

        {/* Status Message */}
        {status !== "idle" && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              status === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : status === "error"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            {status === "success" && <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />}
            {status === "error" && <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
            <span className="leading-relaxed">{statusMsg}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
