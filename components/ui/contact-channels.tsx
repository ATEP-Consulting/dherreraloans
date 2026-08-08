import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

export type ContactChannel = {
  key: 'phone' | 'whatsapp' | 'email' | 'form';
  /** Etiqueta corta del canal: ocupa el lugar del `stat` en las filas del índice. */
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
 * Filas de canal de contacto: misma métrica y comportamiento que `IndexRow` en tono navy
 * (borde `paper-a15`, guía punteada, hover que desplaza la fila y subraya el dato, nota en
 * segunda línea indentada) con el icono del canal donde el índice pone el numeral y la
 * etiqueta donde pone el stat. Sin clases reveal: son controles, siempre visibles.
 */
function ChannelRow({ channel }: { channel: ContactChannel }) {
  const inner = (
    <>
      <span
        aria-hidden
        className="w-14 shrink-0 self-center text-azure-soft transition-colors duration-300 group-hover:text-azure-light lg:w-20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icons[channel.key]}
        </svg>
      </span>
      <span className="font-display text-index font-light text-paper group-hover:underline group-hover:decoration-azure-soft group-hover:decoration-1 group-hover:underline-offset-[5px]">
        {channel.value}
      </span>
      <span aria-hidden className="mx-3 flex-1 -translate-y-1 border-b border-dotted border-paper-a28 lg:mx-4" />
      <span className="font-sans text-[12.5px] font-medium uppercase tracking-[.04em] text-azure-light lg:text-sm">
        {channel.label}
      </span>
      <span className="mt-1 w-full pl-14 font-sans text-sm text-paper-a75 lg:pl-20">{channel.note}</span>
    </>
  );
  const className =
    'group flex flex-wrap items-baseline border-b border-paper-a15 py-4 transition-[padding] duration-300 hover:pl-3 lg:py-[21px]';

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

export function ContactChannels({ channels }: { channels: ContactChannel[] }) {
  return (
    <div className="flex flex-col">
      {channels.map((channel) => (
        <ChannelRow key={channel.key} channel={channel} />
      ))}
    </div>
  );
}
