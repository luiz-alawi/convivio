import { createPostSchema } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HttpError, assertObjectId, notFound, parse } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { User } from '../users/user.model';
import { AUTHOR_FIELDS, PostModel, REPORTS_TO_HIDE, toPost } from './post.model';

// Ainda a decidir em equipe: feed só de quem eu sigo ou aberto à comunidade AMF. Por enquanto, os dois.
const feedQuery = z.object({ scope: z.enum(['todos', 'seguindo']).default('todos') });
const reportBody = z.object({ reason: z.string().trim().min(3).max(300) });

export async function postsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/', async (request) => {
    const { scope } = parse(feedQuery, request.query);
    const filter: Record<string, unknown> = { hidden: false };
    if (scope === 'seguindo') {
      const me = await User.findById(request.account!.id, 'following').lean();
      filter.author = { $in: [...(me?.following ?? []), request.account!.id] };
    }
    const posts = await PostModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', AUTHOR_FIELDS)
      .lean();
    return posts.map((p) => toPost(p, request.account!.id));
  });

  // A imagem já chega como URL do Cloudinary (o app envia direto, com assinatura de /uploads/signature)
  app.post('/', async (request, reply) => {
    const data = parse(createPostSchema, request.body);
    const expiresAt = data.kind === 'momento' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;
    const post = await PostModel.create({ ...data, author: request.account!.id, expiresAt });
    await awardPoints(request.account!.id, 'create_post', post.id);
    const populated = await post.populate('author', AUTHOR_FIELDS);
    return reply.status(201).send(toPost(populated.toObject(), request.account!.id));
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    const result = await PostModel.deleteOne({ _id: request.params.id, author: request.account!.id });
    if (result.deletedCount === 0) throw notFound('Post');
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/:id/like', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    const result = await PostModel.updateOne({ _id: request.params.id }, { $addToSet: { likes: request.account!.id } });
    if (result.matchedCount === 0) throw notFound('Post');
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/:id/like', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    await PostModel.updateOne({ _id: request.params.id }, { $pull: { likes: request.account!.id } });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/:id/report', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    const { reason } = parse(reportBody, request.body);
    const post = await PostModel.findById(request.params.id);
    if (!post) throw notFound('Post');
    if (post.reports.some((r) => r.user?.toString() === request.account!.id)) {
      throw new HttpError(409, 'Você já denunciou este post');
    }
    post.reports.push({ user: request.account!.id, reason });
    if (post.reports.length >= REPORTS_TO_HIDE) post.hidden = true;
    await post.save();
    return reply.status(204).send();
  });
}
