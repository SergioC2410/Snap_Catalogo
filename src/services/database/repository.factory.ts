import type { DataSourceConfig, Product } from "@/types/store.types";

/**
 * Contrato unificado que debe cumplir cualquier origen de datos de una tienda.
 */
export interface IStoreRepository {
	getProducts(): Promise<Product[]>;
}

/**
 * Crea un repositorio conectado a un Google Sheet publicado como CSV ("Publicar en la web").
 * Columnas esperadas: id,sku,name,subtitle,category,badge,priceUsd,images,description,variantLabel,variants
 * Formato multi-valor: 'images' separadas por '|' y 'variants' en formato 'S:5|M:10|L:2'.
 * @param csvUrl URL pública de exportación CSV de Google Sheets.
 */
function createGoogleSheetsRepository(csvUrl: string): IStoreRepository {
	return {
		async getProducts(): Promise<Product[]> {
			const response = await fetch(csvUrl);
			if (!response.ok) {
				throw new Error("No se pudo cargar el catálogo desde Google Sheets");
			}

			const csvText = await response.text();
			const lines = csvText.trim().split(/\r?\n/).slice(1);

			return lines
				.filter((line) => line.trim().length > 0)
				.map((line) => {
					const cols = line
						.split(",")
						.map((c) => c.trim().replace(/^"|"$/g, ""));
					const [
						id,
						sku,
						name,
						subtitle,
						category,
						badge,
						priceUsd,
						imagesRaw,
						description,
						variantLabel,
						variantsRaw,
					] = cols;

					const resolvedId = id || crypto.randomUUID();

					const variants = (variantsRaw ?? "")
						.split("|")
						.filter(Boolean)
						.map((entry, idx) => {
							const [label, stockStr] = entry.split(":");
							return {
								id: `${resolvedId}-v${idx}`,
								label: label ?? "Única",
								stock: Number(stockStr ?? 1),
							};
						});

					return {
						id: resolvedId,
						sku: sku ?? "",
						name: name ?? "Producto sin nombre",
						subtitle: subtitle ?? "",
						category: category ?? "General",
						badge: badge || undefined,
						priceUsd: Number(priceUsd) || 0,
						images: (imagesRaw ?? "").split("|").filter(Boolean),
						description: description ?? "",
						variantLabel: variantLabel || "Opción",
						variants,
					};
				});
		},
	};
}

/**
 * Crea un repositorio conectado a un backend REST (FastAPI o Supabase REST API).
 * @param baseUrl URL base del servicio REST sin barra final.
 * @param apiKey Clave pública opcional para autenticación por cabecera.
 */
function createRestApiRepository(
	baseUrl: string,
	apiKey?: string,
): IStoreRepository {
	return {
		async getProducts(): Promise<Product[]> {
			const headers: Record<string, string> = { Accept: "application/json" };
			if (apiKey) {
				headers.apikey = apiKey;
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await fetch(`${baseUrl}/products`, { headers });
			if (!response.ok) {
				throw new Error(`Error API (${response.status}) al leer inventario`);
			}

			return (await response.json()) as Product[];
		},
	};
}

/**
 * Fábrica que instancia el repositorio adecuado según la configuración de la tienda activa.
 * @param source Configuración de origen de datos definida en stores.registry.ts.
 * @param localLoader Función perezosa (lazy import) para cargar semillas locales sin inflar el bundle.
 */
export function createStoreRepository(
	source: DataSourceConfig,
	localLoader: (seedKey: string) => Promise<Product[]>,
): IStoreRepository {
	switch (source.type) {
		case "sheets":
			return createGoogleSheetsRepository(source.csvUrl);
		case "api":
			return createRestApiRepository(source.baseUrl, source.apiKey);
		case "local":
		default:
			return {
				getProducts: () => localLoader(source.seedKey),
			};
	}
}
