import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HttpError, assertObjectId, notFound, parse } from '../../lib/http';
import { PostModel, toPost } from '../posts/post.model';
import { User, toPublicUser } from './user.model';

const searchQuery = z.object({ search: z.string().trim().optional() });

export async function usersRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // Comunidade: busca por nome ou habilidade (ex.: "fotografia" para achar freelancers)
  app.get('/', async (request) => {
    const { search } = parse(searchQuery, request.query);
    const filter = search
      ? { $or: [{ name: new RegExp(escapeRegex(search), 'i') }, { skills: new RegExp(escapeRegex(search), 'i') }] }
      : {};
    const users = await User.find(filter).sort({ name: 1 }).limit(50).lean();
    return Promise.all(users.map(toPublicUser));
  });

  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    assertObjectId(request.params.id, 'Usuário');
    const user = await User.findById(request.params.id).lean();
    if (!user) throw notFound('Usuário');
    return toPublicUser(user);
  });

  // Galeria pessoal (posts permanentes) de um usuário
  app.get<{ Params: { id: string } }>('/:id/posts', async (request) => {
    assertObjectId(request.params.id, 'Usuário');
    const posts = await PostModel.find({ author: request.params.id, kind: 'galeria', hidden: false })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatarUrl')
      .lean();
    return posts.map((p) => toPost(p, request.user.sub));
  });

  app.post<{ Params: { id: string } }>('/:id/follow', async (request, reply) => {
    assertObjectId(request.params.id, 'Usuário');
    if (request.params.id === request.user.sub) throw new HttpError(400, 'Você não pode seguir a si mesmo');
    if (!(await User.exists({ _id: request.params.id }))) throw notFound('Usuário');
    await User.updateOne({ _id: request.user.sub }, { $addToSet: { following: request.params.id } });
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/:id/follow', async (request, reply) => {
    assertObjectId(request.params.id, 'Usuário');
    await User.updateOne({ _id: request.user.sub }, { $pull: { following: request.params.id } });
    return reply.status(204).send();
  });
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
