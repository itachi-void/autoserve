interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}

export default function SearchBox({ value, onChange, placeholder = "بحث...", id }: Props) {
  return (
    <div className="glow-search-poda glow-search-box">
      <div className="glow-layer" />
      <div className="glow-darkBorderBg" />
      <div className="glow-white" />
      <div className="glow-border" />
      <div className="glow-search-main">
        <div className="glow-search-accent-spot" />
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="glow-search-input"
          aria-label={id ? undefined : placeholder}
        />
        <label
          htmlFor={id}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm z-10"
          aria-hidden="true"
        >
          🔍
        </label>
      </div>
    </div>
  );
}
