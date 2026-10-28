عايزك تبعتلي كود hover search field
4:31 PM
إليك كود حقل البحث المتوهج مع تأثير الدوران والتوهج عند الـ Hover والـ Focus كاملاً:

1️⃣ كود مكوّن React المباشر (GlowSearchInput.tsx):
tsx
"use client";
import React, { useState } from "react";
export interface GlowSearchInputProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
}
export function GlowSearchInput({
  value,
  onChange,
  placeholder = "ابحث عن كورس، درس، أو موضوع...",
  className = "",
}: GlowSearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const currentVal = isControlled ? value : internalValue;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);
    if (onChange) onChange(val);
  };
  return (
    <div className={`glow-search-poda ${className}`} dir="rtl">
      {/* طبقات الدوران والتوهج المحيطي بتدرج Conic Gradient */}
      <div className="glow-layer" />
      <div className="glow-darkBorderBg" />
      <div className="glow-white" />
      <div className="glow-border" />
      {/* الحاوية الأساسية للحقل */}
      <div className="glow-search-main">
        {/* بقعة الضوء الوردية الخافتة */}
        <div className="glow-search-pink-mask" />
        {/* حقل الإدخال */}
        <input
          type="text"
          value={currentVal}
          onChange={handleChange}
          placeholder={placeholder}
          className="glow-search-input"
        />
        {/* أيقونة البحث بالتدرج اللوني */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={18}
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          >
            <circle stroke="url(#lms-search-grad)" r={8} cy={11} cx={11} />
            <line stroke="url(#lms-search-grad2)" y2="16.65" y1={22} x2="16.65" x1={22} />
            <defs>
              <linearGradient gradientTransform="rotate(50)" id="lms-search-grad">
                <stop stopColor="#a855f7" offset="0%" />
                <stop stopColor="#4f46e5" offset="50%" />
                <stop stopColor="#38bdf8" offset="100%" />
              </linearGradient>
              <linearGradient id="lms-search-grad2">
                <stop stopColor="#4f46e5" offset="0%" />
                <stop stopColor="#38bdf8" offset="100%" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
export default GlowSearchInput;
2️⃣ كود الـ CSS بالكامل (مع أنيميشن الدوران للـ Hover والـ Focus):
css
/* ==========================================================================
   Multi-layer Rotating Conic Glow Search Bar
   ========================================================================== */
.glow-search-poda {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 480px;
}
.glow-search-poda .glow-layer,
.glow-search-poda .glow-white,
.glow-search-poda .glow-border,
.glow-search-poda .glow-darkBorderBg {
  height: 100%;
  width: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 0;
  border-radius: 9999px;
  filter: blur(3px);
  pointer-events: none;
}
.glow-search-poda .glow-layer {
  overflow: hidden;
  filter: blur(18px);
  opacity: 0.35;
  inset: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
}
.glow-search-poda .glow-layer::before {
  content: "";
  z-index: -2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(60deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(
    rgba(0, 0, 0, 0),
    #4f46e5 10%,
    rgba(0, 0, 0, 0) 35%,
    rgba(0, 0, 0, 0) 50%,
    #cf30aa 60%,
    #38bdf8 75%,
    rgba(0, 0, 0, 0) 90%
  );
  transition: transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda .glow-white {
  filter: blur(1.5px);
  opacity: 0.6;
}
.glow-search-poda .glow-white::before {
  content: "";
  z-index: -2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(83deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  filter: brightness(1.4);
  background-image: conic-gradient(
    rgba(0, 0, 0, 0) 0%,
    #a099d8,
    rgba(0, 0, 0, 0) 8%,
    rgba(0, 0, 0, 0) 50%,
    #38bdf8,
    rgba(0, 0, 0, 0) 58%
  );
  transition: transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda .glow-border {
  filter: blur(0.5px);
}
.glow-search-poda .glow-border::before {
  content: "";
  z-index: -2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(70deg);
  position: absolute;
  width: 600px;
  height: 600px;
  filter: brightness(1.3);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(
    rgba(238, 242, 255, 0.8),
    #4f46e5 8%,
    rgba(238, 242, 255, 0.8) 18%,
    rgba(238, 242, 255, 0.8) 50%,
    #cf30aa 60%,
    #38bdf8 70%,
    rgba(238, 242, 255, 0.8) 80%
  );
  transition: transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda .glow-darkBorderBg::before {
  content: "";
  z-index: -2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(82deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(
    rgba(0, 0, 0, 0),
    #4f46e5,
    rgba(0, 0, 0, 0) 12%,
    rgba(0, 0, 0, 0) 50%,
    #a855f7,
    rgba(0, 0, 0, 0) 62%
  );
  transition: transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
}
/* ================= دوران التوهج عند الـ Hover ================= */
.glow-search-poda:hover > .glow-darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(262deg);
}
.glow-search-poda:hover > .glow-layer::before {
  transform: translate(-50%, -50%) rotate(240deg);
  opacity: 0.7;
}
.glow-search-poda:hover > .glow-white::before {
  transform: translate(-50%, -50%) rotate(263deg);
}
.glow-search-poda:hover > .glow-border::before {
  transform: translate(-50%, -50%) rotate(250deg);
}
/* ================= دوران كامل متواصل عند التركيز (Focus) ================= */
.glow-search-poda:focus-within > .glow-darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(442deg);
  transition: transform 3.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda:focus-within > .glow-layer::before {
  transform: translate(-50%, -50%) rotate(420deg);
  opacity: 0.8;
  transition: transform 3.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda:focus-within > .glow-white::before {
  transform: translate(-50%, -50%) rotate(443deg);
  transition: transform 3.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-poda:focus-within > .glow-border::before {
  transform: translate(-50%, -50%) rotate(430deg);
  transition: transform 3.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.glow-search-main {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: center;
}
.glow-search-input {
  width: 100%;
  height: 40px;
  background-color: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  color: #0f172a;
  padding: 0 42px 0 16px;
  font-size: 13px;
  font-family: "Cairo", sans-serif;
  outline: none;
  transition: all 0.3s ease;
}
.glow-search-poda:hover .glow-search-input,
.glow-search-poda:focus-within .glow-search-input {
  background-color: #ffffff;
  border-color: transparent;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.glow-search-pink-mask {
  pointer-events: none;
  width: 36px;
  height: 20px;
  position: absolute;
  background: #cf30aa;
  top: 10px;
  right: 12px;
  filter: blur(14px);
  opacity: 0.45;
  transition: opacity 1.2s ease;
  z-index: 2;
}
.glow-search-poda:hover .glow-search-pink-mask,
.glow-search-poda:focus-within .glow-search-pink-mask {
  opacity: 0;
}
