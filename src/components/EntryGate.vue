<script setup lang="ts">
import { Store } from "lucide-vue-next";
import { ref, watch } from "vue";
import type { EntryGateOption, StoreConfig } from "@/types/store.types";

const props = defineProps<{
	store: StoreConfig;
	demoStores: StoreConfig[];
}>();

const emit = defineEmits<{
	select: [category: string];
	switchStore: [slug: string];
}>();

const failedAssets = ref<Record<string, boolean>>({});

watch(
	() => props.store.slug,
	() => {
		failedAssets.value = {};
	},
);

function handleChoose(category: string): void {
	emit("select", category);
}

function markAssetFailed(optionId: string): void {
	failedAssets.value = {
		...failedAssets.value,
		[optionId]: true,
	};
}
</script>

<template>
  <section
    aria-labelledby="entry-gate-title"
    class="flex min-h-dvh flex-col justify-between bg-canvas text-ink"
  >
    <!-- Switch rápido para demostraciones multi-tienda desde la pantalla inicial -->
    <div class="border-b border-line/70 bg-card/70 px-4 py-2">
      <div
        class="mx-auto flex max-w-xl items-center justify-center gap-1.5 text-[11px]"
        role="group"
        aria-label="Cambiar tienda de demostración"
      >
        <Store class="size-3.5 text-muted" aria-hidden="true" />
        <button
          v-for="demo in props.demoStores"
          :key="demo.slug"
          type="button"
          class="tactile-btn rounded-ctrl px-3 py-1 font-bold tracking-wide uppercase transition-colors"
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
    </div>

    <div class="flex flex-1 flex-col justify-between px-5 py-8">
      <header class="mx-auto w-full max-w-xl text-center">
        <p class="text-xs font-bold tracking-[0.2em] text-muted uppercase">
          {{ props.store.name }}
        </p>
        <h1
          id="entry-gate-title"
          class="mt-3 text-2xl font-black tracking-tight uppercase sm:text-3xl"
        >
          ¿Qué estás buscando hoy?
        </h1>
        <p class="mt-2 text-sm text-muted">
          Elige una línea para filtrar el catálogo al instante.
        </p>
      </header>

      <!-- Cuadrícula 2x2 de iconos vectoriales por categoría -->
      <div class="mx-auto my-6 grid w-full max-w-xl grid-cols-2 gap-3.5">
        <button
          v-for="option in (props.store.entryGateOptions ?? ([] as EntryGateOption[]))"
          :key="option.id"
          type="button"
          class="tactile-btn group flex flex-col justify-between overflow-hidden rounded-prod border border-line bg-card/80 p-3.5 text-left transition-colors hover:border-accent hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          @click="handleChoose(option.filterCategory)"
        >
          <div class="flex aspect-[5/4] w-full items-center justify-center rounded-lg bg-elevated/80 p-4">
            <img
              v-if="option.iconSvgPath && !failedAssets[option.id]"
              :src="option.iconSvgPath"
              alt=""
              aria-hidden="true"
              class="size-20 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-24 [[data-theme='dark']_&]:invert"
              @error="markAssetFailed(option.id)"
            />

            <img
              v-else-if="option.imageUrl && !failedAssets[option.id]"
              :src="option.imageUrl"
              :alt="option.label"
              class="size-full rounded-md object-cover"
              @error="markAssetFailed(option.id)"
            />

            <span
              v-else
              class="text-3xl font-black tracking-wider text-ink uppercase"
              aria-hidden="true"
            >
              {{ option.label.slice(0, 2) }}
            </span>
          </div>

          <div class="mt-3">
            <span
              class="flex min-h-11 w-full items-center justify-center rounded-ctrl bg-accent px-3 text-xs font-extrabold tracking-wider text-on-accent uppercase"
            >
              {{ option.label }}
            </span>
          </div>
        </button>
      </div>

      <footer class="mx-auto w-full max-w-xl text-center">
        <button
          type="button"
          class="tactile-btn inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-ink underline decoration-muted underline-offset-4 hover:decoration-ink"
          @click="handleChoose('Todo')"
        >
          Ver todo el catálogo
        </button>
      </footer>
    </div>
  </section>
</template>