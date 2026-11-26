import type { Product } from "@/types/store.types";

const KINETIX_PRODUCTS: Product[] = [
	// ==================== HOMBRE ====================
	{
		id: "kx-men-gilet",
		sku: "KX-HM-101",
		name: "Thermal Running Gilet",
		subtitle: "Slim Fit · Cortaviento Ultraligero",
		category: "Hombre",
		badge: "TOP VENTAS",
		priceUsd: 55,
		images: ["/stores/kinetix/men-gilet-01.webp"],
		description:
			"Chaleco térmico de alto rendimiento resistente al viento con paneles transpirables en espalda y bolsillos laterales con cierre.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 5 },
			{ id: "m", label: "M", stock: 10 },
			{ id: "l", label: "L", stock: 7 },
			{ id: "xl", label: "XL", stock: 3 },
		],
	},
	{
		id: "kx-men-shorts",
		sku: "KX-HM-102",
		name: "2-in-1 Performance Gym Shorts",
		subtitle: "Regular Fit · Malla Interna de Compresión",
		category: "Hombre",
		badge: "NEW",
		priceUsd: 38,
		images: ["/stores/kinetix/men-shorts-01.webp"],
		description:
			"Short deportivo de doble capa con licra interna de soporte muscular, secado rápido y bolsillo oculto para teléfono.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 6 },
			{ id: "m", label: "M", stock: 12 },
			{ id: "l", label: "L", stock: 8 },
			{ id: "xl", label: "XL", stock: 0 },
		],
	},
	{
		id: "kx-men-tshirt",
		sku: "KX-HM-103",
		name: "Essential Oversize Training Tee",
		subtitle: "Algodón Elastano · Corte Atlético",
		category: "Hombre",
		badge: "NEW",
		priceUsd: 28,
		images: [
			"/stores/kinetix/men-tshirt-01.webp",
			"/stores/kinetix/men-tshirt-02.webp",
			"/stores/kinetix/men-tshirt-03.webp",
			"/stores/kinetix/men-tshirt-04.webp",
		],
		description:
			"Franela de entrenamiento con caída estructurada en hombros y tejido elástico de cuatro direcciones que no pierde forma tras el lavado.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 8 },
			{ id: "m", label: "M", stock: 14 },
			{ id: "l", label: "L", stock: 10 },
			{ id: "xl", label: "XL", stock: 4 },
		],
	},
	{
		id: "kx-men-set-blk",
		sku: "KX-HM-104",
		name: "Pro Tracksuit Set Obsidian Black",
		subtitle: "Conjunto Completo · Tejido Técnico",
		category: "Hombre",
		badge: "EDICIÓN PRO",
		priceUsd: 68,
		images: [
			"/stores/kinetix/men-set-black-01.webp",
			"/stores/kinetix/men-set-black-02.webp",
		],
		description:
			"Conjunto deportivo monocromático en negro mate con control de humedad y ajuste ergonómico para entrenamiento o uso urbano.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 4 },
			{ id: "m", label: "M", stock: 9 },
			{ id: "l", label: "L", stock: 6 },
		],
	},
	{
		id: "kx-men-set-wht",
		sku: "KX-HM-105",
		name: "Pro Tracksuit Set Cloud White",
		subtitle: "Conjunto Completo · Edición Contrast",
		category: "Hombre",
		priceUsd: 68,
		images: [
			"/stores/kinetix/men-set-white-01.webp",
			"/stores/kinetix/men-set-white-02.webp",
		],
		description:
			"Conjunto deportivo en blanco glacial con acabado suave al tacto y costuras reforzadas de alta movilidad.",
		variantLabel: "Talla",
		variants: [
			{ id: "s", label: "S", stock: 5 },
			{ id: "m", label: "M", stock: 8 },
			{ id: "l", label: "L", stock: 5 },
		],
	},

	// ==================== MUJER ====================
	{
		id: "kx-women-set",
		sku: "KX-WM-201",
		name: "Studio Sculpt Seamless Set",
		subtitle: "Conjunto 2 Piezas · Compresión Media",
		category: "Mujer",
		badge: "TOP VENTAS",
		priceUsd: 58,
		images: [
			"/stores/kinetix/women-set-01.webp",
			"/stores/kinetix/women-set-02.webp",
			"/stores/kinetix/women-set-03.webp",
			"/stores/kinetix/women-set-04.webp",
		],
		description:
			"Conjunto sin costuras de cintura alta y soporte estructurado, tejido opaco a prueba de sentadillas y secado ultrarrápido.",
		variantLabel: "Talla",
		variants: [
			{ id: "xs", label: "XS", stock: 6 },
			{ id: "s", label: "S", stock: 12 },
			{ id: "m", label: "M", stock: 9 },
			{ id: "l", label: "L", stock: 4 },
		],
	},
	{
		id: "kx-women-leggings",
		sku: "KX-WM-202",
		name: "Aura High-Waist Neutral Leggings",
		subtitle: "Tiro Alto · Efecto Segunda Piel",
		category: "Mujer",
		badge: "NEW",
		priceUsd: 42,
		images: [
			"/stores/kinetix/women-leggings-01.webp",
			"/stores/kinetix/women-leggings-02.webp",
		],
		description:
			"Leggings deportivos de tiro alto sin costura frontal con elasticidad en cuatro direcciones y sujeción firme en cintura.",
		variantLabel: "Talla",
		variants: [
			{ id: "xs", label: "XS", stock: 5 },
			{ id: "s", label: "S", stock: 11 },
			{ id: "m", label: "M", stock: 8 },
			{ id: "l", label: "L", stock: 3 },
		],
	},
	{
		id: "kx-women-bra",
		sku: "KX-WM-203",
		name: "Apex Seamless Sports Bra",
		subtitle: "Soporte Medio · Espalda Atlética",
		category: "Mujer",
		priceUsd: 32,
		images: [
			"/stores/kinetix/women-bra-01.webp",
			"/stores/kinetix/women-bra-02.webp",
		],
		description:
			"Top deportivo sin costuras con almohadillas extraíbles y banda inferior elástica de máximo confort.",
		variantLabel: "Talla",
		variants: [
			{ id: "xs", label: "XS", stock: 5 },
			{ id: "s", label: "S", stock: 10 },
			{ id: "m", label: "M", stock: 8 },
			{ id: "l", label: "L", stock: 4 },
		],
	},

	// ==================== SUPLEMENTOS ====================
	{
		id: "kx-whey-01",
		sku: "KX-SP-301",
		name: "Isolate Whey Protein 2lb",
		subtitle: "25g Proteína · 30 Servicios · 0g Azúcar",
		category: "Suplementos",
		badge: "BESTSELLER",
		priceUsd: 48,
		images: ["/stores/kinetix/whey-01.webp", "/stores/kinetix/whey-02.webp"],
		description:
			"Proteína aislada de suero de rápida absorción con perfil completo de aminoácidos esenciales y enzimas digestivas.",
		variantLabel: "Sabor",
		variants: [
			{ id: "choc", label: "Chocolate Suizo", stock: 12 },
			{ id: "vain", label: "Vainilla Bourbon", stock: 9 },
			{ id: "cookies", label: "Cookies & Cream", stock: 5 },
		],
	},

	// ==================== ACCESORIOS ====================
	{
		id: "kx-shaker-blk",
		sku: "KX-AC-401",
		name: "Pro Shaker Matte Black 700ml",
		subtitle: "Libre de BPA · Rejilla Mezcladora",
		category: "Accesorios",
		badge: "NEW",
		priceUsd: 14,
		images: [
			"/stores/kinetix/shaker-black-01.webp",
			"/stores/kinetix/shaker-black-02.webp",
		],
		description:
			"Vaso mezclador hermético en acabado negro mate con escala grabada en mililitros y tapa a prueba de fugas.",
		variantLabel: "Capacidad",
		variants: [
			{ id: "700ml", label: "700 ml", stock: 15 },
			{ id: "900ml", label: "900 ml XL +$3.00", stock: 7, priceDeltaUsd: 3 },
		],
	},
	{
		id: "kx-shaker-wht",
		sku: "KX-AC-402",
		name: "Pro Shaker Arctic White 700ml",
		subtitle: "Acabado Minimal · Cierre Hermético",
		category: "Accesorios",
		priceUsd: 14,
		images: [
			"/stores/kinetix/shaker-white-01.webp",
			"/stores/kinetix/shaker-white-02.webp",
		],
		description:
			"Vaso mezclador minimalista en blanco puro con boquilla ergonómica y asa integrada para transporte en bolso.",
		variantLabel: "Capacidad",
		variants: [
			{ id: "700ml", label: "700 ml", stock: 11 },
			{ id: "900ml", label: "900 ml XL +$3.00", stock: 6, priceDeltaUsd: 3 },
		],
	},
	{
		id: "kx-shaker-bw",
		sku: "KX-AC-403",
		name: "Pro Shaker Monochrome Duo",
		subtitle: "Edición Contrast · 700ml",
		category: "Accesorios",
		badge: "LIMITADO",
		priceUsd: 15,
		images: ["/stores/kinetix/shaker-bw-01.webp"],
		description:
			"Edición bicolor blanco y negro con interior redondeado de fácil limpieza que evita acumulación de residuos.",
		variantLabel: "Presentación",
		variants: [
			{ id: "unit", label: "Unidad 700ml", stock: 9 },
			{ id: "duo", label: "Pack x2 +$12.00", stock: 4, priceDeltaUsd: 12 },
		],
	},
	{
		id: "kx-straps-01",
		sku: "KX-AC-404",
		name: "Heavy-Duty Lifting Straps",
		subtitle: "Algodón Reforzado · Acolchado Neopreno",
		category: "Accesorios",
		badge: "ESENCIAL",
		priceUsd: 16,
		images: ["/stores/kinetix/lifting-straps-01.webp"],
		description:
			"Correas de agarre de alta resistencia con soporte acolchado en muñeca para peso muerto, remos y dominadas pesadas.",
		variantLabel: "Talla",
		variants: [
			{ id: "std", label: "Estándar (Par)", stock: 14 },
			{
				id: "pro",
				label: "Pro Largas 60cm +$2.00",
				stock: 8,
				priceDeltaUsd: 2,
			},
		],
	},
];

const BRASA_URBANA_PRODUCTS: Product[] = [
	{
		id: "bu-smash-01",
		sku: "BU-BG-01",
		name: "La Caracas Smash",
		subtitle: "Pan Brioche · Cheddar Fundido · Salsa Secreta",
		category: "Burgers",
		badge: "TOP VENTAS",
		priceUsd: 8.5,
		images: ["/stores/brasa/smash-burger.webp"],
		description:
			"Carne 100% res madurada sellada a la plancha con bordes crujientes, queso cheddar americano, pepinillos y salsa de la casa.",
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
				label: "Combo Papas + Bebida +$3.50",
				stock: 50,
				priceDeltaUsd: 3.5,
			},
		],
	},
	{
		id: "bu-cheese-02",
		sku: "BU-BG-02",
		name: "Gourmet Double Cheddar",
		subtitle: "Doble Carne · Doble Queso · Cebolla Caramelizada",
		category: "Burgers",
		badge: "CHEF PICK",
		priceUsd: 10.0,
		images: [
			"/stores/brasa/cheeseburger-01.webp",
			"/stores/brasa/cheeseburger-02.webp",
		],
		description:
			"Dos medallones jugosos a la parrilla cubiertos con doble lámina de cheddar madurado, cebolla caramelizada y pan brioche tostado.",
		variantLabel: "Opción",
		variants: [
			{ id: "solo", label: "Solo Burger", stock: 45 },
			{
				id: "combo",
				label: "Combo Papas + Bebida +$3.50",
				stock: 45,
				priceDeltaUsd: 3.5,
			},
		],
	},
	{
		id: "bu-bacon-03",
		sku: "BU-BG-03",
		name: "Smoky Bacon BBQ",
		subtitle: "Tocineta Ahumada · Aros Crispy · Salsa BBQ",
		category: "Burgers",
		badge: "NEW",
		priceUsd: 11.0,
		images: ["/stores/brasa/bacon-bbq.webp"],
		description:
			"Doble carne bañada en reducción de BBQ artesanal, tiras de tocineta crocante, cheddar y cebolla crispy.",
		variantLabel: "Opción",
		variants: [
			{ id: "solo", label: "Solo Burger", stock: 40 },
			{
				id: "combo",
				label: "Combo Papas + Bebida +$3.50",
				stock: 40,
				priceDeltaUsd: 3.5,
			},
		],
	},
	{
		id: "bu-fries-classic",
		sku: "BU-AC-01",
		name: "Papas Fritas Clásicas",
		subtitle: "Corte Bastón · Sal Marina · Extra Crujientes",
		category: "Acompañantes",
		priceUsd: 3.5,
		images: ["/stores/brasa/fries-classic.webp"],
		description:
			"Papas doradas al momento con toque de sal marina y salsa tártara o ketchup de la casa.",
		variantLabel: "Porción",
		variants: [
			{ id: "personal", label: "Personal", stock: 40 },
			{ id: "grande", label: "Grande +$2.00", stock: 40, priceDeltaUsd: 2.0 },
		],
	},
	{
		id: "bu-fries-loaded",
		sku: "BU-AC-02",
		name: "Papas Brasa Cargadas",
		subtitle: "Crema Cheddar · Tocineta · Cebollín",
		category: "Acompañantes",
		badge: "PARA COMPARTIR",
		priceUsd: 6.0,
		images: ["/stores/brasa/fries-loaded.webp"],
		description:
			"Porción generosa de papas crujientes bañadas en queso cheddar fundido, lluvia de tocineta ahumada y cebollín fresco.",
		variantLabel: "Porción",
		variants: [
			{ id: "mediana", label: "Mediana", stock: 30 },
			{
				id: "familiar",
				label: "Familiar +$3.00",
				stock: 30,
				priceDeltaUsd: 3.0,
			},
		],
	},
	{
		id: "bu-coke-orig",
		sku: "BU-BD-01",
		name: "Coca-Cola Original",
		subtitle: "Lata 355ml · Bien Fría",
		category: "Bebidas",
		priceUsd: 2.0,
		images: ["/stores/brasa/coca-cola.webp"],
		description: "Refresco Coca-Cola Original servido bien frío.",
		variantLabel: "Presentación",
		variants: [
			{ id: "lata", label: "Lata 355ml", stock: 60 },
			{
				id: "1.5l",
				label: "Botella 1.5L +$1.50",
				stock: 30,
				priceDeltaUsd: 1.5,
			},
		],
	},
	{
		id: "bu-coke-light",
		sku: "BU-BD-02",
		name: "Coca-Cola Light / Sin Azúcar",
		subtitle: "Lata 355ml · Cero Calorías",
		category: "Bebidas",
		priceUsd: 2.0,
		images: ["/stores/brasa/coca-cola-light.webp"],
		description: "Coca-Cola Light refrescante sin azúcar añadida.",
		variantLabel: "Presentación",
		variants: [
			{ id: "lata", label: "Lata 355ml", stock: 50 },
			{
				id: "1.5l",
				label: "Botella 1.5L +$1.50",
				stock: 25,
				priceDeltaUsd: 1.5,
			},
		],
	},
	{
		id: "bu-pepsi-orig",
		sku: "BU-BD-03",
		name: "Pepsi Original",
		subtitle: "Lata 355ml · Bien Fría",
		category: "Bebidas",
		priceUsd: 1.8,
		images: ["/stores/brasa/pepsi.webp"],
		description: "Refresco Pepsi Original servido a temperatura ideal.",
		variantLabel: "Presentación",
		variants: [
			{ id: "lata", label: "Lata 355ml", stock: 60 },
			{
				id: "1.5l",
				label: "Botella 1.5L +$1.40",
				stock: 30,
				priceDeltaUsd: 1.4,
			},
		],
	},
	{
		id: "bu-pepsi-zero",
		sku: "BU-BD-04",
		name: "Pepsi Zero Azúcar",
		subtitle: "Lata 355ml · Cero Azúcar",
		category: "Bebidas",
		priceUsd: 1.8,
		images: ["/stores/brasa/pepsi-zero.webp"],
		description: "Todo el sabor de Pepsi sin azúcar.",
		variantLabel: "Presentación",
		variants: [{ id: "lata", label: "Lata 355ml", stock: 50 }],
	},
	{
		id: "bu-7up",
		sku: "BU-BD-05",
		name: "7UP Lima-Limón",
		subtitle: "Lata 355ml · Refrescante",
		category: "Bebidas",
		priceUsd: 1.8,
		images: ["/stores/brasa/7up.webp"],
		description: "Bebida burbujeante sabor lima-limón bien fría.",
		variantLabel: "Presentación",
		variants: [{ id: "lata", label: "Lata 355ml", stock: 50 }],
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
