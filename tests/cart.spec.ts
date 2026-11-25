import { beforeEach, describe, expect, it } from "vitest";
import { resolveVariantUnitPrice, useCart } from "@/composables/useCart";
import type { Product, ProductVariant } from "@/types/store.types";

const SINGLE_VARIANT: ProductVariant = {
	id: "single",
	label: "Sencilla",
	stock: 10,
};

const COMBO_VARIANT: ProductVariant = {
	id: "combo",
	label: "Combo +$3.50",
	stock: 3,
	priceDeltaUsd: 3.5,
};

const OUT_OF_STOCK_VARIANT: ProductVariant = {
	id: "agotada",
	label: "Edición Limitada",
	stock: 0,
};

const BURGER_PRODUCT: Product = {
	id: "bu-smash-01",
	sku: "BU-01",
	name: "La Caracas Smash",
	subtitle: "Pan Brioche",
	category: "Burgers",
	priceUsd: 8.5,
	images: ["/burger.webp"],
	description: "Smash burger doble.",
	variantLabel: "Tamaño",
	variants: [SINGLE_VARIANT, COMBO_VARIANT, OUT_OF_STOCK_VARIANT],
};

describe("Carrito Reactivo Multi-Variante (useCart)", () => {
	beforeEach(() => {
		localStorage.clear();
		const { clearCart } = useCart();
		clearCart();
	});

	it("separa el mismo producto si cambia la variante y aplica priceDeltaUsd", () => {
		const { addItem, items, subtotalUsd, totalItemsCount } = useCart();

		const addedSingle = addItem(BURGER_PRODUCT, SINGLE_VARIANT, 1);
		const addedCombo = addItem(BURGER_PRODUCT, COMBO_VARIANT, 2);

		expect(addedSingle).toBe(true);
		expect(addedCombo).toBe(true);
		expect(items.value).toHaveLength(2);
		expect(totalItemsCount.value).toBe(3);
		expect(resolveVariantUnitPrice(BURGER_PRODUCT, COMBO_VARIANT)).toBe(12);
		expect(subtotalUsd.value).toBe(32.5);
	});

	it("impide agregar variantes sin stock y limita la cantidad al inventario disponible", () => {
		const { addItem, items } = useCart();

		expect(addItem(BURGER_PRODUCT, OUT_OF_STOCK_VARIANT, 1)).toBe(false);
		expect(items.value).toHaveLength(0);

		addItem(BURGER_PRODUCT, COMBO_VARIANT, 99);
		expect(items.value[0]?.quantity).toBe(3);
	});
});
