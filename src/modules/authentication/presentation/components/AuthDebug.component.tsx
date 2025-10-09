import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

export const AuthDebug = () => {
  const { user, isAuthenticated, token } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user?.name || 'None'}</div>
        <div>Role: {user?.role || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Token: {token ? 'Present' : 'None'}</div>
      </div>
    </div>
  );
};
