import { whatsAppHref } from '@/lib/site';

type Props = {
  label: string;
  message: string;
};

export function WhatsAppButton({ label, message }: Props) {
  return (
    <a
      href={whatsAppHref(message)}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-2.5 border border-paper-a55 px-6 py-4 font-sans text-[13.5px] font-medium text-paper transition hover:bg-paper-a25"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 20l1-5.4a8.2 8.2 0 0 1-1-4A8.4 8.4 0 0 1 11.5 2 8.5 8.5 0 0 1 21 11.5Z"></path>
      </svg>
      {label}
    </a>
  );
}
