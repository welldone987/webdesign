import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-stone-50 focus:px-4 focus:py-3 focus:text-stone-950"
        href="#gallery"
      >
        跳到作品列表
      </a>
      {children}
    </div>
  );
}
