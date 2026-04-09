interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  unit?: string;
  horizontal?: boolean;
  showValues?: boolean;
  height?: number;
}

export default function BarChart({ data, unit = '', horizontal = true, showValues = true }: BarChartProps) {
  if (!data.length) return <div className="text-slate-400 text-sm py-4 text-center">No data available</div>;

  const max = Math.max(...data.map(d => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-36 text-right text-sm text-slate-600 shrink-0 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                style={{
                  width: `${Math.max((item.value / max) * 100, 2)}%`,
                  backgroundColor: item.color || '#0891b2',
                }}
              >
                {showValues && item.value > 0 && (
                  <span className="text-xs text-white font-semibold">{item.value}{unit}</span>
                )}
              </div>
            </div>
            {showValues && (
              <div className="w-12 text-sm font-semibold text-slate-700 shrink-0">
                {item.value}{unit}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs font-semibold text-slate-600">{item.value}{unit}</div>
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${Math.max((item.value / max) * 160, 4)}px`,
              backgroundColor: item.color || '#0891b2',
            }}
          />
          <div className="text-xs text-slate-500 text-center leading-tight">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
