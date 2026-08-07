import { getLocale, getTranslations } from 'next-intl/server';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

// Sin `params`: not-found.tsx no los recibe (convención Next 16). El locale
// se lee del contexto de la petición, ya resuelto por app/[locale]/layout.tsx
// (que corre primero y llama a setRequestLocale) antes de que este árbol se
// monte como boundary de la ruta no encontrada.
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations('notFound');

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/"
        image={heroPersonal}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heading')}
        body={t('body')}
      />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <Button href="/" variant="navy">
            {t('cta')}
          </Button>
        </Container>
      </section>
    </>
  );
}
