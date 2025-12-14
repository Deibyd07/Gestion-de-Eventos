/**
 * Utilidades para formatear moneda en pesos colombianos (COP)
 */

/**
 * Formatea un número como precio en pesos colombianos
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns String formateado con el símbolo de peso colombiano
 */
export function formatPrice(
  amount: number,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    showSymbol = true,
    showDecimals = false,
    locale = 'es-CO'
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formatted = formatter.format(amount);

  if (!showSymbol) {
    return formatted.replace('COP', '').trim();
  }

  return formatted;
}

/**
 * Formatea un precio para mostrar en tarjetas y listas
 * @param amount - Cantidad a formatear
 * @returns String formateado para mostrar en UI
 */
export function formatPriceDisplay(amount: number): string {
  if (amount === 0) {
    return 'Gratis';
  }

  return formatPrice(amount, { showDecimals: false });
}

/**
 * Formatea un precio para mostrar en formularios
 * @param amount - Cantidad a formatear
 * @returns String formateado para inputs
 */
export function formatPriceInput(amount: number): string {
  return amount.toString();
}

/**
 * Convierte un string de precio a número
 * @param priceString - String del precio
 * @returns Número del precio
 */
export function parsePrice(priceString: string): number {
  // Remover símbolos y espacios
  const cleanString = priceString.replace(/[^\d.,]/g, '');

  // Reemplazar coma por punto para decimales
  const normalizedString = cleanString.replace(',', '.');

  return parseFloat(normalizedString) || 0;
}

/**
 * Formatea un rango de precios
 * @param min - Precio mínimo
 * @param max - Precio máximo
 * @returns String formateado del rango
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === 0 && max === 0) {
    return 'Gratis';
  }

  if (min === max) {
    return formatPriceDisplay(min);
  }

  return `${formatPriceDisplay(min)} - ${formatPriceDisplay(max)}`;
}

/**
 * Formatea precios para filtros rápidos
 */
export const QUICK_PRICE_FILTERS = [
  { label: 'Gratis', range: [0, 0] },
  { label: 'Hasta $50.000', range: [0, 50000] },
  { label: '$50.000 - $100.000', range: [50000, 100000] },
  { label: '$100.000 - $200.000', range: [100000, 200000] },
  { label: 'Más de $200.000', range: [200000, 1000000] }
];

/**
 * Formatea ingresos y métricas financieras
 * @param amount - Cantidad a formatear
 * @returns String formateado para métricas
 */
export function formatRevenue(amount: number): string {
  if (amount >= 1000000) {
    return `${formatPrice(amount / 1000000, { showSymbol: false })}M COP`;
  }

  if (amount >= 1000) {
    return `${formatPrice(amount / 1000, { showSymbol: false })}K COP`;
  }

  return formatPrice(amount);
}

/**
 * Formatea ingresos mostrando el valor completo sin abreviaciones
 * @param amount - Cantidad a formatear
 * @returns String formateado completo (ej. $ 20.000 COP)
 */
export function formatFullRevenue(amount: number): string {
  return formatPrice(amount);
}
