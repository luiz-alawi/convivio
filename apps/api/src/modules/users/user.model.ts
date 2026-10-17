import {
  ACCOUNT_ROLES,
  COMPANY_STATUSES,
  COURSES,
  PILLAR_IDS,
  USER_PROFILES,
  type AdminUser,
  type CompanyInfo,
  type Me,
  type PublicUser,
} from '@convivio/shared';
import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const pointsSchema = new Schema(
  Object.fromEntries(PILLAR_IDS.map((p) => [p, { type: Number, default: 0 }])),
  { _id: false },
);

const companySchema = new Schema(
  {
    cnpj: { type: String, required: true },
    description: String,
    website: String,
    city: String,
    status: { type: String, enum: COMPANY_STATUSES, default: 'pendente' },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ACCOUNT_ROLES, default: 'usuario' },
    profile: { type: String, enum: USER_PROFILES }, // só para role "usuario"
    company: companySchema, // só para role "empresa"
    course: { type: String, enum: COURSES },
    phone: String,
    bio: String,
    avatarUrl: String,
    skills: { type: [String], default: [] },
    points: { type: pointsSchema, default: () => ({}) },
    streak: { type: Number, default: 0 },
    lastCheckInAt: Date,
    following: [{ type: Types.ObjectId, ref: 'User' }],
    blocked: { type: Boolean, default: false },
    acceptedTermsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

userSchema.index({ following: 1 });
userSchema.index({ username: 1 }, { unique: true, partialFilterExpression: { username: { $type: 'string' } } });

export const User = model('User', userSchema);
export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId; createdAt: Date };

const toCompany = (user: UserDoc): CompanyInfo | undefined =>
  user.company
    ? {
        cnpj: user.company.cnpj,
        description: user.company.description ?? undefined,
        website: user.company.website ?? undefined,
        city: user.company.city ?? undefined,
        status: user.company.status,
      }
    : undefined;

export async function toPublicUser(user: UserDoc): Promise<PublicUser> {
  const followersCount = await User.countDocuments({ following: user._id });
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username ?? undefined,
    role: user.role,
    profile: user.profile ?? undefined,
    course: user.course ?? undefined,
    bio: user.bio ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    skills: user.skills,
    points: {
      internacionalidade: user.points?.internacionalidade ?? 0,
      estudo: user.points?.estudo ?? 0,
      trabalho: user.points?.trabalho ?? 0,
      ciencia: user.points?.ciencia ?? 0,
      moralidade: user.points?.moralidade ?? 0,
    },
    followersCount,
    followingCount: user.following.length,
  };
}

export async function toMe(user: UserDoc): Promise<Me> {
  return {
    ...(await toPublicUser(user)),
    email: user.email,
    phone: user.phone ?? undefined,
    streak: user.streak,
    lastCheckInAt: user.lastCheckInAt?.toISOString(),
    following: user.following.map((id) => id.toString()),
    company: toCompany(user),
  };
}

export const toAdminUser = (user: UserDoc): AdminUser => ({
  id: user._id.toString(),
  name: user.name,
  username: user.username ?? undefined,
  email: user.email,
  phone: user.phone ?? undefined,
  role: user.role,
  profile: user.profile ?? undefined,
  avatarUrl: user.avatarUrl ?? undefined,
  blocked: user.blocked,
  company: toCompany(user),
  createdAt: user.createdAt.toISOString(),
});
