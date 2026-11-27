import type { CartItem, StoreConfig } from "@/types/store.types";
import { convertUsdToVes, formatUsd, formatVes } from "./currency";

export interface OrderCheckoutData {
	customerName: string;
	deliveryMode: "Delivery" | "Pick-up";
	addressOrZone?: string;
	paymentMethod: string;
	notes?: string;
}

const DEMO_PHONE_NUMBERS = new Set<string>(["584120000000", "584120000001"]);

/**
 * Normaliza el teléfono de la tienda dejando únicamente dígitos.
 * @param phone Número configurado en la tienda.
 */
export function normalizeWhatsAppPhone(phone: string): string {
	return phone.replace(/\D/g, "");
}

/**
 * Indica si el número configurado corresponde a un número ficticio de pruebas/demo
 * para evitar abrir chats externos por accidente.
 * @param phone Número de teléfono de la tienda.
 */
export function isDemoWhatsAppPhone(phone: string): boolean {
	const digits = normalizeWhatsAppPhone(phone);
	if (!digits) return true;
	if (DEMO_PHONE_NUMBERS.has(digits)) return true;
	return /^58\d{3}0{7}$/.test(digits);
}

/**
 * Construye el texto plano del ticket de pedido para WhatsApp o portapapeles.
 * @param store Configuración de la tienda activa.
 * @param items Productos y variantes en el carrito.
 * @param bcvRate Tasa de cambio BCV en bolívares por dólar.
 * @param order Datos de entrega y pago del cliente.
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
 * Construye el enlace wa.me codificado a partir del ticket de pedido.
 * @param store Configuración de la tienda activa.
 * @param items Productos y variantes en el carrito.
 * @param bcvRate Tasa de cambio BCV en bolívares por dólar.
 * @param order Datos de entrega y pago del cliente.
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
