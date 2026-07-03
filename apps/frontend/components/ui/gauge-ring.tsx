"use client";

interface GaugeRingProps {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  size?: number;
}

export default function GaugeRing({
  value,
  label,
  sublabel,
  color,
  size = 120,
}: GaugeRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Safe math clamp to avoid NaN or invalid SVG values
  const safeValue = Number.isFinite(value) ? value : 0;
  const clampedValue = Math.min(Math.max(safeValue, 0), 100);
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-800"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold text-slate-100">
            {clampedValue}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-mono font-bold text-slate-300">
          {label}
        </p>
        <p className="text-[9px] font-mono text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}
