import type { ReactNode } from 'react';
import { ViewTransition } from 'react';

// Ver app/[locale]/template.tsx — mismo patrón de SPIKE (Task 16) para este nivel anidado.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition>
      <div className="page-enter">{children}</div>
    </ViewTransition>
  );
}
