/**
 * Utilidades para manejo de fechas en Colombia (zona horaria America/Bogota)
 */

/**
 * Obtiene la fecha y hora actual en la zona horaria de Colombia
 * @returns Date object en zona horaria de Colombia
 */
export function getCurrentColombiaDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
}

/**
 * Formatea una fecha para mostrar en la interfaz de usuario
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns String formateado
 */
export function formatDate(
  date: string | Date, 
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    format = 'medium',
    includeTime = false,
    locale = 'es-CO'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };

  switch (format) {
    case 'short':
      formatOptions.day = 'numeric';
      formatOptions.month = 'short';
      formatOptions.year = '2-digit';
      break;
    case 'medium':
      formatOptions.day = 'numeric';
      formatOptions.month = 'long';
      formatOptions.year = 'numeric';
      break;
    case 'long':
      formatOptions.weekday = 'long';
      formatOptions.day = 'numeric';
      formatOptions.month = 'long';
      formatOptions.year = 'numeric';
      break;
    case 'full':
      formatOptions.weekday = 'long';
      formatOptions.day = 'numeric';
      formatOptions.month = 'long';
      formatOptions.year = 'numeric';
      break;
  }

  return dateObj.toLocaleDateString(locale, formatOptions);
}

/**
 * Formatea una fecha para mostrar en tarjetas de eventos
 * @param date - Fecha a formatear
 * @returns String formateado para UI
 */
export function formatEventDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha para mostrar en dashboards y analíticas
 * @param date - Fecha a formatear
 * @returns String formateado para métricas
 */
export function formatDashboardDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha para inputs de formulario (YYYY-MM-DD)
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota'
  });
}

/**
 * Formatea una hora para mostrar en la interfaz
 * @param time - Hora a formatear (formato HH:MM o Date)
 * @returns String formateado
 */
export function formatTime(time: string | Date): string {
  if (typeof time === 'string') {
    return time.slice(0, 5); // HH:MM
  }
  
  return time.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Obtiene la fecha actual en formato para base de datos
 * @returns String en formato ISO con zona horaria de Colombia
 */
export function getCurrentColombiaISOString(): string {
  const now = getCurrentColombiaDate();
  return now.toISOString();
}

/**
 * Convierte una fecha de la base de datos a zona horaria de Colombia
 * @param isoString - String ISO de la base de datos
 * @returns Date object en zona horaria de Colombia
 */
export function fromDatabaseDate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Convierte una fecha a formato de base de datos
 * @param date - Fecha a convertir
 * @returns String ISO para base de datos
 */
export function toDatabaseDate(date: Date): string {
  return date.toISOString();
}

/**
 * Obtiene la fecha de registro actual para nuevos usuarios
 * @returns String ISO con timestamp actual de Colombia
 */
export function getRegistrationDate(): string {
  return getCurrentColombiaISOString();
}

/**
 * Calcula la diferencia de tiempo entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Objeto con diferencias
 */
export function getDateDifference(startDate: string | Date, endDate: string | Date) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  return {
    days: diffDays,
    hours: diffHours,
    minutes: diffMinutes,
    milliseconds: diffMs
  };
}

/**
 * Verifica si una fecha es hoy
 * @param date - Fecha a verificar
 * @returns Boolean
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getCurrentColombiaDate();
  
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Verifica si una fecha es en el futuro
 * @param date - Fecha a verificar
 * @returns Boolean
 */
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentColombiaDate();
  
  return dateObj > now;
}

/**
 * Verifica si una fecha es en el pasado
 * @param date - Fecha a verificar
 * @returns Boolean
 */
export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentColombiaDate();
  
  return dateObj < now;
}
