import type { Trip } from '@convivio/shared';
import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import { geoPointSchema } from '../../lib/geo';

const mediaSchema = new Schema(
  {
    type: { type: String, enum: ['foto', 'video'], required: true },
    url: { type: String, required: true },
    caption: String,
  },
  { _id: false },
);

const storySchema = new Schema(
  {
    authorName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

// Pilar Internacionalidade: viagens da AMF e dos alunos, mostradas no mapa
const tripSchema = new Schema(
  {
    title: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    location: { type: geoPointSchema, required: true },
    date: { type: Date, required: true },
    kind: { type: String, enum: ['amf', 'aluno'], required: true },
    summary: { type: String, required: true },
    history: String, // um pouco da história do lugar
    coverUrl: String,
    media: { type: [mediaSchema], default: [] },
    stories: { type: [storySchema], default: [] }, // relatos dos alunos
  },
  { timestamps: true },
);

export const TripModel = model('Trip', tripSchema);
type TripDoc = InferSchemaType<typeof tripSchema> & { _id: Types.ObjectId };

export const toTrip = (t: TripDoc): Trip => ({
  id: t._id.toString(),
  title: t.title,
  city: t.city,
  country: t.country,
  location: { latitude: t.location.latitude, longitude: t.location.longitude },
  date: t.date.toISOString(),
  kind: t.kind,
  summary: t.summary,
  history: t.history ?? undefined,
  coverUrl: t.coverUrl ?? undefined,
  media: t.media.map((m) => ({ type: m.type, url: m.url, caption: m.caption ?? undefined })),
  stories: t.stories.map((s) => ({ authorName: s.authorName, text: s.text })),
});
