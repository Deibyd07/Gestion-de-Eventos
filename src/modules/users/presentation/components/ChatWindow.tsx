import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, X } from 'lucide-react';
import { CHAT_CONFIG } from '../config/chat.config';
import { ChatService } from '../services/Chat.service';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: CHAT_CONFIG.INITIAL_MESSAGE,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Llamada al agente IA usando el servicio
      const botResponseText = await ChatService.sendMessage(messageText, user?.id);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al comunicarse con el agente IA:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: CHAT_CONFIG.ERROR_MESSAGE,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed z-50
        bottom-4 left-4 sm:bottom-6 sm:left-6
        w-[calc(100vw-2rem)] sm:w-96
        h-[400px] sm:h-[500px] max-h-[calc(100vh-120px)]
        bg-white rounded-2xl shadow-2xl
        flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Asistente Virtual</h3>
            <p className="text-xs text-white/80">En línea</p>
          </div>
        </div>
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
          >
            {/* Avatar */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
                }
              `}
            >
              {message.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`
                max-w-[75%] rounded-2xl px-4 py-2.5
                ${message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                }
              `}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <span
                className={`
                  text-xs mt-1 block
                  ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}
                `}
              >
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-700" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="
              flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm
              border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200
              outline-none transition-all
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="
              w-10 h-10 rounded-full
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-700 hover:to-blue-700
              text-white
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              hover:shadow-lg
            "
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
