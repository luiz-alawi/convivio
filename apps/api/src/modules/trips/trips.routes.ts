import type { FastifyInstance } from 'fastify';
import { assertObjectId, notFound } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { TripModel, toTrip } from './trip.model';

export async function tripsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const trips = await TripModel.find().sort({ date: -1 }).lean();
    return trips.map(toTrip);
  });

  app.get<{ Params: { id: string } }>('/:id', { onRequest: [app.optionalAuth] }, async (request) => {
    assertObjectId(request.params.id, 'Viagem');
    const trip = await TripModel.findById(request.params.id).lean();
    if (!trip) throw notFound('Viagem');
    if (request.user) await awardPoints(request.user.sub, 'view_trip', request.params.id);
    return toTrip(trip);
  });
}
