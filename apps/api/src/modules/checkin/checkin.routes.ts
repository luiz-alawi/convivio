import { POINT_ACTIONS, type CheckInResult } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { notFound } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { User } from '../users/user.model';

// Dia no fuso do Recanto Maestro, no formato YYYY-MM-DD
const dayKey = (date: Date) => date.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

export async function checkinRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, async (request): Promise<CheckInResult> => {
    const user = await User.findById(request.user.sub);
    if (!user) throw notFound('Usuário');

    const now = new Date();
    const today = dayKey(now);
    const last = user.lastCheckInAt ? dayKey(user.lastCheckInAt) : null;

    if (last === today) {
      return { alreadyCheckedIn: true, streak: user.streak, pointsAwarded: 0 };
    }

    const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    user.streak = last === yesterday ? user.streak + 1 : 1;
    user.lastCheckInAt = now;
    await user.save();

    const awarded = await awardPoints(user.id, 'checkin', today);
    return {
      alreadyCheckedIn: false,
      streak: user.streak,
      pointsAwarded: awarded ? POINT_ACTIONS.checkin.points : 0,
    };
  });
}
