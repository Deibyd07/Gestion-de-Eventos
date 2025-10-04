import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toast } from '../../../features/events/components/Toast';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <Toast />
    </div>
  );
}