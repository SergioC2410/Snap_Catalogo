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
const loadError = ref<string | null>(null);
const displayCurrency = ref<"USD" | "VES">("USD");
const bcvSnapshot = ref<BcvRateSnapshot>({
	usd: activeStore.value.fallbackBcvRate,
	effectiveDate: new Date().toISOString(),
	fetchedAt: Date.now(),
	source: "fallback",
});

/**
 * Aplica los tokens OKLCH, radios y esquema de color de la tienda en el DOM raíz.
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

/**
 * Inicializa la tienda activa, descarga la tasa BCV y carga el inventario desde el adaptador.
 */
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
			getDailyBcvRate(activeStore.value.fallbackBcvRate),
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

/**
 * Permite cambiar de tienda demo en vivo (útil para presentaciones comerciales)
 * utilizando View Transitions API y sincronizando la URL sin recargar.
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
		loadError,
		displayCurrency,
		bcvSnapshot,
		availableDemoStores: Object.values(STORES_REGISTRY),
		bootstrapStore,
		switchStoreDemo,
		toggleCurrency,
	};
}
