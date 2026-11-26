import type { CartItem, StoreConfig } from "@/types/store.types";
import { convertUsdToVes, formatUsd, formatVes } from "./currency";

export interface OrderCheckoutData {
	customerName: string;
	deliveryMode: "Delivery" | "Pick-up";
	addressOrZone?: string;
	paymentMethod: string;
	notes?: string;
}

/**
 * Construye el enlace wa.me con un ticket visualmente limpio, escaneable y con total dual (USD + Bs. BCV).
 * Mantiene los formatos exactos esperados por el vendedor para despacho rápido.
 */
export function buildWhatsAppOrderUrl(
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

	const encodedMessage = encodeURIComponent(lines.join("\n"));
	const cleanPhone = store.whatsappPhone.replace(/\D/g, "");
	return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
