<script setup lang="ts">
import { Minus, Plus, ShoppingBag, X, Zap } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { resolveVariantUnitPrice } from "@/composables/useCart";
import type { Product, ProductVariant } from "@/types/store.types";
import { convertUsdToVes, formatUsd, formatVes } from "@/utils/currency";

const props = defineProps<{
	product: Product | null;
	initialVariant: ProductVariant | null;
	displayCurrency: "USD" | "VES";
	bcvRate: number;
}>();

const emit = defineEmits<{
	close: [];
	addToCart: [product: Product, variant: ProductVariant, quantity: number];
	buyNow: [product: Product, variant: ProductVariant, quantity: number];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const activeImageIndex = ref(0);
const selectedVariant = ref<ProductVariant | null>(null);
const quantity = ref(1);

watch(
	() => props.product,
	(nextProduct) => {
		const dialog = dialogRef.value;
		if (!dialog) return;

		if (nextProduct) {
			activeImageIndex.value = 0;
			selectedVariant.value =
				props.initialVariant ??
				nextProduct.variants.find((v) => v.stock > 0) ??
				nextProduct.variants[0] ??
				null;
			quantity.value = 1;

			if (!dialog.open) {
				dialog.showModal();
			}
		} else if (dialog.open) {
			dialog.close();
		}
	},
);

const maxStock = computed(() => Math.max(1, selectedVariant.value?.stock ?? 1));

const unitPriceUsd = computed(() => {
	if (!props.product) return 0;
	if (!selectedVariant.value) return props.product.priceUsd;
	return resolveVariantUnitPrice(props.product, selectedVariant.value);
});

const totalUsd = computed(
	() => Math.round(unitPriceUsd.value * 100 * quantity.value) / 100,
);
const totalVes = computed(() => convertUsdToVes(totalUsd.value, props.bcvRate));

const primaryPriceLabel = computed(() =>
	props.displayCurrency === "USD"
		? formatUsd(totalUsd.value)
		: formatVes(totalVes.value),
);

const secondaryPriceLabel = computed(() =>
	props.displayCurrency === "USD"
		? formatVes(totalVes.value)
		: formatUsd(totalUsd.value),
);

const activeImageUrl = computed(() => {
	if (!props.product) return "";
	return (
		props.product.images[activeImageIndex.value] ??
		props.product.images[0] ??
		""
	);
});

function selectVariant(variant: ProductVariant): void {
	selectedVariant.value = variant;
	if (quantity.value > variant.stock && variant.stock > 0) {
		quantity.value = variant.stock;
	}
}

function adjustQuantity(delta: number): void {
	const next = quantity.value + delta;
	if (next < 1 || next > maxStock.value) return;
	quantity.value = next;
}

function handleBackdropClick(event: MouseEvent): void {
	if (event.target === dialogRef.value) {
		emit("close");
	}
}

function handleAddToCart(): void {
	if (
		!props.product ||
		!selectedVariant.value ||
		selectedVariant.value.stock <= 0
	)
		return;
	emit("addToCart", props.product, selectedVariant.value, quantity.value);
	emit("close");
}

function handleBuyNow(): void {
	if (
		!props.product ||
		!selectedVariant.value ||
		selectedVariant.value.stock <= 0
	)
		return;
	emit("buyNow", props.product, selectedVariant.value, quantity.value);
}
</script>

<template>
  <dialog
    ref="dialogRef"
    aria-labelledby="product-detail-title"
    class="m-auto max-h-[92dvh] w-[min(100%-1.5rem,32rem)] overflow-hidden rounded-prod border border-line bg-elevated p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs"
    @cancel.prevent="emit('close')"
    @click="handleBackdropClick"
  >
    <div v-if="props.product" class="flex max-h-[92dvh] flex-col">
      <!-- Cabecera fija del modal -->
      <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div class="min-w-0">
          <p class="truncate text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            {{ props.product.category }} · {{ props.product.sku }}
          </p>
          <h2 id="product-detail-title" class="truncate text-sm font-black uppercase">
            {{ props.product.name }}
          </h2>
        </div>

        <button
          type="button"
          class="tactile-btn inline-flex size-11 shrink-0 items-center justify-center rounded-ctrl border border-line bg-card text-ink hover:border-accent"
          aria-label="Cerrar detalle del producto"
          @click="emit('close')"
        >
          <X class="size-5" aria-hidden="true" />
        </button>
      </header>

      <!-- Contenido desplazable -->
      <div class="flex-1 overflow-y-auto px-4 pt-4 pb-5">
        <div class="aspect-[4/5] w-full overflow-hidden rounded-prod bg-card">
          <img
            :src="activeImageUrl"
            :alt="props.product.name"
            class="size-full object-cover"
            decoding="async"
          />
        </div>

        <!-- Tira de miniaturas (estilo WHOOP) -->
        <div
          v-if="props.product.images.length > 1"
          class="mt-3 flex items-center gap-2 overflow-x-auto pb-1"
        >
          <button
            v-for="(img, idx) in props.product.images"
            :key="img"
            type="button"
            class="tactile-btn size-16 shrink-0 overflow-hidden rounded-md border-2 bg-card transition-colors"
            :class="idx === activeImageIndex ? 'border-accent' : 'border-transparent opacity-70'"
            :aria-label="`Ver imagen ${idx + 1} de ${props.product.name}`"
            @click="activeImageIndex = idx"
          >
            <img :src="img" :alt="`${props.product.name} vista ${idx + 1}`" class="size-full object-cover" />
          </button>
        </div>

        <div class="mt-4">
          <p class="text-xs font-medium text-muted">{{ props.product.subtitle }}</p>
          <div class="price-tabular mt-1.5 flex items-baseline gap-2.5">
            <span class="text-2xl font-black text-ink">{{ primaryPriceLabel }}</span>
            <span class="text-xs font-semibold text-muted">{{ secondaryPriceLabel }}</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ props.product.description }}
          </p>
        </div>

        <!-- Variantes + Cantidad -->
        <div class="mt-5 space-y-4">
          <div>
            <p class="text-xs font-bold tracking-wider text-ink uppercase">
              {{ props.product.variantLabel }}:
              <span class="text-muted">{{ selectedVariant?.label ?? '—' }}</span>
            </p>
            <div
              role="radiogroup"
              :aria-label="`Elegir ${props.product.variantLabel}`"
              class="mt-2 flex flex-wrap gap-2"
            >
              <button
                v-for="variant in props.product.variants"
                :key="variant.id"
                type="button"
                role="radio"
                :aria-checked="selectedVariant?.id === variant.id"
                :disabled="variant.stock <= 0"
                class="tactile-btn min-h-11 min-w-11 rounded-ctrl border px-3.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through"
                :class="
                  selectedVariant?.id === variant.id
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line bg-card text-ink hover:border-accent'
                "
                @click="selectVariant(variant)"
              >
                {{ variant.label }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between rounded-prod border border-line bg-card/60 px-3 py-2">
            <span class="text-xs font-bold tracking-wider text-ink uppercase">Cantidad</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="tactile-btn inline-flex size-11 items-center justify-center rounded-ctrl border border-line bg-elevated text-ink disabled:opacity-40"
                :disabled="quantity <= 1"
                aria-label="Disminuir cantidad"
                @click="adjustQuantity(-1)"
              >
                <Minus class="size-4" aria-hidden="true" />
              </button>
              <span class="price-tabular min-w-8 text-center text-sm font-black">
                {{ quantity }}
              </span>
              <button
                type="button"
                class="tactile-btn inline-flex size-11 items-center justify-center rounded-ctrl border border-line bg-elevated text-ink disabled:opacity-40"
                :disabled="quantity >= maxStock"
                aria-label="Aumentar cantidad"
                @click="adjustQuantity(1)"
              >
                <Plus class="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra inferior fija: Doble Acción Táctil (Pedir Ya / Agregar) -->
      <footer class="grid grid-cols-2 gap-2.5 border-t border-line bg-elevated p-4">
        <button
          type="button"
          :disabled="!selectedVariant || selectedVariant.stock <= 0"
          class="tactile-btn inline-flex min-h-12 items-center justify-center gap-1.5 rounded-ctrl border-2 border-accent bg-elevated px-3 text-xs font-black tracking-wide text-ink uppercase disabled:opacity-40"
          @click="handleBuyNow"
        >
          <Zap class="size-4" aria-hidden="true" />
          <span>Pedir Ya</span>
        </button>

        <button
          type="button"
          :disabled="!selectedVariant || selectedVariant.stock <= 0"
          class="tactile-btn inline-flex min-h-12 items-center justify-center gap-1.5 rounded-ctrl bg-accent px-3 text-xs font-black tracking-wide text-on-accent uppercase disabled:opacity-40"
          @click="handleAddToCart"
        >
          <ShoppingBag class="size-4" aria-hidden="true" />
          <span>Agregar</span>
        </button>
      </footer>
    </div>
  </dialog>
</template> 