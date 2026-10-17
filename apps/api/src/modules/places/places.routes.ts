import { PLACE_CATEGORIES } from '@convivio/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { assertObjectId, notFound, parse } from '../../lib/http';
import { awardPoints } from '../../lib/points';
import { PlaceModel, toPlace } from './place.model';

const listQuery = z.object({ category: z.enum(PLACE_CATEGORIES).optional() });

export async function placesRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { category } = parse(listQuery, request.query);
    const places = await PlaceModel.find(category ? { category } : {})
      .sort({ partner: -1, name: 1 })
      .lean();
    return places.map(toPlace);
  });

  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    assertObjectId(request.params.id, 'Lugar');
    const place = await PlaceModel.findById(request.params.id).lean();
    if (!place) throw notFound('Lugar');
    return toPlace(place);
  });

  // "Estive aqui" — pontua em Internacionalidade.
  // TODO: validar presença pela localização do aparelho.
  app.post<{ Params: { id: string } }>('/:id/visit', { onRequest: [app.authenticate] }, async (request) => {
    assertObjectId(request.params.id, 'Lugar');
    if (!(await PlaceModel.exists({ _id: request.params.id }))) throw notFound('Lugar');
    return { pointsAwarded: await awardPoints(request.account!.id, 'visit_place', request.params.id) };
  });
}
