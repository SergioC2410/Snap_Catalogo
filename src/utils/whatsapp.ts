import type { CartItem, StoreConfig } from "@/types/store.types";
import { convertUsdToVes, formatUsd, formatVes } from "./currency";

export interface OrderCheckoutData {
	customerName: string;
	deliveryMode: "Delivery" | "Pick-up";
	addressOrZone?: string;
	paymentMethod: string;
	notes?: string;
}

// Test numbers: we don't open real WhatsApp with these.
// Números de prueba: con estos no abrimos WhatsApp real.
const DEMO_PHONE_NUMBERS = new Set<string>(["584120000000", "584120000001"]);

/**
 * wa.me only accepts digits, so we strip "+", spaces, dashes, etc.
 * wa.me solo acepta dígitos, así que limpiamos "+", espacios, guiones, etc.
 */
export function normalizeWhatsAppPhone(phone: string): string {
	return phone.replace(/\D/g, "");
}

/**
 * Is this a fake/demo number? If so, skip opening the real chat by mistake.
 * Covers the hard-coded test numbers and the common 58XXX0000000 placeholder pattern.
 * ¿Es un número de mentira (demo/testing)? En ese caso no hay que abrir el chat
 * real por accidente. Cubre los fijos de prueba y el relleno típico 58XXX0000000.
 */
export function isDemoWhatsAppPhone(phone: string): boolean {
	const digits = normalizeWhatsAppPhone(phone);
	if (!digits) return true;
	if (DEMO_PHONE_NUMBERS.has(digits)) return true;
	return /^58\d{3}0{7}$/.test(digits);
}

/**
 * Builds the order text for WhatsApp or clipboard copy.
 * We round per line item to cents before summing so the total doesn't drift.
 * Arma el texto del pedido para WhatsApp o para copiar al portapapeles.
 * Redondeamos por ítem a centavos antes de sumar para que el total no se
 * vaya de decimales.
 */
export function buildWhatsAppOrderMessage(
	store: StoreConfig,
	items: CartItem[],
	bcvRate: number,
	order: OrderCheckoutData,
): string {
	const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
	const totalUsd =
		items.reduce(
			(acc, item) => acc + Math.round(item.unitPriceUsd * 100) * item.quantity,
			0,
		) / 100;
	const totalVes = convertUsdToVes(totalUsd, bcvRate);

	const deliveryLine = order.addressOrZone?.trim()
		? `${order.deliveryMode} — ${order.addressOrZone.trim()}`
		: order.deliveryMode;

	const lines: string[] = [
		`🛍️ *NUEVO PEDIDO — ${store.name.toUpperCase()}*`,
		"━━━━━━━━━━━━━━━━━━",
		`👤 *Cliente:* ${order.customerName.trim()}`,
		`📍 *Modalidad:* ${deliveryLine}`,
		`💳 *Pago:* ${order.paymentMethod}`,
		"",
		`📦 *Detalle del pedido (${totalItems} ${totalItems === 1 ? "ítem" : "ítems"}):*`,
		...items.map((item) => {
			const lineTotal =
				(Math.round(item.unitPriceUsd * 100) * item.quantity) / 100;
			return `• ${item.quantity}x ${item.name} [${item.variantLabel}] — ${formatUsd(lineTotal)}`;
		}),
		"",
		"━━━━━━━━━━━━━━━━━━",
		`💵 *Total USD:* ${formatUsd(totalUsd)}`,
		`🇻🇪 *Ref. BCV (${bcvRate.toFixed(2)}):* ${formatVes(totalVes)}`,
	];

	if (order.notes?.trim()) {
		lines.push("", `📝 Nota: ${order.notes.trim()}`);
	}

	lines.push("", "_Tasa BCV referencial sujeta a confirmación al pagar._");

	return lines.join("\n");
}

/**
 * wa.me link with the message already encoded, pointing to the store's number.
 * Link wa.me con el mensaje ya codificado, apuntando al número de la tienda.
 */
export function buildWhatsAppOrderUrl(
	store: StoreConfig,
	items: CartItem[],
	bcvRate: number,
	order: OrderCheckoutData,
): string {
	const message = buildWhatsAppOrderMessage(store, items, bcvRate, order);
	const encodedMessage = encodeURIComponent(message);
	const cleanPhone = normalizeWhatsAppPhone(store.whatsappPhone);
	return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
