import type { FastifyInstance } from 'fastify';
import { isValidObjectId } from 'mongoose';
import { ZodError, type ZodType } from 'zod';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Recurso') => new HttpError(404, `${what} não encontrado`);

export function parse<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function assertObjectId(id: string, what?: string) {
  if (!isValidObjectId(id)) throw notFound(what);
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0]?.message ?? 'Dados inválidos',
        issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    const err = error as { code?: number | string; statusCode?: number; message?: string };
    if (err.code === 11000) {
      return reply.status(409).send({ message: 'Registro já existe' });
    }
    if (err.statusCode && err.statusCode < 500) {
      return reply.status(err.statusCode).send({ message: err.message });
    }
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro interno' });
  });
}
