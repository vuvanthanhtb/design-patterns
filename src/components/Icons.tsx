// Bộ icon nét mảnh, kế thừa currentColor.
type P = { size?: number };
const base = (size = 14) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconBook = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M2.5 3.5c2-1 4-1 5.5.5 1.5-1.5 3.5-1.5 5.5-.5v9c-2-1-4-1-5.5.5-1.5-1.5-3.5-1.5-5.5-.5z" />
    <path d="M8 4v9" />
  </svg>
);
export const IconGrid = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </svg>
);
export const IconSheet = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
    <path d="M2.5 6h11M6 6v7.5" />
  </svg>
);
export const IconSearch = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </svg>
);
export const IconMoon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z" />
  </svg>
);
export const IconChevron = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m6 4 4 4-4 4" />
  </svg>
);
export const IconArrowRight = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const IconArrowLeft = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M13 8H3M7 4 3 8l4 4" />
  </svg>
);
export const IconReplay = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M3 8a5 5 0 1 0 1.5-3.5" />
    <path d="M3 2.5v2.5h2.5" />
  </svg>
);
export const IconPause = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M5.5 3.5v9M10.5 3.5v9" />
  </svg>
);
export const IconPlay = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M5 3.5v9l7-4.5z" />
  </svg>
);
export const IconClock = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v3l2 1.5" />
  </svg>
);
export const IconLayers = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m8 2.5 5.5 3L8 8.5 2.5 5.5z" />
    <path d="m2.5 8.5 5.5 3 5.5-3" />
  </svg>
);
export const IconSteps = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M6 4h7.5M6 8h7.5M6 12h7.5" />
    <circle cx="3" cy="4" r=".6" />
    <circle cx="3" cy="8" r=".6" />
    <circle cx="3" cy="12" r=".6" />
  </svg>
);
export const IconSpark = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" />
  </svg>
);
export const IconFile = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M4 2.5h5l3 3v8H4z" />
    <path d="M9 2.5v3h3" />
  </svg>
);
export const IconMenu = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  </svg>
);
export const IconCheck = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

export function Folder({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M1.5 4a1 1 0 0 1 1-1h3.6l1.4 1.5h6a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"
        fill={color}
        stroke="rgba(0,0,0,.25)"
        strokeWidth=".6"
      />
      <path d="M1.5 6h13" stroke="rgba(255,255,255,.35)" strokeWidth=".8" />
    </svg>
  );
}

export function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="3"
        width="10"
        height="7"
        rx="1.5"
        fill="var(--green)"
        stroke="var(--ink)"
        strokeWidth="1.3"
      />
      <rect
        x="11"
        y="14"
        width="10"
        height="7"
        rx="1.5"
        fill="var(--violet)"
        stroke="var(--ink)"
        strokeWidth="1.3"
      />
      <path d="M8 10v7.5h3" fill="none" stroke="var(--ink)" strokeWidth="1.3" />
    </svg>
  );
}
