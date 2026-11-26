import type { BcvRateSnapshot } from "@/types/store.types";

const CACHE_KEY = "snap_catalogo_bcv_rate_v2";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos para reflejar cambios vespertinos del BCV
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
 * Selecciona la tasa más protectora y actualizada entre proveedores concurrentes.
 * Prioriza la tasa oficial más alta cuando hay desfase de sincronización entre APIs.
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
 * Obtiene la tasa BCV oficial diaria mediante consenso concurrente + caché de 30 min.
 * @param fallbackRate Tasa de emergencia si no hay red ni caché.
 * @param forceRefresh Ignora caché local para consultar en vivo.
 * @param manualOverride Tasa fija opcional configurada directamente por el comercio.
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
			// Silencioso en modo incógnito restringido
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
