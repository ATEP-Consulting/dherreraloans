import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Band } from '@/components/ui/band';
import { Button } from '@/components/ui/button';

type Props = {
  ctas?: ReactNode;
};

export async function CtaBand({ ctas }: Props) {
  const t = await getTranslations();
  const tc = await getTranslations('common');
  const em = { em: (chunks: React.ReactNode) => <em>{chunks}</em> };

  return (
    <Band tone="navy">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="max-w-[760px] font-display text-h2 font-light text-paper [text-wrap:pretty] [&_em]:italic">
          {t.rich('home.ctaBand.title', em)}
        </h2>
        {ctas ?? (
          <span className="shrink-0">
            <Button href="/quote" variant="paper" size="lg">
              {tc('cta.quote')}
            </Button>
          </span>
        )}
      </div>
    </Band>
  );
}
