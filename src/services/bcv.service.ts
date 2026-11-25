import type { BcvRateSnapshot } from "@/types/store.types";

const CACHE_KEY = "snap_catalogo_bcv_rate_v1";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas
const REQUEST_TIMEOUT_MS = 5000;

interface DolarApiResponse {
	promedio?: number;
	precio?: number;
	fechaActualizacion?: string;
}

interface CromStudioResponse {
	fecha_valor?: string;
	tasas?: {
		USD?: number;
		EUR?: number;
	};
}

/**
 * Ejecuta fetch con timeout estricto para evitar bloqueos en redes móviles lentas.
 * @param url Endpoint JSON a consultar.
 * @param timeoutMs Milisegundos máximos de espera.
 */
async function fetchWithTimeout<T>(
	url: string,
	timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<T> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { Accept: "application/json" },
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} al consultar ${url}`);
		}
		return (await response.json()) as T;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Valida que la tasa recibida sea un número finito y coherente antes de operar dinero.
 */
function isValidRate(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value > 1;
}

/**
 * Lee la tasa almacenada en localStorage si existe y es estructuralmente válida.
 */
function readCachedRate(): BcvRateSnapshot | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as BcvRateSnapshot;
		return isValidRate(parsed.usd) ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * Obtiene la tasa BCV oficial diaria con estrategia cache-first + fallback en cascada.
 * @param fallbackRate Tasa de emergencia definida en la configuración de la tienda.
 * @param forceRefresh Ignora el TTL de caché para forzar consulta fresca.
 * @returns Instantánea validada de la tasa BCV lista para cálculos financieros.
 */
export async function getDailyBcvRate(
	fallbackRate: number,
	forceRefresh = false,
): Promise<BcvRateSnapshot> {
	const cached = readCachedRate();
	const now = Date.now();

	if (!forceRefresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
		return { ...cached, source: "cache" };
	}

	// Proveedor 1: DolarApi Venezuela (BCV Oficial)
	try {
		const data = await fetchWithTimeout<DolarApiResponse>(
			"https://ve.dolarapi.com/v1/dolares/oficial",
		);
		const rate = data.promedio ?? data.precio;
		if (isValidRate(rate)) {
			const snapshot: BcvRateSnapshot = {
				usd: Number(rate.toFixed(4)),
				effectiveDate: data.fechaActualizacion ?? new Date().toISOString(),
				fetchedAt: now,
				source: "dolarapi",
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
			return snapshot;
		}
	} catch {
		// Silencioso: continúa al siguiente proveedor de respaldo
	}

	// Proveedor 2: Crom Studio (API pública BCV con USD y EUR)
	try {
		const data = await fetchWithTimeout<CromStudioResponse>(
			"https://datos.cromstudio.com.ve/tasa",
		);
		if (isValidRate(data.tasas?.USD)) {
			const snapshot: BcvRateSnapshot = {
				usd: Number(data.tasas.USD.toFixed(4)),
				eur: isValidRate(data.tasas.EUR)
					? Number(data.tasas.EUR.toFixed(4))
					: undefined,
				effectiveDate: data.fecha_valor ?? new Date().toISOString(),
				fetchedAt: now,
				source: "cromstudio",
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
			return snapshot;
		}
	} catch {
		// Silencioso: cae a caché vencida o valor de respaldo
	}

	if (cached) {
		return { ...cached, source: "cache" };
	}

	return {
		usd: fallbackRate,
		effectiveDate: new Date().toISOString(),
		fetchedAt: now,
		source: "fallback",
	};
}
