import { ACCOUNT_ROLES, COMPANY_STATUSES, adminUpdateUserSchema, type AdminStats } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HttpError, assertObjectId, notFound, parse } from '../../lib/http';
import { JobModel } from '../jobs/job.model';
import { AUTHOR_FIELDS, PostModel, toReportedPost } from '../posts/post.model';
import { User, toAdminUser } from '../users/user.model';

const usersQuery = z.object({
  role: z.enum(ACCOUNT_ROLES).optional(),
  companyStatus: z.enum(COMPANY_STATUSES).optional(),
  search: z.string().trim().optional(),
});

const postBody = z.object({ hidden: z.boolean() });

// Painel do administrador: usuários, empresas, vagas e denúncias
export async function adminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.requireRole('admin'));

  app.get('/stats', async (): Promise<AdminStats> => {
    const [users, companies, pendingCompanies, jobs, reportedPosts] = await Promise.all([
      User.countDocuments({ role: 'usuario' }),
      User.countDocuments({ role: 'empresa' }),
      User.countDocuments({ role: 'empresa', 'company.status': 'pendente' }),
      JobModel.countDocuments(),
      PostModel.countDocuments({ 'reports.0': { $exists: true } }),
    ]);
    return { users, companies, pendingCompanies, jobs, reportedPosts };
  });

  app.get('/users', async (request) => {
    const { role, companyStatus, search } = parse(usersQuery, request.query);
    const term = search && new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      ...(role && { role }),
      ...(companyStatus && { 'company.status': companyStatus }),
      ...(term && { $or: [{ name: term }, { email: term }, { username: term }] }),
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return users.map(toAdminUser);
  });

  // Aprovar/recusar empresa, bloquear/desbloquear, mudar o papel da conta
  app.patch<{ Params: { id: string } }>('/users/:id', async (request) => {
    assertObjectId(request.params.id, 'Usuário');
    const { blocked, role, companyStatus } = parse(adminUpdateUserSchema, request.body);
    if (request.params.id === request.account!.id && (blocked || (role && role !== 'admin'))) {
      throw new HttpError(400, 'Você não pode bloquear nem rebaixar a própria conta');
    }
    const user = await User.findById(request.params.id);
    if (!user) throw notFound('Usuário');
    if (blocked !== undefined) user.blocked = blocked;
    if (role) user.role = role;
    if (companyStatus) {
      if (!user.company) throw new HttpError(400, 'Esta conta não é de empresa');
      user.company.status = companyStatus;
    }
    await user.save();
    return toAdminUser(user.toObject());
  });

  // Posts com pelo menos uma denúncia, os escondidos primeiro
  app.get('/reported-posts', async (request) => {
    const posts = await PostModel.find({ 'reports.0': { $exists: true } })
      .sort({ hidden: -1, updatedAt: -1 })
      .populate('author', AUTHOR_FIELDS)
      .lean();
    return posts.map((p) => toReportedPost(p, request.account!.id));
  });

  // Esconder ou restaurar (restaurar limpa as denúncias)
  app.patch<{ Params: { id: string } }>('/posts/:id', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    const { hidden } = parse(postBody, request.body);
    const update = hidden ? { hidden } : { hidden, reports: [] };
    const result = await PostModel.updateOne({ _id: request.params.id }, update);
    if (result.matchedCount === 0) throw notFound('Post');
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/posts/:id', async (request, reply) => {
    assertObjectId(request.params.id, 'Post');
    const result = await PostModel.deleteOne({ _id: request.params.id });
    if (result.deletedCount === 0) throw notFound('Post');
    return reply.status(204).send();
  });
}
