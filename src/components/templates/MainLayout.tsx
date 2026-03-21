import type { ReactNode } from 'react';

import TopNavBar from '../organisms/TopNavBar';

export default function MainLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <TopNavBar />
      <div className="pt-16">{children}</div>
    </div>
  );
}
