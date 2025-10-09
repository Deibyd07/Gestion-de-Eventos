/**
 * Utilidad para combinar clases CSS
 * Basado en clsx y tailwind-merge
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean>;

/**
 * Combina clases CSS de manera inteligente
 * @param inputs - Clases CSS a combinar
 * @returns String con las clases combinadas
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object' && input !== null) {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Combina clases condicionalmente
 * @param condition - Condición para aplicar la clase
 * @param trueClass - Clase a aplicar si la condición es verdadera
 * @param falseClass - Clase a aplicar si la condición es falsa
 * @returns String con la clase aplicada
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string {
  return condition ? trueClass : falseClass;
}

/**
 * Combina múltiples condiciones
 * @param conditions - Array de condiciones y clases
 * @returns String con las clases aplicadas
 */
export function conditionalClasses(
  conditions: Array<{ condition: boolean; class: string }>
): string {
  return conditions
    .filter(({ condition }) => condition)
    .map(({ class: className }) => className)
    .join(' ');
}
