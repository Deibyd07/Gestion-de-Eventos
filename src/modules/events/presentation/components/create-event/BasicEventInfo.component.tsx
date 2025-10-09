import React from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface BasicEventInfoProps {
  register: any;
  errors: any;
  categories: string[];
}

export const BasicEventInfo: React.FC<BasicEventInfoProps> = ({
  register,
  errors,
  categories
}) => {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del Evento *
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Feria Agropecuaria Nacional 2024"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe tu evento en detalle..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Fecha del Evento *
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-2" />
            Hora del Evento *
          </label>
          <input
            {...register('time')}
            type="time"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      {/* Ubicación y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Ubicación *
          </label>
          <input
            {...register('location')}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Centro de Convenciones, Bogotá"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Aforo y Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-2" />
            Aforo Máximo *
          </label>
          <input
            {...register('maxAttendees', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 100"
          />
          {errors.maxAttendees && (
            <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (opcional)
          </label>
          <input
            {...register('tags')}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: agropecuario, ganadería, agricultura"
          />
        </div>
      </div>
    </div>
  );
};
