// Formatos que a API devolve em JSON (ids como string, datas em ISO).
import type {
  AccountRole,
  CompanyStatus,
  Course,
  JobType,
  PlaceCategory,
  PostKind,
  UploadKind,
  UserProfile,
} from './constants';
import type { PillarPoints } from './pillars';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CompanyInfo {
  cnpj: string;
  description?: string;
  website?: string;
  city?: string;
  status: CompanyStatus;
}

export interface PublicUser {
  id: string;
  name: string;
  username?: string;
  role: AccountRole;
  profile?: UserProfile;
  course?: Course;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  points: PillarPoints;
  followersCount: number;
  followingCount: number;
}

export interface Me extends PublicUser {
  email: string;
  phone?: string;
  streak: number;
  lastCheckInAt?: string;
  following: string[];
  company?: CompanyInfo;
}

export interface AuthResponse {
  token: string;
  user: Me;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address?: string;
  city: string;
  location: GeoPoint;
  imageUrl?: string;
  phone?: string;
  instagram?: string;
  partner: boolean;
  highlight?: string;
}

export interface TripMedia {
  type: 'foto' | 'video';
  url: string;
  caption?: string;
}

export interface TripStory {
  authorName: string;
  text: string;
}

export interface Trip {
  id: string;
  title: string;
  city: string;
  country: string;
  location: GeoPoint;
  date: string;
  kind: 'amf' | 'aluno';
  summary: string;
  history?: string;
  coverUrl?: string;
  media: TripMedia[];
  stories: TripStory[];
}

export interface Video {
  id: string;
  title: string;
  course: Course;
  professor: string;
  url: string;
  thumbnailUrl?: string;
  durationSec: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: JobType;
  description: string;
  contact: string;
  city?: string;
  createdAt: string;
}

export interface Passage {
  id: string;
  text: string;
  book: {
    title: string;
    author: string;
    purchaseUrl?: string;
  };
}

export type PostAuthor = Pick<PublicUser, 'id' | 'name' | 'username' | 'avatarUrl'>;

export interface Post {
  id: string;
  author: PostAuthor;
  kind: PostKind;
  imageUrl: string;
  caption?: string;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface CheckInResult {
  alreadyCheckedIn: boolean;
  streak: number;
  pointsAwarded: number;
}

/** Parâmetros assinados para o app enviar a imagem direto ao Cloudinary. */
export interface UploadSignature {
  kind: UploadKind;
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

// --- administração ---

export interface AdminUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: AccountRole;
  profile?: UserProfile;
  avatarUrl?: string;
  blocked: boolean;
  company?: CompanyInfo;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  companies: number;
  pendingCompanies: number;
  jobs: number;
  reportedPosts: number;
}

export interface ReportedPost extends Post {
  hidden: boolean;
  reports: { reason: string }[];
}
