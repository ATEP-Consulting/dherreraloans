import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Todo excepto api, assets de Next y archivos con extensión (favicon, imágenes…)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
