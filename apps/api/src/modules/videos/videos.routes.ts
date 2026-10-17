import { COURSES } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { assertObjectId, notFound, parse } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { VideoModel, toVideo } from './video.model';

const listQuery = z.object({ course: z.enum(COURSES).optional() });

export async function videosRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { course } = parse(listQuery, request.query);
    const videos = await VideoModel.find(course ? { course } : {}).sort({ createdAt: -1 }).lean();
    return videos.map(toVideo);
  });

  app.post<{ Params: { id: string } }>('/:id/watched', { onRequest: [app.authenticate] }, async (request) => {
    assertObjectId(request.params.id, 'Vídeo');
    if (!(await VideoModel.exists({ _id: request.params.id }))) throw notFound('Vídeo');
    return { pointsAwarded: await awardPoints(request.account!.id, 'watch_video', request.params.id) };
  });
}
