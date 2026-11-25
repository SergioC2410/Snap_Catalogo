<script setup lang="ts">
import { ArrowRight, ShoppingBag } from "lucide-vue-next";
import { computed } from "vue";
import { formatUsd, formatVes } from "@/utils/currency";

const props = defineProps<{
	totalItemsCount: number;
	subtotalUsd: number;
	subtotalVes: number;
	displayCurrency: "USD" | "VES";
	announcement: string;
}>();

const emit = defineEmits<{
	openCheckout: [];
}>();

const primaryTotal = computed(() =>
	props.displayCurrency === "USD"
		? formatUsd(props.subtotalUsd)
		: formatVes(props.subtotalVes),
);

const secondaryTotal = computed(() =>
	props.displayCurrency === "USD"
		? formatVes(props.subtotalVes)
		: formatUsd(props.subtotalUsd),
);
</script>

<template>
  <!-- Región viva permanente para lectores de pantalla (WCAG 3.0) -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ props.announcement }}
  </div>

  <div
    v-if="props.totalItemsCount > 0"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
  >
    <div class="pointer-events-auto mx-auto max-w-xl">
      <button
        type="button"
        class="tactile-btn flex min-h-14 w-full items-center justify-between gap-3 rounded-ctrl bg-accent px-4 py-2.5 text-on-accent shadow-xl"
        @click="emit('openCheckout')"
      >
        <div class="flex items-center gap-3">
          <span
            class="price-tabular inline-flex size-9 items-center justify-center rounded-full bg-on-accent/15 text-xs font-black"
          >
            {{ props.totalItemsCount }}
          </span>
          <div class="price-tabular text-left leading-tight">
            <p class="text-sm font-black">{{ primaryTotal }}</p>
            <p class="text-[11px] opacity-80">{{ secondaryTotal }}</p>
          </div>
        </div>

        <span class="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase">
          <ShoppingBag class="size-4" aria-hidden="true" />
          <span>Ver Pedido</span>
          <ArrowRight class="size-4" aria-hidden="true" />
        </span>
      </button>
    </div>
  </div>
</template>