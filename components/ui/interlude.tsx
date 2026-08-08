import Image, { type StaticImageData } from 'next/image';
import { Container } from '@/components/ui/container';

type Props = {
  image: StaticImageData;
  alt: string;
  quote?: string;
  cite?: string;
};

export function Interlude({ image, alt, quote, cite }: Props) {
  return (
    <figure className="relative overflow-hidden bg-navy-deep">
      <div className="reveal-curtain relative h-[300px] lg:h-[420px]">
        <Image src={image} alt={alt} fill sizes="100vw" className="reveal-zoom object-cover" />
        <div aria-hidden className="absolute inset-0 [background:var(--scrim-interlude)]" />
      </div>
      {quote ? (
        <figcaption className="absolute inset-x-0 bottom-0">
          <Container className="reveal-rise flex flex-col gap-3 px-5 pb-9 lg:px-[72px] lg:pb-12">
            <blockquote className="max-w-[560px] font-display text-[22px] font-light italic leading-[1.4] text-paper lg:text-[26px]">
              {quote}
            </blockquote>
            {cite ? (
              <cite className="font-sans text-micro font-medium uppercase not-italic tracking-label text-azure-light">{cite}</cite>
            ) : null}
          </Container>
        </figcaption>
      ) : null}
    </figure>
  );
}
