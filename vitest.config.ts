import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/**
 * Configuración de Vitest v5 optimizada para entornos locales con RAM acotada y CI.
 * Usa worker threads con concurrencia controlada para evitar picos de commit de memoria en Windows.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      pool: 'threads',
      maxWorkers: 2,
      include: ['tests/**/*.spec.ts'],
      clearMocks: true,
      restoreMocks: true,
    },
  }),
);