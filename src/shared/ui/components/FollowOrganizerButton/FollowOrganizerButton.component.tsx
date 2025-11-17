import React, { useEffect, useState } from 'react';
import { OrganizerFollowService } from '@shared/lib/api/services/OrganizerFollow.service';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface FollowOrganizerButtonProps {
  organizerId: string;
  organizerName: string;
  currentUserId: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
  showName?: boolean;
}

export const FollowOrganizerButton: React.FC<FollowOrganizerButtonProps> = ({
  organizerId,
  organizerName,
  currentUserId,
  className = '',
  variant = 'default',
  showName = true
}) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      if (!currentUserId || !organizerId || currentUserId === organizerId) return;
      try {
        const followed = await OrganizerFollowService.esSeguido(currentUserId, organizerId);
        if (mounted) setIsFollowing(followed);
      } catch (e: any) {
        console.error('Error verificando seguimiento:', e);
      }
    };
    loadStatus();
    return () => { mounted = false; };
  }, [currentUserId, organizerId]);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUserId) {
      setError('Debes iniciar sesión para seguir organizadores');
      return;
    }
    if (currentUserId === organizerId) {
      setError('No puedes seguirte a ti mismo');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isFollowing) {
        await OrganizerFollowService.dejarDeSeguir(currentUserId, organizerId);
        setIsFollowing(false);
      } else {
        await OrganizerFollowService.seguirOrganizador(currentUserId, organizerId);
        setIsFollowing(true);
      }
    } catch (e: any) {
      console.error('Error cambiando estado de seguimiento:', e);
      setError(e.message || 'Error al actualizar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  if (!organizerId || !currentUserId || currentUserId === organizerId) return null;

  // Variante compacta para tarjetas de eventos
  if (variant === 'compact') {
    return (
      <div className={className}>
        <button
          onClick={toggleFollow}
          disabled={loading}
          className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 shadow-sm
            ${isFollowing
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-md'}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          aria-label={isFollowing ? 'Dejar de seguir organizador' : 'Seguir organizador'}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserCheck className="w-3 h-3" />
              {showName && <span>Siguiendo</span>}
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" />
              {showName && <span>Seguir</span>}
            </>
          )}
        </button>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  // Variante solo icono
  if (variant === 'icon') {
    return (
      <div className={className}>
        <button
          onClick={toggleFollow}
          disabled={loading}
          title={isFollowing ? 'Siguiendo' : 'Seguir'}
          className={`p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 shadow-sm
            ${isFollowing
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-500 text-white hover:bg-blue-600'}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          aria-label={isFollowing ? 'Dejar de seguir organizador' : 'Seguir organizador'}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="w-3.5 h-3.5" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    );
  }

  // Variante default (perfil público)
  return (
    <div className={className}>
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg
          ${isFollowing
            ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300 hover:from-gray-200 hover:to-gray-300'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-blue-500 hover:from-blue-700 hover:to-purple-700'}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        aria-label={isFollowing ? 'Dejar de seguir organizador' : 'Seguir organizador'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : isFollowing ? (
          <>
            <UserCheck className="w-4 h-4" />
            <span>Siguiendo</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Seguir</span>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};
