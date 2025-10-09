import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';

export function Toast() {
  const { notifications, removeNotification } = useNotificationStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true);
    }
  }, [notifications.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getBackgroundColor(notification.type)}
            border rounded-lg shadow-lg p-4 max-w-sm
            transform transition-all duration-300 ease-in-out
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${getTextColor(notification.type)}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${getTextColor(notification.type)} opacity-90`}>
                {notification.message}
              </p>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors ${getTextColor(notification.type)}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}








