interface Props {
  value: number;
  colorClass?: string;
  height?: string;
  showLabel?: boolean;
}

function autoColor(value: number): string {
  if (value >= 100) return "bg-rose-500";
  if (value >= 66) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function ProgressBar({ value, colorClass, height = "h-1.5", showLabel = false }: Props) {
  const color = colorClass ?? autoColor(value);
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>التقدم</span>
          <span>{value}٪</span>
        </div>
      )}
      <div className={`w-full ${height} bg-secondary rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
