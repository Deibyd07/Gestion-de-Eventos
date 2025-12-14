import { ReactNode, useState } from 'react';
import { Header } from './Header.layout';
import { Footer } from './Footer.layout';
import { Toast } from '../../../modules/events/presentation/components/Toast.component';
import { ChatButton } from '../../../modules/users/presentation/components/ChatButton';
import { ChatWindow } from '../../../modules/users/presentation/components/ChatWindow';
import { useAuthStore } from '../../../modules/authentication/infrastructure/store/Auth.store';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Solo mostrar el chat para usuarios autenticados que no sean admin
  const showChat = isAuthenticated && user?.role !== 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <Toast />

      {/* Chat AI - Disponible globalmente para usuarios autenticados */}
      {showChat && (
        <>
          <ChatButton isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
          <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      )}
    </div>
  );
}