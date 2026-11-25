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
		whatsappPhone: "584120000001",
		cityLabel: "Envíos Hoy · Caracas",
		fallbackBcvRate: 920.0,
		paymentMethods: ["Pago Móvil", "Zinli", "Binance Pay", "Efectivo USD"],
		deliveryModes: ["Delivery", "Pick-up"],
		enableEntryGate: true,
		entryGateOptions: [
			{
				id: "hombre",
				label: "HOMBRE",
				filterCategory: "Hombre",
				imageUrl:
					"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
			},
			{
				id: "mujer",
				label: "MUJER",
				filterCategory: "Mujer",
				imageUrl:
					"https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
			},
			{
				id: "suplementos",
				label: "SUPLEMENTOS",
				filterCategory: "Suplementos",
				imageUrl:
					"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
			},
		],
		theme: {
			accentOklch: "oklch(0.18 0.012 260)",
			onAccentOklch: "oklch(0.985 0.004 95)",
			highlightOklch: "oklch(0.89 0.21 124)", // Lima técnico deportivo
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
		whatsappPhone: "584120000002",
		cityLabel: "Delivery Express 35 min · Caracas",
		fallbackBcvRate: 920.0,
		paymentMethods: ["Pago Móvil", "Binance Pay", "Zelle", "Efectivo USD"],
		deliveryModes: ["Delivery", "Pick-up"],
		enableEntryGate: false, // Entra directo al menú sin fricción
		theme: {
			accentOklch: "oklch(0.58 0.22 32)", // Naranja brasa / terracota intenso
			onAccentOklch: "oklch(0.99 0.005 95)",
			highlightOklch: "oklch(0.76 0.17 75)", // Ámbar tostado
			controlRadius: "0.5rem",
			cardRadius: "1.25rem",
			colorScheme: "dark", // Modo oscuro nocturno para comida rápida
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
