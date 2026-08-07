'use client';
import { useRef } from 'react';

type Props = {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
  onPointerSelect?: (value: string) => void;
};

export function ChoiceCard({ name, value, label, checked, onSelect, onPointerSelect }: Props) {
  const viaPointer = useRef(false);
  return (
    <label
      onPointerDown={() => {
        viaPointer.current = true;
        // Reset after event cycle to prevent keyboard from triggering onPointerSelect if click doesn't fire onChange
        setTimeout(() => {
          viaPointer.current = false;
        }, 0);
      }}
      className={`flex cursor-pointer items-center justify-between border px-5 py-4 font-sans text-base transition has-focus-visible:outline-2 has-focus-visible:outline-focus ${
        checked ? 'border-navy bg-sand text-ink' : 'border-leader bg-plate text-body hover:border-navy'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => {
          onSelect(value);
          if (viaPointer.current) onPointerSelect?.(value);
          viaPointer.current = false;
        }}
        className="sr-only"
      />
      <span>{label}</span>
      <span aria-hidden className={`ml-4 h-2.5 w-2.5 shrink-0 border ${checked ? 'border-navy bg-navy' : 'border-leader'}`} />
    </label>
  );
}
