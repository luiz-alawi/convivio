import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env';
import { registerErrorHandler } from './lib/http';

export async function buildApp() {
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') });
  registerErrorHandler(app);

  app.get('/health', async () => ({ ok: true }));

  // Registre aqui as rotas de cada módulo (src/modules/<recurso>), ex.:
  // await app.register(placesRoutes, { prefix: '/places' });

  return app;
}
