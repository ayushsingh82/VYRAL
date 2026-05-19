import React from "react";

type Props = {
  size?: number;
  className?: string;
};

// Custom mark: a wordmark stylised as a viral-signal pulse — three rising
// ticks ending in a pulse dot. Square plate uses a purple gradient so the
// logo holds together on dark and light surfaces.
const Logo: React.FC<Props> = ({ size = 28, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="VYRAL logo"
  >
    <defs>
      <linearGradient id="vyral-plate" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#b388ff" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
      <linearGradient id="vyral-stroke" x1="6" y1="28" x2="34" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
      <radialGradient id="vyral-dot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 13) rotate(90) scale(6)">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Plate — square edges */}
    <rect x="1" y="1" width="38" height="38" fill="url(#vyral-plate)" />
    <rect x="1" y="1" width="38" height="38" stroke="#ffffff" strokeOpacity="0.08" />

    {/* Concentric ripple arcs, evoking viral spread */}
    <path d="M8 30 Q 12 24 18 24" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 32 Q 13 21 23 22" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" />

    {/* Chart-line stroke forming a V that rises into a peak */}
    <path
      d="M7 27 L14 19 L20 25 L26 14 L30 13"
      stroke="url(#vyral-stroke)"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Pulse dot at the apex */}
    <circle cx="30" cy="13" r="6" fill="url(#vyral-dot)" />
    <circle cx="30" cy="13" r="2.2" fill="#ffffff" />
  </svg>
);

export default Logo;
