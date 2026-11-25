/**
 * Tipo de origen de datos soportado por cada tienda cliente.
 */
export type DataSourceConfig =
	| { type: "local"; seedKey: string }
	| { type: "sheets"; csvUrl: string }
	| { type: "api"; baseUrl: string; apiKey?: string };

/**
 * Tokens de identidad visual inyectables por tienda sin recompilar el CSS.
 */
export interface StoreThemeTokens {
	accentOklch: string;
	onAccentOklch: string;
	highlightOklch: string;
	controlRadius: "0px" | "0.5rem" | "9999px";
	cardRadius: "0px" | "0.75rem" | "1.25rem";
	colorScheme: "light" | "dark";
}

/**
 * Opción para la pantalla de entrada opcional (ej. Hombre / Mujer).
 */
export interface EntryGateOption {
	id: string;
	label: string;
	filterCategory: string;
	imageUrl: string;
}

/**
 * Configuración maestra de una tienda cliente.
 */
export interface StoreConfig {
	slug: string;
	name: string;
	tagline: string;
	logoSvgPath: string;
	whatsappPhone: string;
	cityLabel: string;
	zonePlaceholder: string;
	notesPlaceholder: string;
	fallbackBcvRate: number;
	paymentMethods: string[];
	deliveryModes: Array<"Delivery" | "Pick-up">;
	enableEntryGate: boolean;
	entryGateOptions?: EntryGateOption[];
	theme: StoreThemeTokens;
	dataSource: DataSourceConfig;
}

/**
 * Variante seleccionable de un producto (talla, sabor, presentación o color).
 */
export interface ProductVariant {
	id: string;
	label: string; // Ej: "S", "M", "L", "Vainilla 2lb"
	stock: number;
	priceDeltaUsd?: number;
}

/**
 * Producto normalizado independientemente de la base de datos origen.
 */
export interface Product {
	id: string;
	sku: string;
	name: string;
	subtitle: string; // Ej: "Slim Fit · Negro" o "24g Proteína · 30 Serv."
	category: string; // Ej: "Hombre", "Mujer", "Suplementos"
	badge?: string; // Ej: "NEW", "TOP", "-15%"
	priceUsd: number;
	images: string[]; // Índice 0 es la portada 4:5; resto galería estilo WHOOP
	description: string;
	variantLabel: string; // Ej: "Talla" o "Sabor"
	variants: ProductVariant[];
}

/**
 * Ítem único en el carrito identificado por producto + variante.
 */
export interface CartItem {
	key: string; // `${productId}::${variantId}`
	productId: string;
	name: string;
	image: string;
	variantId: string;
	variantLabel: string;
	unitPriceUsd: number;
	quantity: number;
}

/**
 * Registro estructurado de la tasa oficial del BCV.
 */
export interface BcvRateSnapshot {
	usd: number;
	eur?: number;
	effectiveDate: string;
	fetchedAt: number;
	source: "dolarapi" | "cromstudio" | "cache" | "fallback";
}
