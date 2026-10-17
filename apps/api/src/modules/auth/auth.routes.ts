import { loginSchema, registerSchema, updateProfileSchema, type AuthResponse } from '@convivio/shared';
import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import { HttpError, notFound, parse } from '../../lib/http';
import { User, toMe, type UserDoc } from '../users/user.model';

export async function authRoutes(app: FastifyInstance) {
  const respond = async (user: UserDoc): Promise<AuthResponse> => ({
    token: app.jwt.sign({ sub: user._id.toString() }),
    user: await toMe(user),
  });

  app.post('/register', async (request, reply) => {
    const { password, acceptedTerms: _, ...data } = parse(registerSchema, request.body);
    if (await User.exists({ email: data.email })) {
      throw new HttpError(409, 'Já existe uma conta com esse e-mail');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...data, passwordHash, acceptedTermsAt: new Date() });
    return reply.status(201).send(await respond(user.toObject()));
  });

  app.post('/login', async (request) => {
    const { email, password } = parse(loginSchema, request.body);
    const user = await User.findOne({ email }).select('+passwordHash').lean();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'E-mail ou senha incorretos');
    }
    return respond(user);
  });

  app.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    const user = await User.findById(request.user.sub).lean();
    if (!user) throw notFound('Usuário');
    return toMe(user);
  });

  app.patch('/me', { onRequest: [app.authenticate] }, async (request) => {
    const data = parse(updateProfileSchema, request.body);
    const user = await User.findByIdAndUpdate(request.user.sub, data, { new: true }).lean();
    if (!user) throw notFound('Usuário');
    return toMe(user);
  });
}
