import { PILLAR_IDS, POINT_ACTIONS, type PointAction } from '@convivio/shared';
import { Activity } from '../modules/users/activity.model';
import { User } from '../modules/users/user.model';

/**
 * Dá os pontos da ação para o usuário. Cada (ação, item) só pontua uma vez —
 * o índice único em Activity garante isso. Retorna quantos pontos foram dados (0 se repetido).
 */
export async function awardPoints(userId: string, action: PointAction, refId: string) {
  const rule = POINT_ACTIONS[action];
  try {
    await Activity.create({ user: userId, action, refId, points: rule.points });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return 0;
    throw error;
  }

  const pillars = rule.pillar === 'all' ? PILLAR_IDS : [rule.pillar];
  const inc = Object.fromEntries(pillars.map((p) => [`points.${p}`, rule.points]));
  await User.updateOne({ _id: userId }, { $inc: inc });
  return rule.points;
}
