import { computed, ref } from "vue";
import {
	resolveActiveStoreConfig,
	STORES_REGISTRY,
} from "@/config/stores.registry";
import { loadLocalSeedProducts } from "@/data/seeds.registry";
import { getDailyBcvRate } from "@/services/bcv.service";
import { createStoreRepository } from "@/services/database/repository.factory";
import type {
	BcvRateSnapshot,
	Product,
	StoreConfig,
} from "@/types/store.types";

const activeStore = ref<StoreConfig>(resolveActiveStoreConfig());
const products = ref<Product[]>([]);
const isLoading = ref<boolean>(true);
const isRefreshingBcv = ref<boolean>(false);
const loadError = ref<string | null>(null);
const displayCurrency = ref<"USD" | "VES">("USD");
const bcvSnapshot = ref<BcvRateSnapshot>({
	usd: activeStore.value.manualBcvRate ?? activeStore.value.fallbackBcvRate,
	effectiveDate: new Date().toISOString(),
	fetchedAt: Date.now(),
	source: "fallback",
});

/**
 * ES: Los tokens se aplican en la raíz para que toda la app adopte el tema de la tienda activa.
 * EN: Root-level tokens let the whole app use the active store's theme.
 * @param store ES: Configuración de la tienda activa. EN: Active store configuration.
 */
function applyStoreThemeToDocument(store: StoreConfig): void {
	const root = document.documentElement;
	root.setAttribute("data-theme", store.theme.colorScheme);
	root.style.setProperty("--brand-accent", store.theme.accentOklch);
	root.style.setProperty("--brand-on-accent", store.theme.onAccentOklch);
	root.style.setProperty("--brand-highlight", store.theme.highlightOklch);
	root.style.setProperty("--radius-control", store.theme.controlRadius);
	root.style.setProperty("--radius-card", store.theme.cardRadius);
	document.title = `${store.name} — Catálogo Digital`;
}

async function bootstrapStore(targetStore?: StoreConfig): Promise<void> {
	if (targetStore) {
		activeStore.value = targetStore;
	}

	isLoading.value = true;
	loadError.value = null;
	applyStoreThemeToDocument(activeStore.value);

	try {
		const repo = createStoreRepository(
			activeStore.value.dataSource,
			loadLocalSeedProducts,
		);
		const [rate, catalog] = await Promise.all([
			getDailyBcvRate(
				activeStore.value.fallbackBcvRate,
				false,
				activeStore.value.manualBcvRate,
			),
			repo.getProducts(),
		]);
		bcvSnapshot.value = rate;
		products.value = catalog;
	} catch (err) {
		loadError.value =
			err instanceof Error ? err.message : "Error cargando catálogo";
	} finally {
		isLoading.value = false;
	}
}

async function refreshBcvRate(): Promise<void> {
	if (isRefreshingBcv.value) return;
	isRefreshingBcv.value = true;

	try {
		bcvSnapshot.value = await getDailyBcvRate(
			activeStore.value.fallbackBcvRate,
			true,
			activeStore.value.manualBcvRate,
		);
	} finally {
		isRefreshingBcv.value = false;
	}
}

/**
 * ES: Cambia la tienda de demo sin recargar y actualiza `?tienda=` en la URL.
 * EN: Switches the demo store without reloading and updates `?tienda=` in the URL.
 * @param slug ES: Clave de la tienda en `STORES_REGISTRY`. EN: Store key in `STORES_REGISTRY`.
 */
async function switchStoreDemo(slug: string): Promise<void> {
	const nextStore = STORES_REGISTRY[slug];
	if (!nextStore || nextStore.slug === activeStore.value.slug) return;

	const url = new URL(window.location.href);
	url.searchParams.set("tienda", slug);
	window.history.pushState({}, "", url.toString());

	if ("startViewTransition" in document) {
		(
			document as Document & {
				startViewTransition: (cb: () => Promise<void>) => void;
			}
		).startViewTransition(() => bootstrapStore(nextStore));
	} else {
		await bootstrapStore(nextStore);
	}
}

export function useStore() {
	const categories = computed(() => {
		const unique = new Set(products.value.map((p) => p.category));
		return ["Todo", ...Array.from(unique)];
	});

	function toggleCurrency(): void {
		displayCurrency.value = displayCurrency.value === "USD" ? "VES" : "USD";
	}

	return {
		activeStore,
		products,
		categories,
		isLoading,
		isRefreshingBcv,
		loadError,
		displayCurrency,
		bcvSnapshot,
		availableDemoStores: Object.values(STORES_REGISTRY),
		bootstrapStore,
		refreshBcvRate,
		switchStoreDemo,
		toggleCurrency,
	};
}