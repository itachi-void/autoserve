interface Props {
  icon?: string;
  value: string;
  label: string;
  sub?: string;
  valueClass?: string;
  className?: string;
}

export default function StatCard({ icon, value, label, sub, valueClass = "text-foreground", className = "" }: Props) {
  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      {icon && <div className="text-xl mb-2">{icon}</div>}
      <div className={`text-xl font-bold font-mono ${valueClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}
