/**
 * Utilidades financieras para el ERP.
 * Maneja céntimos (enteros) para evitar errores de punto flotante.
 */

/**
 * Convierte un monto en céntimos a una cadena formateada en Soles.
 * Ejemplo: 1550 -> "S/ 15.50"
 */
export const formatCurrency = (amountInCents: number): string => {
  return `S/ ${(amountInCents / 100).toFixed(2)}`;
};

/**
 * Convierte soles (decimal) a céntimos (entero).
 * Ejemplo: 15.50 -> 1550
 */
export const toCents = (amountInSoles: number): number => {
  return Math.round(amountInSoles * 100);
};

/**
 * Devuelve solo el valor decimal formateado sin el símbolo de moneda.
 * Ejemplo: 1550 -> "15.50"
 */
export const formatRaw = (amountInCents: number): string => {
  return (amountInCents / 100).toFixed(2);
};
