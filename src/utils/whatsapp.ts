// src/utils/whatsapp.ts
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
 * Construye el enlace wa.me con el ticket estructurado y total dual (USD + Bs. BCV).
 * @param store Configuración de la tienda destino.
 * @param items Ítems en el carrito con variante explícita.
 * @param bcvRate Tasa BCV vigente aplicada al pedido.
 * @param order Datos de entrega y pago del comprador.
 */
export function buildWhatsAppOrderUrl(
	store: StoreConfig,
	items: CartItem[],
	bcvRate: number,
	order: OrderCheckoutData,
): string {
	const totalUsd = items.reduce(
		(acc, item) => acc + item.unitPriceUsd * item.quantity,
		0,
	);
	const totalVes = convertUsdToVes(totalUsd, bcvRate);

	const lines: string[] = [
		`*NUEVO PEDIDO — ${store.name.toUpperCase()}*`,
		`Cliente: ${order.customerName.trim()}`,
		`Modalidad: ${order.deliveryMode}${order.addressOrZone ? ` (${order.addressOrZone.trim()})` : ""}`,
		`Pago: ${order.paymentMethod}`,
		"",
		"*Detalle del pedido:*",
		...items.map(
			(item) =>
				`• ${item.quantity}x ${item.name} [${item.variantLabel}] — ${formatUsd(item.unitPriceUsd * item.quantity)}`,
		),
		"",
		`*Total USD:* ${formatUsd(totalUsd)}`,
		`*Ref. BCV (${bcvRate.toFixed(2)}):* ${formatVes(totalVes)}`,
	];

	if (order.notes?.trim()) {
		lines.push("", `Nota: ${order.notes.trim()}`);
	}

	const encodedMessage = encodeURIComponent(lines.join("\n"));
	const cleanPhone = store.whatsappPhone.replace(/\D/g, "");
	return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
