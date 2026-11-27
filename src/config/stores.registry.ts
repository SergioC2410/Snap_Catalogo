import type { StoreConfig } from "@/types/store.types";

/**
 * Registro central de tiendas demostración y clientes.
 * Cada entrada define su identidad OKLCH, reglas de negocio y fuente de BD.
 */
export const STORES_REGISTRY: Record<string, StoreConfig> = {
	kinetix: {
		slug: "kinetix",
		name: "KINETIX LAB",
		tagline: "Performance Apparel & Supplements",
		logoSvgPath: "/stores/kinetix/logo.svg",
		whatsappPhone: "584120000000",
		cityLabel: "Envíos Hoy · Caracas",
		zonePlaceholder: "Ej. Chacao, Torre X / Punto de referencia",
		notesPlaceholder: "Ej. Color preferido o talla alterna si se agota",
		notesVisibility: "single-item",
		fallbackBcvRate: 926.3,
		paymentMethods: ["Pago Móvil", "Zinli", "Binance Pay", "Efectivo USD"],
		deliveryModes: ["Delivery", "Pick-up"],
		enableEntryGate: true,
		entryGateOptions: [
			{
				id: "hombre",
				label: "HOMBRE",
				filterCategory: "Hombre",
				iconSvgPath: "/stores/kinetix/icon-men.svg",
			},
			{
				id: "mujer",
				label: "MUJER",
				filterCategory: "Mujer",
				iconSvgPath: "/stores/kinetix/icon-women.svg",
			},
			{
				id: "suplementos",
				label: "SUPLEMENTOS",
				filterCategory: "Suplementos",
				iconSvgPath: "/stores/kinetix/icon-supplements.svg",
			},
			{
				id: "accesorios",
				label: "ACCESORIOS",
				filterCategory: "Accesorios",
				iconSvgPath: "/stores/kinetix/icon-accessories.svg",
			},
		],
		theme: {
			accentOklch: "oklch(0.18 0.012 260)",
			onAccentOklch: "oklch(0.985 0.004 95)",
			highlightOklch: "oklch(0.89 0.21 124)",
			controlRadius: "9999px",
			cardRadius: "0.75rem",
			colorScheme: "light",
		},
		dataSource: {
			type: "local",
			seedKey: "kinetix",
		},
	},

	"brasa-urbana": {
		slug: "brasa-urbana",
		name: "BRASA URBANA",
		tagline: "Smash Burgers & Street Grill · Caracas",
		logoSvgPath: "/stores/brasa/logo.svg",
		whatsappPhone: "584120000000",
		cityLabel: "Delivery Express 35 min · Caracas",
		zonePlaceholder: "Ej. Altamira, Res. X, Piso 3 / Punto de referencia",
		notesPlaceholder: "Ej. Sin cebolla / Salsa aparte / Avisar al llegar",
		notesVisibility: "always",
		fallbackBcvRate: 926.3,
		paymentMethods: ["Pago Móvil", "Binance Pay", "Zelle", "Efectivo USD"],
		deliveryModes: ["Delivery", "Pick-up"],
		enableEntryGate: false,
		theme: {
			accentOklch: "oklch(0.58 0.22 32)",
			onAccentOklch: "oklch(0.99 0.005 95)",
			highlightOklch: "oklch(0.76 0.17 75)",
			controlRadius: "0.5rem",
			cardRadius: "1.25rem",
			colorScheme: "dark",
		},
		dataSource: {
			type: "local",
			seedKey: "brasa-urbana",
		},
	},
};

export const DEFAULT_STORE_SLUG = "kinetix";

const DEFAULT_STORE = STORES_REGISTRY[DEFAULT_STORE_SLUG] as StoreConfig;

/**
 * Resuelve la configuración de tienda leyendo el parámetro `?tienda=<slug>` de la URL.
 */
export function resolveActiveStoreConfig(): StoreConfig {
	const params = new URLSearchParams(window.location.search);
	const requestedSlug =
		params.get("tienda")?.toLowerCase().trim() ?? DEFAULT_STORE_SLUG;
	return STORES_REGISTRY[requestedSlug] ?? DEFAULT_STORE;
}
