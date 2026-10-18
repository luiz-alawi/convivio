import { buildApp } from './app';
import { connectDb } from './db';
import { env } from './env';

await connectDb();
const app = await buildApp();
await app.listen({ port: env.PORT, host: env.HOST });