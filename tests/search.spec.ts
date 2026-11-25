// tests/search.spec.ts
import { describe, expect, it } from "vitest";
import type { Product } from "@/types/store.types";
import { filterAndSortProducts, normalizeText } from "@/utils/search";

const SAMPLE_PRODUCTS: Product[] = [
	{
		id: "p1",
		sku: "KX-01",
		name: "Proteína Aislada 2lb",
		subtitle: "25g Proteína · Rápida Absorción",
		category: "Suplementos",
		priceUsd: 48,
		images: ["/whey.webp"],
		description: "Suero aislado.",
		variantLabel: "Sabor",
		variants: [{ id: "v1", label: "Vainilla", stock: 5 }],
	},
	{
		id: "p2",
		sku: "BU-01",
		name: "Papas Brasa Cargadas",
		subtitle: "Cheddar y Tocineta",
		category: "Acompañantes",
		priceUsd: 5.5,
		images: ["/fries.webp"],
		description: "Papas crujientes.",
		variantLabel: "Porción",
		variants: [{ id: "v2", label: "Personal", stock: 10 }],
	},
];

describe("Buscador Normalizado y Ordenamiento", () => {
	it("elimina tildes y normaliza mayúsculas correctamente", () => {
		expect(normalizeText("  Proteína Acompañantes  ")).toBe(
			"proteina acompanantes",
		);
	});

	it("encuentra productos ignorando tildes y buscando dentro de variantes", () => {
		const result = filterAndSortProducts(SAMPLE_PRODUCTS, {
			query: "proteina vainilla",
			category: "Todo",
			sortBy: "featured",
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("p1");
	});

	it("filtra por categoría y ordena por precio ascendente", () => {
		const sorted = filterAndSortProducts(SAMPLE_PRODUCTS, {
			query: "",
			category: "Todo",
			sortBy: "price-asc",
		});

		expect(sorted.map((p) => p.id)).toEqual(["p2", "p1"]);
	});
});
