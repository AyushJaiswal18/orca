export default function OrcaLogo({ className = "", width = 300, height = 200 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 200"
      className={className}
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#0a2540", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#006699", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M 40 60 L 180 60 Q 220 60 240 90 L 260 130 Q 270 150 240 150 L 60 150 Q 30 150 40 120 Z"
        fill="url(#grad1)"
      />
      <path
        d="M 190 75 Q 210 75 220 95 Q 225 110 205 115 L 160 115 Q 140 110 145 90 Q 150 75 190 75 Z"
        fill="white"
      />
      <line
        x1="160"
        y1="60"
        x2="160"
        y2="150"
        stroke="#00d4ff"
        strokeWidth="3"
        opacity="0.3"
      />
      <line
        x1="100"
        y1="60"
        x2="100"
        y2="150"
        stroke="#00d4ff"
        strokeWidth="3"
        opacity="0.3"
      />
      <text
        x="150"
        y="185"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="32"
        fill="#0a2540"
        textAnchor="middle"
        letterSpacing="2"
      >
        ORCA
      </text>
    </svg>
  );
}

