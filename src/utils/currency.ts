/**
 * ES: Convierte USD a VES trabajando primero en centavos; así se reducen errores de coma flotante.
 * EN: Converts USD to VES using cents first, which reduces floating-point rounding errors.
 */
export function convertUsdToVes(amountUsd: number, bcvRate: number): number {
	const centsUsd = Math.round(amountUsd * 100);
	return Math.round(centsUsd * bcvRate) / 100;
}

export function formatUsd(amountUsd: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amountUsd);
}

/**
 * ES: Usa el formato venezolano: `Bs.` y coma para los decimales.
 * EN: Uses Venezuelan formatting: `Bs.` and a comma for decimal places.
 */
export function formatVes(amountVes: number): string {
	const formatted = new Intl.NumberFormat("es-VE", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amountVes);
	return `Bs. ${formatted}`;
}
