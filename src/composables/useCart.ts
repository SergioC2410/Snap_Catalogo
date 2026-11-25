import { computed, ref, watch } from "vue";
import { useStore } from "@/composables/useStore";
import type { CartItem, Product, ProductVariant } from "@/types/store.types";
import { convertUsdToVes } from "@/utils/currency";

const STORAGE_PREFIX = "snap_cart_v1_";

const items = ref<CartItem[]>([]);
const lastAnnouncement = ref<string>("");
let initializedSlug: string | null = null;

/**
 * Genera la clave compuesta única para diferenciar el mismo producto con distinta variante.
 */
function buildCartKey(productId: string, variantId: string): string {
	return `${productId}::${variantId}`;
}

/**
 * Calcula el precio unitario efectivo contemplando recargos por variante (ej. combos o extras).
 */
export function resolveVariantUnitPrice(
	product: Product,
	variant: ProductVariant,
): number {
	const baseCents = Math.round(product.priceUsd * 100);
	const deltaCents = Math.round((variant.priceDeltaUsd ?? 0) * 100);
	return (baseCents + deltaCents) / 100;
}

/**
 * Lee y valida de forma defensiva el carrito persistido para un slug específico.
 */
function loadCartFromStorage(slug: string): CartItem[] {
	try {
		const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
	} catch {
		return [];
	}
}

/**
 * Persiste el carrito de la tienda activa en localStorage sin lanzar excepciones en modo privado.
 */
function persistCartToStorage(slug: string, cartItems: CartItem[]): void {
	try {
		localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(cartItems));
	} catch {
		// Silencioso en entornos con almacenamiento restringido
	}
}

/**
 * Composable reactivo del carrito de compras aislado por tienda y variante.
 */
export function useCart() {
	const { activeStore, bcvSnapshot } = useStore();

	const syncWithActiveStore = (slug: string): void => {
		if (initializedSlug === slug) return;
		initializedSlug = slug;
		items.value = loadCartFromStorage(slug);
	};

	syncWithActiveStore(activeStore.value.slug);

	watch(
		() => activeStore.value.slug,
		(newSlug) => {
			syncWithActiveStore(newSlug);
		},
	);

	const totalItemsCount = computed(() =>
		items.value.reduce((acc, item) => acc + item.quantity, 0),
	);

	const subtotalUsd = computed(() => {
		const totalCents = items.value.reduce(
			(acc, item) => acc + Math.round(item.unitPriceUsd * 100) * item.quantity,
			0,
		);
		return totalCents / 100;
	});

	const subtotalVes = computed(() =>
		convertUsdToVes(subtotalUsd.value, bcvSnapshot.value.usd),
	);

	/**
	 * Agrega una unidad (o la cantidad indicada) de un producto+variante respetando stock.
	 * @returns true si se agregó correctamente; false si la variante está agotada.
	 */
	function addItem(
		product: Product,
		variant: ProductVariant,
		quantity = 1,
	): boolean {
		if (variant.stock <= 0 || quantity <= 0) {
			return false;
		}

		const key = buildCartKey(product.id, variant.id);
		const existing = items.value.find((item) => item.key === key);
		const unitPriceUsd = resolveVariantUnitPrice(product, variant);

		if (existing) {
			const nextQty = Math.min(existing.quantity + quantity, variant.stock);
			existing.quantity = nextQty;
			existing.unitPriceUsd = unitPriceUsd;
		} else {
			items.value.push({
				key,
				productId: product.id,
				name: product.name,
				image: product.images[0] ?? "",
				variantId: variant.id,
				variantLabel: `${product.variantLabel}: ${variant.label}`,
				unitPriceUsd,
				quantity: Math.min(quantity, variant.stock),
			});
		}

		lastAnnouncement.value = `${product.name} (${variant.label}) agregado al pedido.`;
		persistCartToStorage(activeStore.value.slug, items.value);
		return true;
	}

	/**
	 * Actualiza la cantidad exacta de un ítem; si llega a 0 lo elimina del carrito.
	 * @param key Clave compuesta `${productId}::${variantId}`.
	 * @param nextQuantity Nueva cantidad solicitada.
	 * @param maxStock Límite opcional de stock disponible.
	 */
	function updateQuantity(
		key: string,
		nextQuantity: number,
		maxStock?: number,
	): void {
		const index = items.value.findIndex((item) => item.key === key);
		if (index === -1) return;

		if (nextQuantity <= 0) {
			const [removed] = items.value.splice(index, 1);
			lastAnnouncement.value = removed
				? `${removed.name} eliminado del pedido.`
				: "";
		} else {
			const target = items.value[index];
			if (!target) return;
			target.quantity =
				maxStock !== undefined
					? Math.min(nextQuantity, maxStock)
					: nextQuantity;
		}

		persistCartToStorage(activeStore.value.slug, items.value);
	}

	/**
	 * Elimina un ítem específico del carrito.
	 */
	function removeItem(key: string): void {
		updateQuantity(key, 0);
	}

	/**
	 * Vacía por completo el carrito de la tienda activa.
	 */
	function clearCart(): void {
		items.value = [];
		lastAnnouncement.value = "Pedido vaciado.";
		persistCartToStorage(activeStore.value.slug, items.value);
	}

	return {
		items,
		totalItemsCount,
		subtotalUsd,
		subtotalVes,
		lastAnnouncement,
		addItem,
		updateQuantity,
		removeItem,
		clearCart,
	};
}
