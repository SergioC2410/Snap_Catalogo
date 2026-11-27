import { computed, ref, watch } from "vue";
import { useStore } from "@/composables/useStore";
import type { CartItem, Product, ProductVariant } from "@/types/store.types";
import { convertUsdToVes } from "@/utils/currency";

const STORAGE_PREFIX = "snap_cart_v1_";

const items = ref<CartItem[]>([]);
const lastAnnouncement = ref<string>("");
let initializedSlug: string | null = null;

function buildCartKey(productId: string, variantId: string): string {
	return `${productId}::${variantId}`;
}

/**
 * ES: Aplica el ajuste de la variante en centavos para evitar sumar precios con decimales binarios.
 * EN: Applies the variant adjustment in cents to avoid adding floating-point prices.
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
 * ES: Si faltan datos, el JSON no es válido o el almacenamiento está bloqueado, empieza con el carrito vacío.
 * EN: If data is missing, JSON is invalid, or storage is blocked, the cart starts empty.
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
 * ES: Un fallo de localStorage no debe interrumpir el carrito, por ejemplo, en navegación privada.
 * EN: A localStorage failure must not interrupt cart actions, such as in private browsing.
 */
function persistCartToStorage(slug: string, cartItems: CartItem[]): void {
	try {
		localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(cartItems));
	} catch {
		// ES: No interrumpas la acción si el navegador bloquea el almacenamiento. / EN: Do not interrupt the action when the browser blocks storage.
	}
}

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
	 * ES: Rechaza cantidades inválidas o variantes agotadas y nunca supera el stock disponible.
	 * EN: Rejects invalid quantities or sold-out variants and never exceeds available stock.
	 * @returns ES: `true` si agregó unidades; `false` si no había stock o la cantidad no era válida. EN: `true` when items were added; `false` when stock or quantity is invalid.
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
	 * ES: Una cantidad de 0 o menos elimina el ítem; `maxStock` limita la cantidad al inventario.
	 * EN: A quantity of 0 or less removes the item; `maxStock` caps it at available inventory.
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

	function removeItem(key: string): void {
		updateQuantity(key, 0);
	}

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
