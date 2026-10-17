import { PLACE_CATEGORIES, type Place } from '@convivio/shared';
import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import { geoPointSchema } from '../../lib/geo';

// Guia da região (aba Explorar)
const placeSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: PLACE_CATEGORIES, required: true },
    description: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    location: { type: geoPointSchema, required: true },
    imageUrl: String,
    phone: String,
    instagram: String,
    partner: { type: Boolean, default: false }, // estabelecimento parceiro (destaque pago)
    highlight: String, // dica/destaque mostrado no card
  },
  { timestamps: true },
);

export const PlaceModel = model('Place', placeSchema);
type PlaceDoc = InferSchemaType<typeof placeSchema> & { _id: Types.ObjectId };

export const toPlace = (p: PlaceDoc): Place => ({
  id: p._id.toString(),
  name: p.name,
  category: p.category,
  description: p.description,
  address: p.address ?? undefined,
  city: p.city,
  location: { latitude: p.location.latitude, longitude: p.location.longitude },
  imageUrl: p.imageUrl ?? undefined,
  phone: p.phone ?? undefined,
  instagram: p.instagram ?? undefined,
  partner: p.partner,
  highlight: p.highlight ?? undefined,
});
