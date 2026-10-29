import { useState } from "react";
import { Camera, Image as ImageIcon, Plus, Trash2, X, Eye } from "lucide-react";
import Modal from "./Modal";
import { capturePhoto, type PhotoCaptureResult } from "../../utils/camera";
import { toArabicNum } from "../../utils/format";

export interface DamageItem {
  location: string;
  note: string;
  hasPhoto: boolean;
  photoUrl?: string;
}

interface DamagePhotoModalProps {
  open: boolean;
  onClose: () => void;
  inspectionTitle: string;
  vehicleName: string;
  damages: DamageItem[];
  onSaveDamages?: (damages: DamageItem[]) => void;
  readOnly?: boolean;
}

export default function DamagePhotoModal({
  open,
  onClose,
  inspectionTitle,
  vehicleName,
  damages: initialDamages,
  onSaveDamages,
  readOnly = false,
}: DamagePhotoModalProps) {
  const [damages, setDamages] = useState<DamageItem[]>(initialDamages || []);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async (source: "camera" | "photos") => {
    setIsCapturing(true);
    try {
      const result = await capturePhoto({ source, quality: 80 });
      if (result) {
        setNewPhotoUrl(result.dataUrl);
      }
    } catch (err) {
      console.error("Failed to capture photo:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAddDamage = () => {
    if (!newLocation.trim()) return;
    const newDamage: DamageItem = {
      location: newLocation.trim(),
      note: newNote.trim() || "تم التوثيق بواسطة الفاحص",
      hasPhoto: Boolean(newPhotoUrl),
      photoUrl: newPhotoUrl || undefined,
    };
    const updated = [...damages, newDamage];
    setDamages(updated);
    if (onSaveDamages) onSaveDamages(updated);
    setNewLocation("");
    setNewNote("");
    setNewPhotoUrl(null);
  };

  const handleRemove = (index: number) => {
    const updated = damages.filter((_, i) => i !== index);
    setDamages(updated);
    if (onSaveDamages) onSaveDamages(updated);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="توثيق التلفيات وصور الفحص"
        maxWidth="max-w-xl"
        actions={
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl text-sm border border-border hover:bg-secondary/80 transition-colors"
          >
            إغلاق
          </button>
        }
      >
        <div className="space-y-4" dir="rtl">
          {/* Inspection Info Header */}
          <div className="bg-secondary/60 border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{inspectionTitle}</div>
              <div className="text-sm font-bold text-foreground">{vehicleName}</div>
            </div>
            <div className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-mono font-semibold">
              {toArabicNum(damages.length)} ملاحظات تلف
            </div>
          </div>

          {/* New Damage Form with Camera Capture */}
          {!readOnly && (
            <div className="border border-dashed border-primary/40 bg-primary/5 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <Camera size={16} /> إضافة تلف وتصوير بالكاميرا
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="موقع التلف (مثال: الصدام الأمامي الأيمن)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="وصف الضرر أو الخدش"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Photo Shutter & Gallery Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCapture("camera")}
                  disabled={isCapturing}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Camera size={14} />
                  <span>{isCapturing ? "جاري الفتح…" : "التقاط صورة"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCapture("photos")}
                  disabled={isCapturing}
                  className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground border border-border rounded-xl text-xs font-medium hover:bg-secondary/80 active:scale-95 transition-all"
                >
                  <ImageIcon size={14} />
                  <span>اختيار من المعرض</span>
                </button>

                {newPhotoUrl && (
                  <div className="relative group w-9 h-9 rounded-lg overflow-hidden border border-primary/50 shadow-sm">
                    <img src={newPhotoUrl} alt="معاينة" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl(null)}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddDamage}
                  disabled={!newLocation.trim()}
                  className="mr-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> إضافة للقائمة
                </button>
              </div>
            </div>
          )}

          {/* List of Existing Damages */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {damages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                لا توجد تلفيات مسجلة لهذا الفحص (المركبة سليمة).
              </div>
            ) : (
              damages.map((item, index) => (
                <div
                  key={`${item.location}-${index}`}
                  className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.photoUrl ? (
                      <button
                        onClick={() => setPreviewPhoto(item.photoUrl!)}
                        className="w-11 h-11 rounded-lg overflow-hidden border border-border flex-shrink-0 relative group"
                        title="عرض الصورة"
                      >
                        <img src={item.photoUrl} alt={item.location} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye size={14} />
                        </div>
                      </button>
                    ) : item.hasPhoto ? (
                      <div className="w-11 h-11 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary flex-shrink-0 font-bold">
                        📷
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-secondary/60 border border-border/60 flex items-center justify-center text-muted-foreground flex-shrink-0">
                        —
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{item.location}</div>
                      <div className="text-muted-foreground text-[11px] truncate">{item.note}</div>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Full Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-lg max-h-[85vh] bg-card rounded-2xl overflow-hidden p-2 border border-border">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <img src={previewPhoto} alt="صورة التلف" className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}
