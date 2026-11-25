import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDailyBcvRate } from "@/services/bcv.service";

describe("Servicio de Tasa BCV (Resiliencia Offline)", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	/**
	 * Valida que ante una caída simultánea de todos los endpoints públicos,
	 * el servicio responda de forma segura con el fallback de la tienda.
	 */
	it("devuelve la tasa fallback cuando no hay conexión ni caché previa", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network offline")),
		);

		const snapshot = await getDailyBcvRate(915.5, true);

		expect(snapshot.usd).toBe(915.5);
		expect(snapshot.source).toBe("fallback");
	});

	/**
	 * Valida el consumo del proveedor primario y el almacenamiento en caché
	 * para evitar peticiones redundantes en redes móviles.
	 */
	it("guarda en caché la tasa obtenida desde DolarApi y la reutiliza", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				promedio: 920.25,
				fechaActualizacion: "2026-11-25T10:00:00Z",
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		const firstCall = await getDailyBcvRate(900, true);
		const secondCall = await getDailyBcvRate(900, false);

		expect(firstCall.usd).toBe(920.25);
		expect(firstCall.source).toBe("dolarapi");
		expect(secondCall.source).toBe("cache");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
