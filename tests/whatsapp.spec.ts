import { describe, expect, it } from "vitest";
import type { CartItem, StoreConfig } from "@/types/store.types";
import { buildWhatsAppOrderUrl } from "@/utils/whatsapp";

describe("Generador de Tickets WhatsApp Multi-Rubro", () => {
	const baseStore = {
		name: "Brasa Urbana",
		whatsappPhone: "584149998877",
	} as StoreConfig;

	it("incluye notas adicionales y diferencia variantes del mismo producto", () => {
		const items: CartItem[] = [
			{
				key: "burger-1::doble",
				productId: "burger-1",
				name: "Smash Classic",
				image: "/burger.webp",
				variantId: "doble",
				variantLabel: "Doble Carne + Queso",
				unitPriceUsd: 9.5,
				quantity: 1,
			},
			{
				key: "burger-1::triple",
				productId: "burger-1",
				name: "Smash Classic",
				image: "/burger.webp",
				variantId: "triple",
				variantLabel: "Triple + Tocineta",
				unitPriceUsd: 12,
				quantity: 2,
			},
		];

		const url = buildWhatsAppOrderUrl(baseStore, items, 920, {
			customerName: "Sergio",
			deliveryMode: "Pick-up",
			paymentMethod: "Zinli",
			notes: "Sin cebolla en la doble",
		});

		const decoded = decodeURIComponent(url);
		expect(decoded).toContain("BRASA URBANA");
		expect(decoded).toContain("1x Smash Classic [Doble Carne + Queso]");
		expect(decoded).toContain("2x Smash Classic [Triple + Tocineta]");
		expect(decoded).toContain("$33.50");
		expect(decoded).toContain("Nota: Sin cebolla en la doble");
	});
});
