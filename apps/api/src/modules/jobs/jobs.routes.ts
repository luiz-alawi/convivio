import { JOB_TYPES, createJobSchema } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { assertObjectId, notFound, parse } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { JobModel, toJob } from './job.model';

const listQuery = z.object({ type: z.enum(JOB_TYPES).optional() });

export async function jobsRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { type } = parse(listQuery, request.query);
    const jobs = await JobModel.find({ status: 'aprovada', ...(type && { type }) })
      .sort({ createdAt: -1 })
      .lean();
    return jobs.map(toJob);
  });

  // Entra como "pendente". TODO: tela/rota de moderação para aprovar.
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = parse(createJobSchema, request.body);
    const job = await JobModel.create({ ...data, createdBy: request.user.sub });
    return reply.status(201).send(toJob(job.toObject()));
  });

  app.post<{ Params: { id: string } }>('/:id/interest', { onRequest: [app.authenticate] }, async (request) => {
    assertObjectId(request.params.id, 'Vaga');
    if (!(await JobModel.exists({ _id: request.params.id, status: 'aprovada' }))) throw notFound('Vaga');
    return { pointsAwarded: await awardPoints(request.user.sub, 'job_interest', request.params.id) };
  });
}
