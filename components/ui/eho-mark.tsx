type Props = {
  label: string;
};

export function EhoMark({ label }: Props) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3 3 10h2v10h14V10h2L12 3Z"></path>
        <path d="M9 13h6M9 16h6"></path>
      </svg>
      <span className="max-w-[92px] font-sans text-[10px] uppercase leading-tight">{label}</span>
    </div>
  );
}
