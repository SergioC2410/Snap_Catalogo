import type { Product } from "@/types/store.types";

const KINETIX_PRODUCTS: Product[] = [
	{
		id: "kx-short-01",
		sku: "KX-SH-201",
		name: "Running 2 in 1 Shorts",
		subtitle: "Regular Fit · Unit Green",
		category: "Hombre",
		badge: "NEW",
		priceUsd: 58,
		images: [
			"https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
			"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Short deportivo de doble capa con malla interna de compresión ligera y bolsillo lateral oculto para teléfono.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 6 },
			{ id: "m", label: "M", stock: 12 },
			{ id: "l", label: "L", stock: 8 },
			{ id: "xl", label: "XL", stock: 0 },
		],
	},
	{
		id: "kx-gilet-02",
		sku: "KX-GL-104",
		name: "Thermal Running Gilet",
		subtitle: "Slim Fit · Carbon Black",
		category: "Hombre",
		badge: "TOP",
		priceUsd: 60,
		images: [
			"https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Chaleco térmico ultraligero resistente al viento con paneles transpirables en espalda.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 4 },
			{ id: "m", label: "M", stock: 9 },
			{ id: "l", label: "L", stock: 5 },
		],
	},
	{
		id: "kx-set-03",
		sku: "KX-WM-301",
		name: "Seamless Sculpt Set",
		subtitle: "High Support · Sage Stone",
		category: "Mujer",
		badge: "NEW",
		priceUsd: 64,
		images: [
			"https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Conjunto sin costuras de secado rápido y compresión media diseñado para entrenamiento funcional y pesas.",
		variantLabel: "Talla",
		variants: [
			{ id: "xs", label: "XS", stock: 5 },
			{ id: "s", label: "S", stock: 10 },
			{ id: "m", label: "M", stock: 7 },
		],
	},
	{
		id: "kx-whey-04",
		sku: "KX-SP-501",
		name: "Isolate Whey Protein 2lb",
		subtitle: "25g Proteína · 0g Azúcar Añadida",
		category: "Suplementos",
		badge: "BESTSELLER",
		priceUsd: 48,
		images: [
			"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Proteína aislada de suero de rápida absorción con enzimas digestivas. 30 servicios por envase.",
		variantLabel: "Sabor",
		variants: [
			{ id: "choc", label: "Chocolate Suizo", stock: 14 },
			{ id: "vain", label: "Vainilla Bourbon", stock: 9 },
			{ id: "cookies", label: "Cookies & Cream", stock: 4 },
		],
	},
];

const BRASA_URBANA_PRODUCTS: Product[] = [
	{
		id: "bu-smash-01",
		sku: "BU-BG-01",
		name: "La Caracas Smash",
		subtitle: "Pan Brioche · Salsa Secreta · Pepinillos",
		category: "Burgers",
		badge: "TOP VENTAS",
		priceUsd: 8.5,
		images: [
			"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Carne 100% res madurada sellada a la plancha con bordes crujientes, queso cheddar americano fundido y salsa de la casa.",
		variantLabel: "Tamaño",
		variants: [
			{ id: "single", label: "Sencilla (140g)", stock: 50 },
			{
				id: "doble",
				label: "Doble (280g) +$2.50",
				stock: 50,
				priceDeltaUsd: 2.5,
			},
			{
				id: "combo",
				label: "Combo Papas + Refresco +$3.50",
				stock: 50,
				priceDeltaUsd: 3.5,
			},
		],
	},
	{
		id: "bu-bacon-02",
		sku: "BU-BG-02",
		name: "Smoky Bacon BBQ",
		subtitle: "Tocineta Ahumada · Cebolla Crispy",
		category: "Burgers",
		badge: "NEW",
		priceUsd: 10.5,
		images: [
			"https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Doble smash burger bañada en reducción de BBQ artesanal, tiras de tocineta crocante y aros de cebolla.",
		variantLabel: "Opción",
		variants: [
			{ id: "solo", label: "Solo Burger", stock: 40 },
			{
				id: "combo",
				label: "Con Papas Trufadas +$3.00",
				stock: 40,
				priceDeltaUsd: 3.0,
			},
		],
	},
	{
		id: "bu-fries-03",
		sku: "BU-AC-01",
		name: "Papas Brasa Cargadas",
		subtitle: "Cheddar Fundido · Tocineta · Cebollín",
		category: "Acompañantes",
		priceUsd: 5.5,
		images: [
			"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Porción generosa de papas crujientes bañadas en crema de cheddar real y lluvia de tocineta.",
		variantLabel: "Porción",
		variants: [
			{ id: "personal", label: "Personal", stock: 30 },
			{
				id: "compartir",
				label: "Para Compartir +$3.00",
				stock: 30,
				priceDeltaUsd: 3.0,
			},
		],
	},
	{
		id: "bu-drink-04",
		sku: "BU-BD-01",
		name: "Coca-Cola Cero / Refresco",
		subtitle: "Lata 355ml · Bien Fría",
		category: "Bebidas",
		priceUsd: 2.0,
		images: [
			"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
		],
		description:
			"Bebida gaseosa servida a temperatura óptima para acompañar tu pedido.",
		variantLabel: "Sabor",
		variants: [
			{ id: "coke-zero", label: "Coca-Cola Cero", stock: 60 },
			{ id: "coke-orig", label: "Coca-Cola Original", stock: 60 },
			{ id: "chinotto", label: "Chinotto", stock: 40 },
		],
	},
];

/**
 * Carga perezosa de catálogos semilla locales.
 */
export async function loadLocalSeedProducts(
	seedKey: string,
): Promise<Product[]> {
	if (seedKey === "brasa-urbana") {
		return BRASA_URBANA_PRODUCTS;
	}
	return KINETIX_PRODUCTS;
}
