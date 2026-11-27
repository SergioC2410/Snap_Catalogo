<script setup lang="ts">
import {
	Check,
	Copy,
	MessageCircle,
	Minus,
	Plus,
	Trash2,
	X,
} from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import type { CartItem, StoreConfig } from "@/types/store.types";
import { formatUsd, formatVes } from "@/utils/currency";
import {
	buildWhatsAppOrderMessage,
	buildWhatsAppOrderUrl,
	isDemoWhatsAppPhone,
} from "@/utils/whatsapp";

const props = defineProps<{
	open: boolean;
	store: StoreConfig;
	items: CartItem[];
	subtotalUsd: number;
	subtotalVes: number;
	bcvRate: number;
}>();

const emit = defineEmits<{
	close: [];
	updateQuantity: [key: string, nextQuantity: number];
	removeItem: [key: string];
	clearCart: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const customerName = ref("");
const deliveryMode = ref<"Delivery" | "Pick-up">(
	props.store.deliveryModes[0] ?? "Delivery",
);
const addressOrZone = ref("");
const paymentMethod = ref(props.store.paymentMethods[0] ?? "Pago Móvil");
const notes = ref("");
const validationError = ref<string | null>(null);
const previewTicket = ref<string | null>(null);
const copiedTicket = ref(false);

const isDemoPhone = computed(() =>
	isDemoWhatsAppPhone(props.store.whatsappPhone),
);

/**
 * ES: En `single-item`, las notas solo aparecen cuando el carrito tiene un único ítem.
 * EN: In `single-item` mode, notes appear only when the cart has one line item.
 */
const showNotesField = computed(() => {
	if (props.store.notesVisibility === "always") return true;
	return props.items.length === 1;
});

watch(
	() => props.open,
	(isOpen) => {
		const dialog = dialogRef.value;
		if (!dialog) return;

		if (isOpen) {
			validationError.value = null;
			previewTicket.value = null;
			copiedTicket.value = false;
			if (!dialog.open) {
				dialog.showModal();
			}
		} else if (dialog.open) {
			dialog.close();
		}
	},
);

watch(
	() => props.store.slug,
	() => {
		deliveryMode.value = props.store.deliveryModes[0] ?? "Delivery";
		paymentMethod.value = props.store.paymentMethods[0] ?? "Pago Móvil";
		notes.value = "";
		validationError.value = null;
		previewTicket.value = null;
		copiedTicket.value = false;
	},
);

function handleBackdropClick(event: MouseEvent): void {
	if (event.target === dialogRef.value) {
		emit("close");
	}
}

async function handleCopyPreviewTicket(): Promise<void> {
	if (!previewTicket.value) return;
	try {
		await navigator.clipboard.writeText(previewTicket.value);
		copiedTicket.value = true;
		window.setTimeout(() => {
			copiedTicket.value = false;
		}, 2000);
	} catch {
		copiedTicket.value = false;
	}
}

/**
 * ES: Con el número de demo (`584120000000`), muestra el ticket aquí en vez de abrir WhatsApp.
 * EN: With the demo number (`584120000000`), show the ticket here instead of opening WhatsApp.
 */
function handleSubmitOrder(): void {
	if (props.items.length === 0) return;

	if (customerName.value.trim().length < 2) {
		validationError.value = "Escribe tu nombre para identificar el pedido.";
		return;
	}

	if (
		deliveryMode.value === "Delivery" &&
		addressOrZone.value.trim().length < 3
	) {
		validationError.value =
			"Indica tu zona o dirección para coordinar el delivery.";
		return;
	}

	validationError.value = null;

	const orderPayload = {
		customerName: customerName.value,
		deliveryMode: deliveryMode.value,
		addressOrZone:
			deliveryMode.value === "Delivery" ? addressOrZone.value : undefined,
		paymentMethod: paymentMethod.value,
		notes: showNotesField.value ? notes.value : undefined,
	};

	if (isDemoPhone.value) {
		previewTicket.value = buildWhatsAppOrderMessage(
			props.store,
			props.items,
			props.bcvRate,
			orderPayload,
		);
		return;
	}

	const whatsappUrl = buildWhatsAppOrderUrl(
		props.store,
		props.items,
		props.bcvRate,
		orderPayload,
	);

	window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <dialog
    ref="dialogRef"
    aria-labelledby="checkout-dialog-title"
    class="m-auto max-h-[92dvh] w-[min(100%-1.5rem,34rem)] overflow-hidden rounded-prod border border-line bg-elevated p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs"
    @cancel.prevent="emit('close')"
    @click="handleBackdropClick"
  >
    <div class="flex max-h-[92dvh] flex-col">
      <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p class="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            {{ props.store.name }}
          </p>
          <h2 id="checkout-dialog-title" class="text-base font-black uppercase">
            Tu Pedido
          </h2>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            v-if="props.items.length > 0"
            type="button"
            class="tactile-btn inline-flex min-h-11 items-center gap-1 rounded-ctrl px-3 text-xs font-bold text-muted hover:text-rose-600"
            @click="emit('clearCart')"
          >
            <Trash2 class="size-3.5" aria-hidden="true" />
            <span>Vaciar</span>
          </button>

          <button
            type="button"
            class="tactile-btn inline-flex size-11 items-center justify-center rounded-ctrl border border-line bg-card text-ink hover:border-accent"
            aria-label="Cerrar resumen de pedido"
            @click="emit('close')"
          >
            <X class="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div
          v-if="props.items.length === 0"
          class="rounded-prod border border-dashed border-line bg-card/50 px-4 py-10 text-center"
        >
          <p class="text-sm font-bold text-ink">Tu pedido está vacío</p>
          <p class="mt-1 text-xs text-muted">
            Agrega productos del catálogo para armar tu ticket de WhatsApp.
          </p>
        </div>

        <template v-else>
          <ul class="divide-y divide-line rounded-prod border border-line bg-card/40">
            <li
              v-for="item in props.items"
              :key="item.key"
              class="flex items-center gap-3 p-3"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="size-16 shrink-0 rounded-md bg-card object-cover"
              />

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-ink">{{ item.name }}</p>
                <p class="truncate text-xs text-muted">{{ item.variantLabel }}</p>
                <p class="price-tabular mt-1 text-xs font-black text-ink">
                  {{ formatUsd(item.unitPriceUsd * item.quantity) }}
                </p>
              </div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="tactile-btn inline-flex size-9 items-center justify-center rounded-ctrl border border-line bg-elevated text-ink"
                  :aria-label="`Restar una unidad de ${item.name}`"
                  @click="emit('updateQuantity', item.key, item.quantity - 1)"
                >
                  <Minus class="size-3.5" aria-hidden="true" />
                </button>
                <span class="price-tabular min-w-6 text-center text-xs font-black">
                  {{ item.quantity }}
                </span>
                <button
                  type="button"
                  class="tactile-btn inline-flex size-9 items-center justify-center rounded-ctrl border border-line bg-elevated text-ink"
                  :aria-label="`Sumar una unidad de ${item.name}`"
                  @click="emit('updateQuantity', item.key, item.quantity + 1)"
                >
                  <Plus class="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>

          <form id="whatsapp-checkout-form" class="space-y-4" @submit.prevent="handleSubmitOrder">
            <div>
              <label for="checkout-name" class="block text-xs font-bold tracking-wider uppercase">
                Tu Nombre *
              </label>
              <input
                id="checkout-name"
                v-model="customerName"
                type="text"
                required
                autocomplete="name"
                placeholder="Ej. Sergio Contreras"
                class="mt-1.5 min-h-11 w-full rounded-ctrl border border-line bg-card px-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <span class="block text-xs font-bold tracking-wider uppercase">Modalidad *</span>
              <div class="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Modalidad de entrega">
                <button
                  v-for="mode in props.store.deliveryModes"
                  :key="mode"
                  type="button"
                  role="radio"
                  :aria-checked="deliveryMode === mode"
                  class="tactile-btn min-h-11 rounded-ctrl border px-3 text-xs font-bold uppercase transition-colors"
                  :class="
                    deliveryMode === mode
                      ? 'border-accent bg-accent text-on-accent'
                      : 'border-line bg-card text-ink hover:border-accent'
                  "
                  @click="deliveryMode = mode"
                >
                  {{ mode }}
                </button>
              </div>
            </div>

            <div v-if="deliveryMode === 'Delivery'">
              <label for="checkout-zone" class="block text-xs font-bold tracking-wider uppercase">
                Zona / Dirección de Entrega *
              </label>
              <input
                id="checkout-zone"
                v-model="addressOrZone"
                type="text"
                required
                :placeholder="props.store.zonePlaceholder"
                class="mt-1.5 min-h-11 w-full rounded-ctrl border border-line bg-card px-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <span class="block text-xs font-bold tracking-wider uppercase">Método de Pago *</span>
              <div class="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Método de pago">
                <button
                  v-for="method in props.store.paymentMethods"
                  :key="method"
                  type="button"
                  role="radio"
                  :aria-checked="paymentMethod === method"
                  class="tactile-btn min-h-11 rounded-ctrl border px-3.5 text-xs font-bold transition-colors"
                  :class="
                    paymentMethod === method
                      ? 'border-accent bg-accent text-on-accent'
                      : 'border-line bg-card text-ink hover:border-accent'
                  "
                  @click="paymentMethod = method"
                >
                  {{ method }}
                </button>
              </div>
            </div>

            <div v-if="showNotesField">
              <label for="checkout-notes" class="block text-xs font-bold tracking-wider uppercase">
                Nota Opcional
              </label>
              <input
                id="checkout-notes"
                v-model="notes"
                type="text"
                :placeholder="props.store.notesPlaceholder"
                class="mt-1.5 min-h-11 w-full rounded-ctrl border border-line bg-card px-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            <p
              v-if="validationError"
              role="alert"
              class="rounded-md bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-600"
            >
              {{ validationError }}
            </p>

            <!-- ES: En demo, el ticket se muestra aquí sin abrir WhatsApp. / EN: In demo mode, the ticket stays here and WhatsApp does not open. -->
            <div
              v-if="previewTicket"
              class="space-y-2.5 rounded-prod border border-amber-500/50 bg-card p-3.5 text-xs"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-amber-600 uppercase">
                  Modo demo activo (no se abre WhatsApp)
                </span>
                <button
                  type="button"
                  class="tactile-btn inline-flex min-h-9 items-center gap-1.5 rounded-ctrl border border-line bg-elevated px-3 font-bold text-ink hover:border-accent"
                  @click="handleCopyPreviewTicket"
                >
                  <Check v-if="copiedTicket" class="size-3.5 text-emerald-600" aria-hidden="true" />
                  <Copy v-else class="size-3.5" aria-hidden="true" />
                  <span>{{ copiedTicket ? "Copiado" : "Copiar ticket" }}</span>
                </button>
              </div>
              <pre class="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink">{{ previewTicket }}</pre>
            </div>
          </form>
        </template>
      </div>

      <footer
        v-if="props.items.length > 0"
        class="space-y-3 border-t border-line bg-elevated p-4"
      >
        <div class="price-tabular flex items-baseline justify-between text-sm">
          <span class="font-bold text-muted uppercase">Total a Pagar</span>
          <div class="text-right">
            <p class="text-lg font-black text-ink">{{ formatUsd(props.subtotalUsd) }}</p>
            <p class="text-xs font-semibold text-muted">
              Ref. BCV ({{ props.bcvRate.toFixed(2) }}): {{ formatVes(props.subtotalVes) }}
            </p>
          </div>
        </div>

        <button
          type="submit"
          form="whatsapp-checkout-form"
          class="tactile-btn inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-ctrl bg-emerald-600 px-4 text-xs font-black tracking-wider text-white uppercase shadow-md hover:bg-emerald-700"
        >
          <MessageCircle class="size-4" aria-hidden="true" />
          <span>{{ isDemoPhone ? "Generar Vista Previa (Demo)" : "Enviar Pedido por WhatsApp" }}</span>
        </button>
      </footer>
    </div>
  </dialog>
</template>