import { MessageCircle, X } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatButton({ isOpen, onToggle }: ChatButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-gradient-to-r from-purple-600 to-blue-600
        hover:from-purple-700 hover:to-blue-700
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        flex items-center justify-center
        group
        ${isOpen ? 'rotate-90' : 'rotate-0'}
      `}
      aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de asistente'}
    >
      {isOpen ? (
        <X className="w-6 h-6 transition-transform duration-300" />
      ) : (
        <MessageCircle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
      )}

      {/* Pulse animation cuando está cerrado */}
      {!isOpen && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
      )}
    </button>
  );
}
