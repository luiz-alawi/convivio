import { POST_KINDS, type Post, type PostKind } from '@convivio/shared';
import { Schema, Types, model } from 'mongoose';

// Pilar Alta moralidade: momentos de bons hábitos (BeReal) e galeria pessoal (Pinterest)
const postSchema = new Schema(
  {
    author: { type: Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: POST_KINDS, required: true },
    imageUrl: { type: String, required: true },
    caption: String,
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    reports: [{ _id: false, user: { type: Types.ObjectId, ref: 'User' }, reason: String }],
    hidden: { type: Boolean, default: false }, // escondido pela moderação
    expiresAt: Date, // só para "momento"; o MongoDB apaga sozinho após 24h
  },
  { timestamps: true },
);

postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
postSchema.index({ createdAt: -1 });

export const PostModel = model('Post', postSchema);

/** Quantas denúncias escondem um post automaticamente até alguém da moderação revisar. */
export const REPORTS_TO_HIDE = 3;

interface PopulatedPost {
  _id: Types.ObjectId;
  author: unknown;
  kind: PostKind;
  imageUrl: string;
  caption?: string | null;
  likes: Types.ObjectId[];
  createdAt: Date;
  expiresAt?: Date | null;
}

export function toPost(p: PopulatedPost, viewerId: string): Post {
  const author = p.author as { _id: Types.ObjectId; name: string; avatarUrl?: string | null };
  return {
    id: p._id.toString(),
    author: { id: author._id.toString(), name: author.name, avatarUrl: author.avatarUrl ?? undefined },
    kind: p.kind,
    imageUrl: p.imageUrl,
    caption: p.caption ?? undefined,
    likesCount: p.likes.length,
    likedByMe: p.likes.some((id) => id.toString() === viewerId),
    createdAt: p.createdAt.toISOString(),
    expiresAt: p.expiresAt?.toISOString(),
  };
}
