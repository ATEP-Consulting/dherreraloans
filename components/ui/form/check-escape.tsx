'use client';

type Props = { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void };

export function CheckEscape({ id, label, checked, onChange }: Props) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 font-sans text-sm text-body">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 appearance-none border border-leader bg-plate checked:border-navy checked:bg-navy"
      />
      {label}
    </label>
  );
}
