// src/utils/currency.ts

/**
 * Convierte un monto en USD a bolívares redondeado a 2 decimales exactos
 * usando aritmética escalada para mitigar imprecisiones binarias de IEEE 754.
 */
export function convertUsdToVes(amountUsd: number, bcvRate: number): number {
	const centsUsd = Math.round(amountUsd * 100);
	return Math.round(centsUsd * bcvRate) / 100;
}

/**
 * Formatea precios en USD estándar (ej. "$60.00").
 */
export function formatUsd(amountUsd: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amountUsd);
}

/**
 * Formatea montos en bolívares al formato venezolano (ej. "Bs. 55.125,97").
 */
export function formatVes(amountVes: number): string {
	const formatted = new Intl.NumberFormat("es-VE", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amountVes);
	return `Bs. ${formatted}`;
}
