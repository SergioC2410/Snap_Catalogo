import { describe, expect, it } from "vitest";
import { STORES_REGISTRY } from "@/config/stores.registry";

describe("Integridad del Registro Multi-Tienda (White-Label)", () => {
	it("garantiza que cada tienda define placeholders propios y WhatsApp válido", () => {
		for (const store of Object.values(STORES_REGISTRY)) {
			expect(
				store.whatsappPhone.replace(/\D/g, "").length,
			).toBeGreaterThanOrEqual(10);
			expect(store.zonePlaceholder.trim().length).toBeGreaterThan(5);
			expect(store.notesPlaceholder.trim().length).toBeGreaterThan(5);
		}

		expect(
			STORES_REGISTRY.kinetix?.notesPlaceholder.toLowerCase(),
		).not.toContain("cebolla");
	});
});
