interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
}

export default function DonutChart({ data, size = 160, thickness = 28, showLegend = true }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-slate-400 text-sm py-4 text-center">No data available</div>;

  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map(item => {
    const pct = item.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = offset * 360;
    offset += pct;
    return { ...item, dash, gap, rotation, pct };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke="#f1f5f9" strokeWidth={thickness}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={circumference / 4}
              transform={`rotate(${seg.rotation} ${cx} ${cy})`}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-slate-800">{total}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
      </div>
      {showLegend && (
        <div className="flex flex-col gap-1.5 w-full">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-800">{item.value}</span>
                <span className="text-slate-400 text-xs">({Math.round((item.value / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
