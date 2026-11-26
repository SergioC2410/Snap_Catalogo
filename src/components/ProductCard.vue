<script setup lang="ts">
import { Heart, Minus, Plus, Trash2 } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import type { GridLayoutMode } from "@/components/FilterToolbar.vue";
import { resolveVariantUnitPrice } from "@/composables/useCart";
import type { Product, ProductVariant } from "@/types/store.types";
import { convertUsdToVes, formatUsd, formatVes } from "@/utils/currency";

const props = defineProps<{
	product: Product;
	layoutMode: GridLayoutMode;
	displayCurrency: "USD" | "VES";
	bcvRate: number;
	cartQuantities: Record<string, number>;
}>();

const emit = defineEmits<{
	openDetail: [product: Product, selectedVariant: ProductVariant];
	quickAdd: [product: Product, variant: ProductVariant];
	updateQuantity: [key: string, nextQuantity: number, maxStock: number];
}>();

/**
 * Selecciona por defecto la primera variante con stock disponible.
 */
function pickInitialVariant(
	variants: ProductVariant[],
): ProductVariant | undefined {
	return variants.find((v) => v.stock > 0) ?? variants[0];
}

const selectedVariant = ref<ProductVariant | undefined>(
	pickInitialVariant(props.product.variants),
);
const isFavorite = ref(false);

watch(
	() => props.product.id,
	() => {
		selectedVariant.value = pickInitialVariant(props.product.variants);
	},
);

function getVariantCartKey(variantId: string): string {
	return `${props.product.id}::${variantId}`;
}

function getVariantCartCount(variantId: string): number {
	return props.cartQuantities[getVariantCartKey(variantId)] ?? 0;
}

const activeCartQty = computed(() => {
	if (!selectedVariant.value) return 0;
	return getVariantCartCount(selectedVariant.value.id);
});

const activeUnitPriceUsd = computed(() => {
	if (!selectedVariant.value) return props.product.priceUsd;
	return resolveVariantUnitPrice(props.product, selectedVariant.value);
});

const activeUnitPriceVes = computed(() =>
	convertUsdToVes(activeUnitPriceUsd.value, props.bcvRate),
);

const primaryPriceLabel = computed(() =>
	props.displayCurrency === "USD"
		? formatUsd(activeUnitPriceUsd.value)
		: formatVes(activeUnitPriceVes.value),
);

const secondaryPriceLabel = computed(() =>
	props.displayCurrency === "USD"
		? formatVes(activeUnitPriceVes.value)
		: formatUsd(activeUnitPriceUsd.value),
);

function handleOpenDetail(): void {
	const variant = selectedVariant.value ?? props.product.variants[0];
	if (!variant) return;
	emit("openDetail", props.product, variant);
}

function handleQuickAdd(): void {
	const variant = selectedVariant.value;
	if (!variant || variant.stock <= 0) return;
	emit("quickAdd", props.product, variant);
}

function handleDecrement(): void {
	const variant = selectedVariant.value;
	if (!variant || activeCartQty.value <= 0) return;
	emit(
		"updateQuantity",
		getVariantCartKey(variant.id),
		activeCartQty.value - 1,
		variant.stock,
	);
}

function handleIncrement(): void {
	const variant = selectedVariant.value;
	if (!variant || activeCartQty.value >= variant.stock) return;
	emit(
		"updateQuantity",
		getVariantCartKey(variant.id),
		activeCartQty.value + 1,
		variant.stock,
	);
}
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-prod border border-line/80 bg-elevated transition-shadow hover:shadow-sm"
  >
    <!-- Fotografía fija 4:5 (CLS = 0) -->
    <div class="relative aspect-[4/5] w-full overflow-hidden bg-card">
      <button
        type="button"
        class="block size-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-accent"
        :aria-label="`Ver detalles de ${props.product.name}`"
        @click="handleOpenDetail"
      >
        <img
          :src="props.product.images[0]"
          :alt="props.product.name"
          class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </button>

      <span
        v-if="props.product.badge"
        class="pointer-events-none absolute bottom-2.5 left-2.5 rounded-sm bg-elevated/95 px-2 py-0.5 text-[10px] font-black tracking-wider text-ink uppercase shadow-xs"
      >
        {{ props.product.badge }}
      </span>

      <button
        type="button"
        class="tactile-btn absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-full bg-elevated/90 text-ink shadow-xs backdrop-blur-xs"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'"
        @click="isFavorite = !isFavorite"
      >
        <Heart
          class="size-4 transition-colors"
          :class="isFavorite ? 'fill-rose-500 text-rose-500' : 'text-ink'"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Cuerpo informativo y selector táctil de variantes -->
    <div class="flex flex-1 flex-col justify-between p-3 sm:p-4">
      <div>
        <button
          type="button"
          class="w-full cursor-pointer text-left"
          @click="handleOpenDetail"
        >
          <h2 class="line-clamp-1 text-sm font-bold text-ink sm:text-base">
            {{ props.product.name }}
          </h2>
          <p class="mt-0.5 line-clamp-1 text-xs text-muted">
            {{ props.product.subtitle }}
          </p>
        </button>

        <p
          v-if="props.layoutMode === 'editorial'"
          class="mt-2 line-clamp-2 text-xs leading-relaxed text-muted"
        >
          {{ props.product.description }}
        </p>

        <div class="price-tabular mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span class="text-sm font-black text-ink sm:text-base">
            {{ primaryPriceLabel }}
          </span>
          <span class="text-[11px] font-medium text-muted">
            {{ secondaryPriceLabel }}
          </span>
        </div>
      </div>

      <!-- Variantes + CTA reversible (Agregar ↔ Stepper táctil) -->
      <div class="mt-3 space-y-2.5">
        <div
          role="radiogroup"
          :aria-label="`Seleccionar ${props.product.variantLabel}`"
          class="flex flex-wrap gap-1.5"
        >
          <button
            v-for="variant in props.product.variants"
            :key="variant.id"
            type="button"
            role="radio"
            :aria-checked="selectedVariant?.id === variant.id"
            :disabled="variant.stock <= 0"
            class="tactile-btn relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-ctrl border px-2.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through"
            :class="
              selectedVariant?.id === variant.id
                ? 'border-accent bg-accent text-on-accent'
                : 'border-line bg-card text-ink hover:border-accent'
            "
            @click="selectedVariant = variant"
          >
            <span>{{ variant.label }}</span>
            <span
              v-if="getVariantCartCount(variant.id) > 0"
              class="price-tabular inline-flex size-4 items-center justify-center rounded-full bg-highlight text-[10px] font-black text-neutral-950"
            >
              {{ getVariantCartCount(variant.id) }}
            </span>
          </button>
        </div>

        <!-- Stepper en línea cuando la variante activa ya está en el carrito -->
        <div
          v-if="activeCartQty > 0 && selectedVariant"
          class="flex min-h-11 items-center justify-between rounded-ctrl border-2 border-accent bg-card p-0.5"
          role="group"
          :aria-label="`Cantidad en pedido para ${props.product.name} ${selectedVariant.label}`"
        >
          <button
            type="button"
            class="tactile-btn inline-flex size-10 items-center justify-center rounded-ctrl bg-elevated text-ink hover:text-rose-600"
            :aria-label="
              activeCartQty === 1
                ? `Quitar ${props.product.name} del pedido`
                : `Restar una unidad de ${props.product.name}`
            "
            @click="handleDecrement"
          >
            <Trash2 v-if="activeCartQty === 1" class="size-4" aria-hidden="true" />
            <Minus v-else class="size-4" aria-hidden="true" />
          </button>

          <span class="price-tabular text-xs font-black text-ink">
            {{ activeCartQty }}<span class="hidden sm:inline"> en pedido</span>
          </span>

          <button
            type="button"
            :disabled="activeCartQty >= selectedVariant.stock"
            class="tactile-btn inline-flex size-10 items-center justify-center rounded-ctrl bg-accent text-on-accent disabled:opacity-40"
            :aria-label="`Sumar otra unidad de ${props.product.name}`"
            @click="handleIncrement"
          >
            <Plus class="size-4" aria-hidden="true" />
          </button>
        </div>

        <!-- Botón inicial cuando aún no está en el carrito -->
        <button
          v-else
          type="button"
          :disabled="!selectedVariant || selectedVariant.stock <= 0"
          class="tactile-btn inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-ctrl bg-accent px-3 text-xs font-extrabold tracking-wide text-on-accent uppercase disabled:opacity-40"
          @click="handleQuickAdd"
        >
          <Plus class="size-4" aria-hidden="true" />
          <span>Agregar</span>
        </button>
      </div>
    </div>
  </article>
</template>