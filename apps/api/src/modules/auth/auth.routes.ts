import {
  loginSchema,
  registerCompanySchema,
  registerSchema,
  updateProfileSchema,
  type AuthResponse,
} from '@convivio/shared';
import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import { HttpError, notFound, parse } from '../../lib/http';
import { User, toMe, type UserDoc } from '../users/user.model';

async function assertAvailable(fields: { email?: string; username?: string }, exceptId?: string) {
  const others = exceptId ? { _id: { $ne: exceptId } } : {};
  if (fields.email && (await User.exists({ email: fields.email, ...others }))) {
    throw new HttpError(409, 'Já existe uma conta com esse e-mail');
  }
  if (fields.username && (await User.exists({ username: fields.username, ...others }))) {
    throw new HttpError(409, 'Esse nome de usuário já está em uso');
  }
}

export async function authRoutes(app: FastifyInstance) {
  const respond = async (user: UserDoc): Promise<AuthResponse> => ({
    token: app.jwt.sign({ sub: user._id.toString() }),
    user: await toMe(user),
  });

  app.post('/register', async (request, reply) => {
    const { password, acceptedTerms: _, ...data } = parse(registerSchema, request.body);
    await assertAvailable(data);
    const user = await User.create({
      ...data,
      role: 'usuario',
      passwordHash: await bcrypt.hash(password, 10),
      acceptedTermsAt: new Date(),
    });
    return reply.status(201).send(await respond(user.toObject()));
  });

  // Empresas entram como "pendente" e só publicam vagas depois da aprovação do admin
  app.post('/register-company', async (request, reply) => {
    const { password, acceptedTerms: _, cnpj, city, website, description, ...data } = parse(
      registerCompanySchema,
      request.body,
    );
    await assertAvailable(data);
    const user = await User.create({
      ...data,
      role: 'empresa',
      company: { cnpj, city, website, description, status: 'pendente' },
      passwordHash: await bcrypt.hash(password, 10),
      acceptedTermsAt: new Date(),
    });
    return reply.status(201).send(await respond(user.toObject()));
  });

  app.post('/login', async (request) => {
    const { identifier, password } = parse(loginSchema, request.body);
    // Nome de usuário não pode ter "@", então se tiver é e-mail
    const filter = identifier.includes('@') ? { email: identifier } : { username: identifier };
    const user = await User.findOne(filter).select('+passwordHash').lean();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Usuário ou senha incorretos');
    }
    if (user.blocked) throw new HttpError(403, 'Esta conta foi bloqueada. Fale com a administração.');
    return respond(user);
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    const user = await User.findById(request.account!.id).lean();
    if (!user) throw notFound('Usuário');
    return toMe(user);
  });

  app.patch('/me', { onRequest: [app.authenticate] }, async (request) => {
    const { course, ...data } = parse(updateProfileSchema, request.body);
    await assertAvailable({ username: data.username }, request.account!.id);
    const update = course === null ? { ...data, $unset: { course: 1 } } : { ...data, course };
    const user = await User.findByIdAndUpdate(request.account!.id, update, { returnDocument: 'after' }).lean();
    if (!user) throw notFound('Usuário');
    return toMe(user);
  });
}
