import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** Lê o token se vier, mas não exige (rotas públicas que mudam com o usuário logado). */
    optionalAuth: (request: FastifyRequest) => Promise<void>;
  }
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.status(401).send({ message: 'Faça login para continuar' });
    }
  });

  app.decorate('optionalAuth', async (request: FastifyRequest) => {
    if (!request.headers.authorization) return;
    try {
      await request.jwtVerify();
    } catch {
      // token inválido em rota pública: segue como visitante
    }
  });
}
