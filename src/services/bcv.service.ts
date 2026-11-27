import type { BcvRateSnapshot } from "@/types/store.types";

const CACHE_KEY = "snap_catalogo_bcv_rate_v2";
const CACHE_TTL_MS = 30 * 60 * 1000; // ES: Se renueva cada 30 min porque la tasa puede cambiar durante el día. / EN: Refresh every 30 min because the rate can change during the day.
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
 * ES: Corta la petición si la red tarda demasiado, para que la carga no quede esperando.
 * EN: Aborts slow requests so the app does not stay stuck waiting for the network.
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

function isValidRate(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value > 1;
}

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

async function fetchDolarApi(now: number): Promise<BcvRateSnapshot> {
	const data = await fetchWithTimeout<DolarApiResponse>(
		"https://ve.dolarapi.com/v1/dolares/oficial",
	);
	const rate = data.promedio ?? data.precio;
	if (!isValidRate(rate)) {
		throw new Error("Tasa inválida desde DolarApi");
	}

	return {
		usd: Number(rate.toFixed(4)),
		effectiveDate: data.fechaActualizacion ?? new Date(now).toISOString(),
		fetchedAt: now,
		source: "dolarapi",
	};
}

async function fetchCromStudio(now: number): Promise<BcvRateSnapshot> {
	const data = await fetchWithTimeout<CromStudioResponse>(
		"https://datos.cromstudio.com.ve/tasa",
	);
	if (!isValidRate(data.tasas?.USD)) {
		throw new Error("Tasa inválida desde CromStudio");
	}

	return {
		usd: Number(data.tasas.USD.toFixed(4)),
		eur: isValidRate(data.tasas.EUR)
			? Number(data.tasas.EUR.toFixed(4))
			: undefined,
		effectiveDate: data.fecha_valor ?? new Date(now).toISOString(),
		fetchedAt: now,
		source: "cromstudio",
	};
}

/**
 * ES: Si las APIs devuelven tasas distintas, se queda con la más alta.
 * EN: If the APIs return different rates, this keeps the highest one.
 */
function pickFreshestSnapshot(
	candidates: BcvRateSnapshot[],
): BcvRateSnapshot | null {
	if (candidates.length === 0) return null;
	return candidates.reduce((best, current) =>
		current.usd > best.usd ? current : best,
	);
}

/**
 * ES: Consulta dos fuentes a la vez y guarda la tasa elegida durante 30 min; si fallan, usa caché o fallback.
 * EN: Checks two sources in parallel and caches the selected rate for 30 min; if they fail, it uses cache or fallback.
 * @param fallbackRate ES: Tasa para cuando no hay red ni caché. EN: Rate used when there is no network or cache.
 * @param forceRefresh ES: Fuerza la consulta y omite la caché vigente. EN: Forces a request and skips the current cache.
 * @param manualOverride ES: Tasa fija configurada por la tienda. EN: Fixed rate configured by the store.
 */
export async function getDailyBcvRate(
	fallbackRate: number,
	forceRefresh = false,
	manualOverride?: number,
): Promise<BcvRateSnapshot> {
	const now = Date.now();

	if (isValidRate(manualOverride)) {
		return {
			usd: Number(manualOverride.toFixed(4)),
			effectiveDate: new Date(now).toISOString(),
			fetchedAt: now,
			source: "fallback",
		};
	}

	const cached = readCachedRate();
	if (!forceRefresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
		return { ...cached, source: "cache" };
	}

	const results = await Promise.allSettled([
		fetchDolarApi(now),
		fetchCromStudio(now),
	]);
	const validSnapshots: BcvRateSnapshot[] = [];

	for (const res of results) {
		if (res.status === "fulfilled") {
			validSnapshots.push(res.value);
		}
	}

	const best = pickFreshestSnapshot(validSnapshots);
	if (best) {
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify(best));
		} catch {
			// ES: Ignora el fallo si el navegador bloquea localStorage. / EN: Ignore the error when the browser blocks localStorage.
		}
		return best;
	}

	if (cached) {
		return { ...cached, source: "cache" };
	}

	return {
		usd: fallbackRate,
		effectiveDate: new Date(now).toISOString(),
		fetchedAt: now,
		source: "fallback",
	};
}
