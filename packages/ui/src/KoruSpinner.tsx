/**
 * KoruSpinner — Web version (pure SVG + CSS animation).
 * Metro/Expo will use KoruSpinner.native.tsx instead.
 */

interface KoruSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function KoruSpinner({
  size  = 48,
  color = "#04342C",
  className = "",
}: KoruSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Loading…"
      role="status"
      className={className}
      style={{
        animation: "koru-spin 1.5s linear infinite",
        display: "inline-block",
      }}
    >
      {/* Outer arc — most of a full circle */}
      <path
        d="M 50 8
           C 74 8 92 28 92 52
           C 92 76 74 92 50 92
           C 28 92 10 76 10 58
           C 10 42 24 30 42 30"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mid spiral */}
      <path
        d="M 42 30
           C 54 30 64 40 64 52
           C 64 62 56 68 47 65"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Inner koru curl */}
      <path
        d="M 47 65
           C 39 62 34 54 37 47
           C 39 42 46 40 51 44"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      <style>{`
        @keyframes koru-spin {
          from { transform: rotate(0deg); transform-origin: 50px 50px; }
          to   { transform: rotate(360deg); transform-origin: 50px 50px; }
        }
      `}</style>
    </svg>
  );
}
