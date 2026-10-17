import { JOB_TYPES, createJobSchema } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HttpError, assertObjectId, notFound, parse } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { JobModel, toJob } from './job.model';

const listQuery = z.object({ type: z.enum(JOB_TYPES).optional() });

export async function jobsRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { type } = parse(listQuery, request.query);
    const jobs = await JobModel.find(type ? { type } : {})
      .sort({ createdAt: -1 })
      .lean();
    return jobs.map(toJob);
  });

  // Vagas da empresa logada
  app.get('/mine', { onRequest: [app.requireRole('empresa')] }, async (request) => {
    const jobs = await JobModel.find({ createdBy: request.account!.id }).sort({ createdAt: -1 }).lean();
    return jobs.map(toJob);
  });

  // Só empresas aprovadas (ou o admin) publicam
  app.post('/', { onRequest: [app.requireRole('empresa', 'admin')] }, async (request, reply) => {
    const account = request.account!;
    if (account.role === 'empresa' && account.companyStatus !== 'aprovada') {
      throw new HttpError(403, 'Sua empresa ainda não foi aprovada pela administração');
    }
    const data = parse(createJobSchema, request.body);
    const job = await JobModel.create({ ...data, company: account.name, createdBy: account.id });
    return reply.status(201).send(toJob(job.toObject()));
  });

  // A empresa remove as próprias vagas; o admin remove qualquer uma
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [app.requireRole('empresa', 'admin')] },
    async (request, reply) => {
      assertObjectId(request.params.id, 'Vaga');
      const account = request.account!;
      const filter = account.role === 'admin' ? { _id: request.params.id } : { _id: request.params.id, createdBy: account.id };
      const result = await JobModel.deleteOne(filter);
      if (result.deletedCount === 0) throw notFound('Vaga');
      return reply.status(204).send();
    },
  );

  app.post<{ Params: { id: string } }>('/:id/interest', { onRequest: [app.authenticate] }, async (request) => {
    assertObjectId(request.params.id, 'Vaga');
    if (!(await JobModel.exists({ _id: request.params.id }))) throw notFound('Vaga');
    return { pointsAwarded: await awardPoints(request.account!.id, 'job_interest', request.params.id) };
  });
}
