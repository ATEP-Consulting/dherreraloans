import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

type Props = {
  image: StaticImageData;
  alt: string;
  caption: ReactNode;
};

export function PhotoPlate({ image, alt, caption }: Props) {
  return (
    <figure className="border border-ink bg-plate">
      <div className="relative h-[280px] lg:h-[400px]">
        <Image src={image} alt={alt} fill className="object-contain" />
      </div>
      <figcaption className="border-t border-ink px-4 py-2.5 font-sans text-micro italic text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
