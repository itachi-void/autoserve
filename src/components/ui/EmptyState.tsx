interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = "📭", title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground max-w-xs">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
