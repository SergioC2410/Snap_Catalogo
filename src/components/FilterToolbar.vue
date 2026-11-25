<script setup lang="ts">
import { LayoutGrid, SlidersHorizontal, Square } from "lucide-vue-next";
import type { SortOption } from "@/utils/search";

export type GridLayoutMode = "grid" | "editorial";

const props = defineProps<{
	categories: string[];
	activeCategory: string;
	layoutMode: GridLayoutMode;
	sortBy: SortOption;
	resultsCount: number;
}>();

const emit = defineEmits<{
	"update:activeCategory": [category: string];
	"update:layoutMode": [mode: GridLayoutMode];
	"update:sortBy": [sort: SortOption];
}>();

/**
 * Envuelve los cambios de disposición visual en View Transitions API cuando el navegador lo soporta.
 */
function runWithViewTransition(callback: () => void): void {
	if ("startViewTransition" in document) {
		(
			document as Document & { startViewTransition: (cb: () => void) => void }
		).startViewTransition(callback);
	} else {
		callback();
	}
}

function selectLayout(mode: GridLayoutMode): void {
	if (mode === props.layoutMode) return;
	runWithViewTransition(() => emit("update:layoutMode", mode));
}

function selectCategory(category: string): void {
	if (category === props.activeCategory) return;
	runWithViewTransition(() => emit("update:activeCategory", category));
}

function handleSortChange(event: Event): void {
	const target = event.target as HTMLSelectElement | null;
	const value = (target?.value ?? "featured") as SortOption;
	runWithViewTransition(() => emit("update:sortBy", value));
}
</script>

<template>
  <section aria-label="Filtros y disposición del catálogo" class="mx-auto max-w-5xl px-4 pt-4 pb-2">
    <!-- Fila 1: Toggle 2 columnas / 1 columna + Selector Ordenar -->
    <div class="flex items-center justify-between gap-3">
      <div
        role="group"
        aria-label="Modo de vista de tarjetas"
        class="inline-grid grid-cols-2 rounded-ctrl bg-card p-1"
      >
        <button
          type="button"
          class="tactile-btn inline-flex min-h-10 min-w-12 items-center justify-center rounded-ctrl transition-colors"
          :class="
            props.layoutMode === 'grid'
              ? 'bg-elevated text-ink shadow-xs'
              : 'text-muted hover:text-ink'
          "
          :aria-pressed="props.layoutMode === 'grid'"
          aria-label="Vista en cuadrícula de dos columnas"
          @click="selectLayout('grid')"
        >
          <LayoutGrid class="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="tactile-btn inline-flex min-h-10 min-w-12 items-center justify-center rounded-ctrl transition-colors"
          :class="
            props.layoutMode === 'editorial'
              ? 'bg-elevated text-ink shadow-xs'
              : 'text-muted hover:text-ink'
          "
          :aria-pressed="props.layoutMode === 'editorial'"
          aria-label="Vista editorial de una columna"
          @click="selectLayout('editorial')"
        >
          <Square class="size-4" aria-hidden="true" />
        </button>
      </div>

      <div class="relative flex flex-1 items-center justify-end sm:flex-none">
        <SlidersHorizontal
          class="pointer-events-none absolute left-3.5 size-4 text-ink"
          aria-hidden="true"
        />
        <select
          :value="props.sortBy"
          aria-label="Ordenar productos"
          class="min-h-11 w-full cursor-pointer appearance-none rounded-ctrl bg-card py-2 pr-4 pl-10 text-xs font-bold tracking-wider text-ink uppercase focus:outline-2 focus:outline-accent sm:w-auto sm:min-w-48"
          @change="handleSortChange"
        >
          <option value="featured">Destacados ({{ props.resultsCount }})</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="name-asc">Nombre: A - Z</option>
        </select>
      </div>
    </div>

    <!-- Fila 2: Píldoras de categoría táctiles -->
    <nav
      aria-label="Categorías de productos"
      class="mt-3 -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="category in props.categories"
        :key="category"
        type="button"
        class="tactile-btn shrink-0 min-h-11 rounded-ctrl border px-4 text-xs font-bold tracking-wide uppercase transition-colors"
        :class="
          category === props.activeCategory
            ? 'border-accent bg-accent text-on-accent'
            : 'border-line bg-elevated text-ink hover:border-accent'
        "
        :aria-pressed="category === props.activeCategory"
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </nav>
  </section>
</template>