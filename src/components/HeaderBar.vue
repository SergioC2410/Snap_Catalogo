<script setup lang="ts">
import { ArrowLeftRight, Search, Store, X } from "lucide-vue-next";
import { ref } from "vue";
import type { BcvRateSnapshot, StoreConfig } from "@/types/store.types";

const props = defineProps<{
	store: StoreConfig;
	demoStores: StoreConfig[];
	bcvSnapshot: BcvRateSnapshot;
	displayCurrency: "USD" | "VES";
	searchQuery: string;
}>();

const emit = defineEmits<{
	"update:searchQuery": [value: string];
	toggleCurrency: [];
	switchStore: [slug: string];
}>();

const isSearchOpen = ref(false);

function toggleSearch(): void {
	isSearchOpen.value = !isSearchOpen.value;
	if (!isSearchOpen.value && props.searchQuery) {
		emit("update:searchQuery", "");
	}
}

function handleInput(event: Event): void {
	const target = event.target as HTMLInputElement | null;
	emit("update:searchQuery", target?.value ?? "");
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
    <!-- Franja superior: Switch multi-tienda demo + Tasa BCV en vivo -->
    <div class="border-b border-line/70 bg-card/70 px-4 py-1.5">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 text-[11px]">
        <div class="flex items-center gap-1.5" role="group" aria-label="Cambiar tienda de demostración">
          <Store class="size-3.5 text-muted" aria-hidden="true" />
          <button
            v-for="demo in props.demoStores"
            :key="demo.slug"
            type="button"
            class="tactile-btn rounded-ctrl px-2.5 py-1 font-bold tracking-wide uppercase transition-colors"
            :class="
              demo.slug === props.store.slug
                ? 'bg-accent text-on-accent'
                : 'bg-elevated text-muted hover:text-ink'
            "
            :aria-pressed="demo.slug === props.store.slug"
            @click="emit('switchStore', demo.slug)"
          >
            {{ demo.name }}
          </button>
        </div>

        <div class="price-tabular flex items-center gap-2 font-semibold text-muted">
          <span
            class="inline-block size-1.5 rounded-full"
            :class="props.bcvSnapshot.source === 'fallback' ? 'bg-amber-500' : 'bg-emerald-500'"
            aria-hidden="true"
          />
          <span>BCV: Bs. {{ props.bcvSnapshot.usd.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Barra principal de navegación -->
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
      <div class="min-w-0">
        <p class="truncate text-base font-black tracking-[0.12em] text-ink uppercase">
          {{ props.store.name }}
        </p>
        <p class="truncate text-xs font-medium text-muted">
          {{ props.store.cityLabel }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="tactile-btn price-tabular inline-flex min-h-11 items-center gap-1.5 rounded-ctrl border border-line bg-elevated px-3.5 text-xs font-bold text-ink hover:border-accent"
          :aria-label="`Cambiar moneda principal. Actual: ${props.displayCurrency}`"
          @click="emit('toggleCurrency')"
        >
          <ArrowLeftRight class="size-3.5" aria-hidden="true" />
          <span>{{ props.displayCurrency === 'USD' ? 'USD $' : 'Bs. BCV' }}</span>
        </button>

        <button
          type="button"
          class="tactile-btn inline-flex size-11 items-center justify-center rounded-ctrl border border-line bg-elevated text-ink hover:border-accent"
          :aria-expanded="isSearchOpen"
          aria-controls="catalog-search-bar"
          :aria-label="isSearchOpen ? 'Cerrar buscador' : 'Buscar productos'"
          @click="toggleSearch"
        >
          <X v-if="isSearchOpen" class="size-5" aria-hidden="true" />
          <Search v-else class="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Barra de búsqueda desplegable instantánea -->
    <div
      v-if="isSearchOpen"
      id="catalog-search-bar"
      class="mx-auto max-w-5xl border-t border-line/60 px-4 py-2.5"
    >
      <div class="relative flex items-center">
        <Search class="pointer-events-none absolute left-3.5 size-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          :value="props.searchQuery"
          placeholder="Buscar producto, talla, sabor..."
          aria-label="Buscar en el catálogo"
          class="min-h-11 w-full rounded-ctrl border border-line bg-elevated py-2 pr-10 pl-10 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          @input="handleInput"
        />
        <button
          v-if="props.searchQuery"
          type="button"
          class="absolute right-2 inline-flex size-8 items-center justify-center rounded-full text-muted hover:text-ink"
          aria-label="Limpiar búsqueda"
          @click="emit('update:searchQuery', '')"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>