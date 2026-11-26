<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import BrandSplash from "@/components/BrandSplash.vue";
import CheckoutDialog from "@/components/CheckoutDialog.vue";
import EntryGate from "@/components/EntryGate.vue";
import FilterToolbar, {
	type GridLayoutMode,
} from "@/components/FilterToolbar.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import ProductCard from "@/components/ProductCard.vue";
import ProductDetailDialog from "@/components/ProductDetailDialog.vue";
import StickyCartBar from "@/components/StickyCartBar.vue";
import { useCart } from "@/composables/useCart";
import { useStore } from "@/composables/useStore";
import type { Product, ProductVariant } from "@/types/store.types";
import { filterAndSortProducts, type SortOption } from "@/utils/search";

const {
	activeStore,
	products,
	categories,
	isLoading,
	loadError,
	displayCurrency,
	bcvSnapshot,
	availableDemoStores,
	bootstrapStore,
	refreshBcvRate,
	switchStoreDemo,
	toggleCurrency,
} = useStore();

const {
	items: cartItems,
	totalItemsCount,
	subtotalUsd,
	subtotalVes,
	lastAnnouncement,
	addItem,
	updateQuantity,
	removeItem,
	clearCart,
} = useCart();

const showSplash = ref(true);
const dismissedGates = ref<Record<string, boolean>>({});
const searchQuery = ref("");
const activeCategory = ref("Todo");
const layoutMode = ref<GridLayoutMode>("grid");
const sortBy = ref<SortOption>("featured");

const detailProduct = ref<Product | null>(null);
const detailInitialVariant = ref<ProductVariant | null>(null);
const isCheckoutOpen = ref(false);

onMounted(() => {
	void bootstrapStore();
});

watch(
	() => activeStore.value.slug,
	() => {
		searchQuery.value = "";
		activeCategory.value = "Todo";
		sortBy.value = "featured";
		detailProduct.value = null;
		detailInitialVariant.value = null;
		isCheckoutOpen.value = false;
	},
);

const shouldShowEntryGate = computed(() => {
	const store = activeStore.value;
	if (!store.enableEntryGate) return false;
	return !dismissedGates.value[store.slug];
});

const visibleProducts = computed(() =>
	filterAndSortProducts(products.value, {
		query: searchQuery.value,
		category: activeCategory.value,
		sortBy: sortBy.value,
	}),
);

/**
 * Índice O(1) de cantidades por clave compuesta (`productId::variantId`)
 * para alimentar el stepper reversible de cada ProductCard sin recalcular en bucle.
 */
const cartQuantityByKey = computed<Record<string, number>>(() => {
	const map: Record<string, number> = {};
	for (const item of cartItems.value) {
		map[item.key] = item.quantity;
	}
	return map;
});

async function handleSwitchStore(slug: string): Promise<void> {
	if (slug === activeStore.value.slug) return;
	showSplash.value = true;
	await switchStoreDemo(slug);
}

function handleGateSelect(category: string): void {
	activeCategory.value = category;
	dismissedGates.value = {
		...dismissedGates.value,
		[activeStore.value.slug]: true,
	};
}

function handleOpenDetail(product: Product, variant: ProductVariant): void {
	detailProduct.value = product;
	detailInitialVariant.value = variant;
}

function handleCloseDetail(): void {
	detailProduct.value = null;
	detailInitialVariant.value = null;
}

function handleQuickAdd(product: Product, variant: ProductVariant): void {
	addItem(product, variant, 1);
}

function handleDetailAdd(
	product: Product,
	variant: ProductVariant,
	quantity: number,
): void {
	addItem(product, variant, quantity);
}

function handleBuyNow(
	product: Product,
	variant: ProductVariant,
	quantity: number,
): void {
	addItem(product, variant, quantity);
	handleCloseDetail();
	isCheckoutOpen.value = true;
}

function resetFilters(): void {
	searchQuery.value = "";
	activeCategory.value = "Todo";
	sortBy.value = "featured";
}
</script>

<template>
  <BrandSplash
    v-if="showSplash"
    :key="activeStore.slug"
    :store="activeStore"
    @done="showSplash = false"
  />

  <EntryGate
    v-if="shouldShowEntryGate"
    :store="activeStore"
    :demo-stores="availableDemoStores"
    @select="handleGateSelect"
    @switch-store="handleSwitchStore"
  />

  <div v-else class="min-h-dvh bg-canvas pb-28 text-ink">
<HeaderBar
      v-model:search-query="searchQuery"
      :store="activeStore"
      :demo-stores="availableDemoStores"
      :bcv-snapshot="bcvSnapshot"
      :display-currency="displayCurrency"
      @toggle-currency="toggleCurrency"
      @switch-store="handleSwitchStore"
      @refresh-bcv="refreshBcvRate"
    />

    <main>
      <FilterToolbar
        v-model:active-category="activeCategory"
        v-model:layout-mode="layoutMode"
        v-model:sort-by="sortBy"
        :categories="categories"
        :results-count="visibleProducts.length"
      />

      <section aria-label="Listado de productos" class="mx-auto max-w-5xl px-4 py-3">
        <div
          v-if="isLoading"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="n in 4"
            :key="n"
            class="aspect-[4/5] animate-pulse rounded-prod bg-card"
          />
        </div>

        <div
          v-else-if="loadError"
          role="alert"
          class="rounded-prod border border-rose-500/30 bg-rose-500/10 p-6 text-center"
        >
          <p class="text-sm font-bold text-ink">No se pudo cargar el inventario</p>
          <p class="mt-1 text-xs text-muted">{{ loadError }}</p>
          <button
            type="button"
            class="tactile-btn mt-4 min-h-11 rounded-ctrl bg-accent px-5 text-xs font-bold text-on-accent uppercase"
            @click="bootstrapStore()"
          >
            Reintentar
          </button>
        </div>

        <div
          v-else-if="visibleProducts.length === 0"
          class="rounded-prod border border-dashed border-line bg-card/50 px-4 py-12 text-center"
        >
          <p class="text-sm font-bold text-ink">No encontramos productos con ese filtro</p>
          <p class="mt-1 text-xs text-muted">
            Prueba con otra palabra clave o vuelve a ver todo el catálogo.
          </p>
          <button
            type="button"
            class="tactile-btn mt-4 min-h-11 rounded-ctrl bg-accent px-5 text-xs font-bold text-on-accent uppercase"
            @click="resetFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <div
          v-else
          class="grid gap-3 sm:gap-4"
          :class="
            layoutMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'mx-auto max-w-lg grid-cols-1'
          "
        >
          <ProductCard
            v-for="product in visibleProducts"
            :key="product.id"
            :product="product"
            :layout-mode="layoutMode"
            :display-currency="displayCurrency"
            :bcv-rate="bcvSnapshot.usd"
            :cart-quantities="cartQuantityByKey"
            @open-detail="handleOpenDetail"
            @quick-add="handleQuickAdd"
            @update-quantity="updateQuantity"
          />
        </div>
      </section>
    </main>

    <StickyCartBar
      :total-items-count="totalItemsCount"
      :subtotal-usd="subtotalUsd"
      :subtotal-ves="subtotalVes"
      :display-currency="displayCurrency"
      :announcement="lastAnnouncement"
      @open-checkout="isCheckoutOpen = true"
    />

    <ProductDetailDialog
      :product="detailProduct"
      :initial-variant="detailInitialVariant"
      :display-currency="displayCurrency"
      :bcv-rate="bcvSnapshot.usd"
      @close="handleCloseDetail"
      @add-to-cart="handleDetailAdd"
      @buy-now="handleBuyNow"
    />

    <CheckoutDialog
      :open="isCheckoutOpen"
      :store="activeStore"
      :items="cartItems"
      :subtotal-usd="subtotalUsd"
      :subtotal-ves="subtotalVes"
      :bcv-rate="bcvSnapshot.usd"
      @close="isCheckoutOpen = false"
      @update-quantity="updateQuantity"
      @remove-item="removeItem"
      @clear-cart="clearCart"
    />
  </div>
</template>