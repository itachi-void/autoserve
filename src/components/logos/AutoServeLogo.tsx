import React from "react";

export type LogoVariant = "orbital" | "monolith" | "bay";

interface AutoServeLogoProps {
  variant?: LogoVariant;
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  lightMode?: boolean;
  badgeMode?: boolean;
}

/**
 * Official AutoServe Brand Mark — Orbital Apex (Telemetry Caliper)
 * Designed for the Atelier Cockpit & Studio identity.
 */
export function LogoOrbital({
  size = 26,
  lightMode = false,
  badgeMode = false,
  className = "",
}: {
  size?: number;
  lightMode?: boolean;
  badgeMode?: boolean;
  className?: string;
}) {
  const primaryFill = badgeMode
    ? "currentColor"
    : lightMode
    ? "#203b47"
    : "#eeeae1";

  const accentColor = badgeMode
    ? lightMode
      ? "#287f98"
      : "#c85a17"
    : lightMode
    ? "#287f98"
    : "#fa9c61";

  const orbitColor = badgeMode
    ? lightMode
      ? "#287f98"
      : "#7a7560"
    : lightMode
    ? "#556e78"
    : "#b6cec5";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M 10 42 C 10 24, 23 12, 39 12 C 47 12, 53 15, 56 20"
        stroke={orbitColor}
        strokeWidth={badgeMode ? "2.6" : "2.5"}
        strokeLinecap="round"
        opacity={badgeMode ? "0.45" : "0.55"}
      />
      <path
        d="M 15 52 L 29.5 14 C 30.3 12 33.7 12 34.5 14 L 49 52 L 41.5 52 L 32 25.5 L 22.5 52 Z"
        fill={primaryFill}
      />
      <path
        d="M 20 40 L 44 33"
        stroke={accentColor}
        strokeWidth={badgeMode ? "4.8" : "4.2"}
        strokeLinecap="round"
      />
      <circle cx="51" cy="28.5" r={badgeMode ? "4" : "3.6"} fill={accentColor} />
    </svg>
  );
}

export default function AutoServeLogo({
  size = 28,
  showWordmark = false,
  subtitle = "WORKSHOP OS",
  className = "",
  lightMode = false,
  badgeMode = false,
}: AutoServeLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} dir="ltr">
      <LogoOrbital size={size} lightMode={lightMode} badgeMode={badgeMode} />
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div
            className="text-[25px] font-medium tracking-[-1px] leading-none"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: lightMode ? "#203b47" : "#eeeae1",
            }}
          >
            auto
            <span
              className="font-light"
              style={{ color: lightMode ? "#556e78" : "#b4b69f" }}
            >
              serve
            </span>
          </div>
          {subtitle && (
            <small
              className="text-[8px] tracking-[2.8px] uppercase mt-1.5 block"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: lightMode ? "#556e78" : "#aaa99d",
              }}
            >
              {subtitle}
            </small>
          )}
        </div>
      )}
    </div>
  );
}
