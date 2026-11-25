<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { StoreConfig } from "@/types/store.types";

const props = defineProps<{
	store: StoreConfig;
}>();

const emit = defineEmits<{
	done: [];
}>();

const isLeaving = ref(false);
let leaveTimerId: number | undefined;
let doneTimerId: number | undefined;

onMounted(() => {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const visibleDurationMs = prefersReducedMotion ? 500 : 950;
	const fadeDurationMs = 260;

	leaveTimerId = window.setTimeout(() => {
		isLeaving.value = true;
	}, visibleDurationMs);

	doneTimerId = window.setTimeout(() => {
		emit("done");
	}, visibleDurationMs + fadeDurationMs);
});

onUnmounted(() => {
	if (leaveTimerId !== undefined) window.clearTimeout(leaveTimerId);
	if (doneTimerId !== undefined) window.clearTimeout(doneTimerId);
});

/**
 * Genera el monograma de marca tomando las dos primeras iniciales del nombre comercial.
 */
function getInitials(name: string): string {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
}
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    :aria-label="`Cargando ${props.store.name}`"
    class="splash-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas px-6 text-ink"
    :class="{ 'splash-leaving': isLeaving }"
  >
    <div class="splash-content flex flex-col items-center gap-4">
      <div
        class="splash-mark flex size-20 items-center justify-center rounded-prod bg-accent text-2xl font-black tracking-tight text-on-accent shadow-lg ring-4 ring-highlight/30"
      >
        {{ getInitials(props.store.name) }}
      </div>

      <div class="text-center">
        <p class="text-xl font-black tracking-[0.2em] uppercase">
          {{ props.store.name }}
        </p>
        <p class="mt-1 text-xs font-medium text-muted">
          {{ props.store.tagline }}
        </p>
      </div>

      <div class="mt-2 h-1 w-32 overflow-hidden rounded-full bg-line">
        <div class="splash-bar h-full w-full origin-left bg-accent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-overlay {
  transition: opacity 260ms ease-out;
}

.splash-leaving {
  opacity: 0;
  pointer-events: none;
}

.splash-mark {
  animation: mark-reveal 520ms var(--ease-spring) both;
}

.splash-content {
  animation: content-fade 420ms ease-out both;
}

.splash-bar {
  animation: progress-fill 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes mark-reveal {
  0% {
    opacity: 0;
    transform: scale(0.72) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes content-fade {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress-fill {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-mark,
  .splash-content {
    animation: none;
  }

  .splash-bar {
    animation-duration: 480ms;
  }
}
</style>