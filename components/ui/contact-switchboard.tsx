import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

export type ContactChannel = {
  key: 'phone' | 'whatsapp' | 'email' | 'form';
  /** Eyebrow de la fila: «Llamar», «WhatsApp»… */
  label: string;
  /** Dato o acción en grande: el teléfono, el email, «Escríbeme ahora». */
  value: string;
  note: string;
  href: string;
  /** Ruta interna (Link de next-intl) frente a tel:/mailto:/wa.me. */
  internal?: boolean;
};

type Props = {
  eyebrow: string;
  title: ReactNode;
  body: string;
  channels: ContactChannel[];
  image: StaticImageData;
  imageAlt: string;
  badgeLabel: string;
  badgeValue: string;
};

const icons: Record<ContactChannel['key'], ReactNode> = {
  phone: <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />,
  whatsapp: <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 20l1-5.4a8.2 8.2 0 0 1-1-4A8.4 8.4 0 0 1 11.5 2 8.5 8.5 0 0 1 21 11.5Z" />,
  email: <path d="M3 6h18v12H3zM3 6l9 7 9-7" />,
  form: <path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" />,
};

function ChannelRow({ channel }: { channel: ContactChannel }) {
  const inner = (
    <>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center border border-azure-soft text-azure-light transition-colors duration-300 group-hover:bg-azure-light group-hover:text-navy"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icons[channel.key]}
        </svg>
      </span>
      <span className="flex-1">
        <span className="block font-sans text-[10.5px] font-medium uppercase tracking-label text-azure-light">{channel.label}</span>
        <span className="mt-0.5 block break-words font-display text-index font-light text-paper">{channel.value}</span>
        <span className="mt-0.5 block font-sans text-[12.5px] text-paper-a75">{channel.note}</span>
      </span>
      <span aria-hidden className="font-display text-[22px] text-azure-soft transition-transform duration-300 group-hover:translate-x-1.5">
        →
      </span>
    </>
  );
  // Sin clases reveal: son controles de contacto, deben estar visibles siempre.
  const className =
    'group flex items-center gap-5 border-b border-paper-a15 px-5 py-4 transition-[background-color,padding-left] duration-300 ease-expo hover:bg-paper-a15 hover:pl-8 lg:px-[72px] lg:py-[18px] lg:hover:pl-[84px]';

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

/**
 * Conmutador de contacto: la página ES la elección de canal (spec 2026-08-08, concepto A).
 * Split navy/foto en escritorio; en móvil el encabezado y los canales van primero y la
 * foto cierra, para que ningún canal caiga bajo el fold.
 */
export function ContactSwitchboard({ eyebrow, title, body, channels, image, imageAlt, badgeLabel, badgeValue }: Props) {
  return (
    <section className="grid bg-navy lg:min-h-svh lg:grid-cols-[1.05fr_.95fr]">
      <div className="flex flex-col pt-28 lg:pt-36">
        <div className="reveal-rise flex flex-col gap-2.5 px-5 pb-6 lg:px-[72px] lg:pb-8">
          <p className="font-sans text-[10.5px] font-medium uppercase tracking-label text-azure-light lg:text-micro">{eyebrow}</p>
          <h1 className="max-w-[520px] font-display text-h2 font-light text-paper [text-wrap:pretty] [&_em]:italic">{title}</h1>
          <p className="max-w-[460px] font-sans text-[15px] leading-relaxed text-paper-a85">{body}</p>
        </div>
        <div className="flex flex-col border-t border-paper-a15">
          {channels.map((channel) => (
            <ChannelRow key={channel.key} channel={channel} />
          ))}
        </div>
      </div>
      <figure className="relative min-h-[280px] overflow-hidden lg:min-h-0">
        <div className="reveal-curtain-l absolute inset-0">
          <Image src={image} alt={imageAlt} fill priority placeholder="blur" sizes="(min-width: 980px) 48vw, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 [background:linear-gradient(90deg,rgb(16_49_74/.6),rgb(16_49_74/.08))]" />
        </div>
        <figcaption className="absolute bottom-8 left-0 bg-paper px-6 py-4">
          <span className="block font-sans text-[10.5px] font-medium uppercase tracking-label text-muted">{badgeLabel}</span>
          <span className="mt-0.5 block font-display text-[19px] font-light text-ink">{badgeValue}</span>
        </figcaption>
      </figure>
    </section>
  );
}
