import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyBcvRate } from '@/services/bcv.service';

describe('Servicio de Tasa BCV (Consenso Multi-Proveedor + Caché)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('devuelve la tasa fallback cuando no hay conexión ni caché previa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    const snapshot = await getDailyBcvRate(926.3, true);

    expect(snapshot.usd).toBe(926.3);
    expect(snapshot.source).toBe('fallback');
  });

  it('elige la tasa oficial más alta cuando un proveedor está desfasado y la guarda en caché', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('dolarapi')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ promedio: 924.35, fechaActualizacion: '2026-11-26T12:00:00Z' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ fecha_valor: '2026-11-26', tasas: { USD: 926.3 } }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const firstCall = await getDailyBcvRate(920, true);
    const secondCall = await getDailyBcvRate(920, false);

    expect(firstCall.usd).toBe(926.3);
    expect(firstCall.source).toBe('cromstudio');
    expect(secondCall.source).toBe('cache');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});