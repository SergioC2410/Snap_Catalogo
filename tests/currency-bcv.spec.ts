import { describe, expect, it } from "vitest";
import type { CartItem, StoreConfig } from "@/types/store.types";
import { convertUsdToVes, formatVes } from "@/utils/currency";
import { buildWhatsAppOrderUrl } from "@/utils/whatsapp";

describe("Conversión USD/Bs. y Ticket WhatsApp", () => {
	it("calcula bolívares con precisión de 2 decimales sin desvío binario", () => {
		expect(convertUsdToVes(19.99, 100.5)).toBe(2009);
		expect(formatVes(55125.97)).toContain("55.125,97");
	});

	it("genera un enlace wa.me válido con variantes y total dual", () => {
		const mockStore = {
			name: "Kinetix Lab",
			whatsappPhone: "+58 412-0000000",
		} as StoreConfig;

		const items: CartItem[] = [
			{
				key: "p1::m",
				productId: "p1",
				name: "Running 2 in 1 Shorts",
				image: "/shorts.webp",
				variantId: "m",
				variantLabel: "Talla M",
				unitPriceUsd: 58,
				quantity: 2,
			},
		];

		const url = buildWhatsAppOrderUrl(mockStore, items, 900, {
			customerName: "Sergio",
			deliveryMode: "Delivery",
			addressOrZone: "Chacao",
			paymentMethod: "Pago Móvil",
		});

		expect(url).toMatch(/^https:\/\/wa\.me\/584120000000\?text=/);
		expect(decodeURIComponent(url)).toContain(
			"2x Running 2 in 1 Shorts [Talla M]",
		);
		expect(decodeURIComponent(url)).toContain("$116.00");
	});
});
