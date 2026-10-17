import fastifyJwt from '@fastify/jwt';
import type { AccountRole, CompanyStatus } from '@convivio/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env';
import { User } from '../modules/users/user.model';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

/** Dados da conta logada, carregados do banco a cada requisição autenticada. */
export interface Account {
  id: string;
  name: string;
  role: AccountRole;
  companyStatus?: CompanyStatus;
}

type Guard = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: Guard;
    /** Lê o token se vier, mas não exige (rotas públicas que mudam com o usuário logado). */
    optionalAuth: (request: FastifyRequest) => Promise<void>;
    /** Exige login e um dos papéis informados. */
    requireRole: (...roles: AccountRole[]) => Guard;
  }
  interface FastifyRequest {
    account?: Account;
  }
}

async function loadAccount(request: FastifyRequest): Promise<Account | null> {
  await request.jwtVerify();
  const user = await User.findById(request.user.sub, 'name role blocked company.status').lean();
  if (!user || user.blocked) return null;
  return { id: user._id.toString(), name: user.name, role: user.role, companyStatus: user.company?.status };
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  const authenticate: Guard = async (request, reply) => {
    try {
      const account = await loadAccount(request);
      if (!account) return reply.status(401).send({ message: 'Conta indisponível. Faça login novamente.' });
      request.account = account;
    } catch {
      return reply.status(401).send({ message: 'Faça login para continuar' });
    }
  };

  app.decorate('authenticate', authenticate);

  app.decorate('optionalAuth', async (request: FastifyRequest) => {
    if (!request.headers.authorization) return;
    try {
      request.account = (await loadAccount(request)) ?? undefined;
    } catch {
      // token inválido em rota pública: segue como visitante
    }
  });

  app.decorate('requireRole', (...roles: AccountRole[]): Guard => async (request, reply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    if (!roles.includes(request.account!.role)) {
      return reply.status(403).send({ message: 'Você não tem permissão para isso' });
    }
  });
}
