import type { ReactNode } from 'react';

// Se remonta en cada navegación de su nivel → re-dispara .page-enter (solo transform: LCP-safe).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
