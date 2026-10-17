import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env';
import { registerErrorHandler } from './lib/http';
import { adminRoutes } from './modules/admin/admin.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { checkinRoutes } from './modules/checkin/checkin.routes';
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { passagesRoutes } from './modules/passages/passages.routes';
import { placesRoutes } from './modules/places/places.routes';
import { postsRoutes } from './modules/posts/posts.routes';
import { tripsRoutes } from './modules/trips/trips.routes';
import { usersRoutes } from './modules/users/users.routes';
import { uploadsRoutes } from './modules/uploads/uploads.routes';
import { videosRoutes } from './modules/videos/videos.routes';
import { registerAuth } from './plugins/auth';

export async function buildApp() {
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') });
  await registerAuth(app);
  registerErrorHandler(app);

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(checkinRoutes, { prefix: '/checkin' });
  await app.register(placesRoutes, { prefix: '/places' });
  await app.register(tripsRoutes, { prefix: '/trips' });
  await app.register(videosRoutes, { prefix: '/videos' });
  await app.register(jobsRoutes, { prefix: '/jobs' });
  await app.register(passagesRoutes, { prefix: '/passages' });
  await app.register(postsRoutes, { prefix: '/posts' });
  await app.register(uploadsRoutes, { prefix: '/uploads' });
  await app.register(adminRoutes, { prefix: '/admin' });

  return app;
}
