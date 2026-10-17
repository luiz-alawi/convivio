import { COURSES, type Video } from '@convivio/shared';
import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

// Pilar Estudo: videoaulas curtas (estilo TikTok) por curso
const videoSchema = new Schema(
  {
    title: { type: String, required: true },
    course: { type: String, enum: COURSES, required: true },
    professor: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: String,
    durationSec: { type: Number, required: true },
  },
  { timestamps: true },
);

export const VideoModel = model('Video', videoSchema);
type VideoDoc = InferSchemaType<typeof videoSchema> & { _id: Types.ObjectId };

export const toVideo = (v: VideoDoc): Video => ({
  id: v._id.toString(),
  title: v.title,
  course: v.course,
  professor: v.professor,
  url: v.url,
  thumbnailUrl: v.thumbnailUrl ?? undefined,
  durationSec: v.durationSec,
});
