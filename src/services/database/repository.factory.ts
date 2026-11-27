import type { DataSourceConfig, Product } from "@/types/store.types";

export interface IStoreRepository {
	getProducts(): Promise<Product[]>;
}

/**
 * ES: Lee un CSV publicado desde Google Sheets. Columnas, en este orden: `id,sku,name,subtitle,category,badge,priceUsd,images,description,variantLabel,variants`.
 * EN: Reads a published Google Sheets CSV. Columns, in order: `id,sku,name,subtitle,category,badge,priceUsd,images,description,variantLabel,variants`.
 * ES: `images` usa `|` como separador; `variants` sigue el formato `S:5|M:10|L:2`.
 * EN: `images` uses `|` as a separator; `variants` follows the `S:5|M:10|L:2` format.
 * @param csvUrl ES: URL pública de exportación CSV. EN: Public CSV export URL.
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
 * ES: Consulta el endpoint `GET /products` de una API REST, como FastAPI o Supabase.
 * EN: Reads the `GET /products` endpoint from a REST API, such as FastAPI or Supabase.
 * @param baseUrl ES: URL base sin barra final. EN: Base URL without a trailing slash.
 * @param apiKey ES: Clave opcional enviada en las cabeceras. EN: Optional key sent in the request headers.
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
 * ES: Elige Sheets, REST o datos locales según la tienda. El loader local se ejecuta bajo demanda.
 * EN: Selects Sheets, REST, or local data for the store. The local loader runs on demand.
 * @param source ES: Configuración del origen de datos. EN: Data source configuration.
 * @param localLoader ES: Carga las semillas locales cuando hacen falta. EN: Loads local seed data only when needed.
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
