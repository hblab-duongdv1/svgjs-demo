/**
 * Cute toy hammer for the game-demo cursor overlay (React SVG, not svg.js).
 * Pointer hotspot in `GameCanvas`: bottom-center of metal head ≈ (38, 42) in this viewBox.
 */
export default function CuteHammer(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      width={76}
      height={92}
      viewBox="0 0 76 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="ch-hammer-metal"
          x1="8"
          y1="12"
          x2="68"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient
          id="ch-hammer-wood"
          x1="30"
          y1="38"
          x2="46"
          y2="86"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <ellipse cx="38" cy="88" rx="14" ry="4" fill="rgba(26,27,34,0.12)" />
      <rect
        x="29"
        y="40"
        width="18"
        height="46"
        rx="6"
        fill="url(#ch-hammer-wood)"
        stroke="#78350f"
        strokeWidth="2"
      />
      <rect
        x="33"
        y="48"
        width="10"
        height="14"
        rx="2"
        fill="#fde68a"
        opacity="0.45"
      />
      <rect
        x="6"
        y="10"
        width="64"
        height="32"
        rx="10"
        fill="url(#ch-hammer-metal)"
        stroke="#475569"
        strokeWidth="2"
      />
      <rect
        x="12"
        y="16"
        width="52"
        height="10"
        rx="3"
        fill="#f1f5f9"
        opacity="0.55"
      />
      <circle
        cx="38"
        cy="4"
        r="5"
        fill="#64748b"
        stroke="#334155"
        strokeWidth="1.5"
      />
    </svg>
  );
}
