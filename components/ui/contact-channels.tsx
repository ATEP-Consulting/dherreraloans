import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

export type ContactChannel = {
  key: 'phone' | 'whatsapp' | 'email' | 'form';
  /** Etiqueta corta del canal, como eyebrow. */
  label: string;
  /** Dato o acción en Spectral: el teléfono, el email, «Escríbeme ahora». */
  value: string;
  note: string;
  href: string;
  /** Ruta interna (Link de next-intl) frente a tel:/mailto:/wa.me. */
  internal?: boolean;
};

const icons: Record<ContactChannel['key'], ReactNode> = {
  phone: <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />,
  whatsapp: <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 20l1-5.4a8.2 8.2 0 0 1-1-4A8.4 8.4 0 0 1 11.5 2 8.5 8.5 0 0 1 21 11.5Z" />,
  email: <path d="M3 6h18v12H3zM3 6l9 7 9-7" />,
  form: <path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" />,
};

/**
 * Canales de contacto en rejilla 2×2 **sin una sola línea**: etiqueta, dato en Spectral y
 * nota (spec 2026-08-08, enmienda «desrayado» — antes cada canal sumaba un borde inferior y
 * una guía punteada). Sin clases reveal: son controles, deben estar visibles siempre.
 */
function Channel({ channel }: { channel: ContactChannel }) {
  const inner = (
    <>
      <span className="flex items-center gap-2.5">
        <span aria-hidden className="text-azure-soft transition-colors duration-300 group-hover:text-azure-light">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {icons[channel.key]}
          </svg>
        </span>
        <span className="font-sans text-micro font-semibold uppercase tracking-label text-azure-soft">{channel.label}</span>
      </span>
      <span className="mt-2 block break-words font-display text-index font-light text-paper transition-colors duration-300 group-hover:text-azure-light">
        {channel.value}
      </span>
      <span className="mt-1.5 block max-w-[42ch] font-sans text-[13px] leading-relaxed text-paper-a75">{channel.note}</span>
    </>
  );
  const className = 'group block';

  return channel.internal ? (
    <Link href={channel.href as never} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={channel.href} target={channel.key === 'whatsapp' ? '_blank' : undefined} rel="noopener" className={className}>
      {inner}
    </a>
  );
}

export function ContactChannels({ channels, note }: { channels: ContactChannel[]; note?: string }) {
  return (
    <div className="flex flex-col">
      <div className="grid gap-8 sm:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
        {channels.map((channel) => (
          <Channel key={channel.key} channel={channel} />
        ))}
      </div>
      {note ? <p className="mt-12 font-sans text-fine italic text-paper-a55">{note}</p> : null}
    </div>
  );
}
