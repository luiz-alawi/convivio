import type { FastifyInstance } from 'fastify';
import { assertObjectId, notFound } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { PassageModel, toPassage } from './passage.model';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function passagesRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const passages = await PassageModel.find().sort({ createdAt: 1 }).lean();
    return passages.map(toPassage);
  });

  // Passagem do dia: gira pela lista, uma por dia, igual para todo mundo
  app.get('/today', async () => {
    const count = await PassageModel.countDocuments();
    if (count === 0) throw notFound('Passagem');
    const index = Math.floor(Date.now() / DAY_MS) % count;
    const passage = await PassageModel.findOne().sort({ createdAt: 1 }).skip(index).lean();
    if (!passage) throw notFound('Passagem');
    return toPassage(passage);
  });

  app.post<{ Params: { id: string } }>('/:id/read', { onRequest: [app.authenticate] }, async (request) => {
    assertObjectId(request.params.id, 'Passagem');
    if (!(await PassageModel.exists({ _id: request.params.id }))) throw notFound('Passagem');
    return { pointsAwarded: await awardPoints(request.user.sub, 'read_passage', request.params.id) };
  });
}
