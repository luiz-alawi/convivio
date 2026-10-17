// Um hook por recurso da API. As telas só chamam estes hooks.
import type {
  CheckInResult,
  Course,
  CreatePostInput,
  Job,
  Me,
  Passage,
  Place,
  PlaceCategory,
  Post,
  PublicUser,
  Trip,
  UpdateProfileInput,
  Video,
} from '@convivio/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const qs = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => !!e[1]);
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

// --- usuário logado ---

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/auth/me') });

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api<Me>('/auth/me', { method: 'PATCH', body: input }),
    onSuccess: (me) => client.setQueryData(['me'], me),
  });
}

export function useCheckIn() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api<CheckInResult>('/checkin', { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['me'] }),
  });
}

/** Ações que dão pontos (visitar lugar, assistir vídeo, ler passagem...). Atualiza o perfil depois. */
export function usePointsAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => api<{ pointsAwarded: number }>(path, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['me'] }),
  });
}

// --- conteúdo ---

export const usePlaces = (category?: PlaceCategory) =>
  useQuery({ queryKey: ['places', category], queryFn: () => api<Place[]>(`/places${qs({ category })}`) });

export const useTrips = () => useQuery({ queryKey: ['trips'], queryFn: () => api<Trip[]>('/trips') });

export const useTrip = (id?: string) =>
  useQuery({ queryKey: ['trips', id], queryFn: () => api<Trip>(`/trips/${id}`), enabled: !!id });

export const useVideos = (course?: Course) =>
  useQuery({ queryKey: ['videos', course], queryFn: () => api<Video[]>(`/videos${qs({ course })}`) });

export const useJobs = () => useQuery({ queryKey: ['jobs'], queryFn: () => api<Job[]>('/jobs') });

export const usePassageOfTheDay = () =>
  useQuery({ queryKey: ['passages', 'today'], queryFn: () => api<Passage>('/passages/today') });

export const usePassages = () => useQuery({ queryKey: ['passages'], queryFn: () => api<Passage[]>('/passages') });

// --- social ---

export type FeedScope = 'todos' | 'seguindo';

export const useFeed = (scope: FeedScope) =>
  useQuery({ queryKey: ['posts', scope], queryFn: () => api<Post[]>(`/posts${qs({ scope })}`) });

export function useCreatePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => api<Post>('/posts', { method: 'POST', body: input }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['posts'] });
      client.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useToggleLike() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (post: Post) => api(`/posts/${post.id}/like`, { method: post.likedByMe ? 'DELETE' : 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useReportPost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api(`/posts/${id}/report`, { method: 'POST', body: { reason } }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export const useUsers = (search: string) =>
  useQuery({ queryKey: ['users', search], queryFn: () => api<PublicUser[]>(`/users${qs({ search })}`) });

export const useUser = (id: string) =>
  useQuery({ queryKey: ['users', 'detail', id], queryFn: () => api<PublicUser>(`/users/${id}`) });

export const useUserGallery = (id: string) =>
  useQuery({ queryKey: ['users', 'detail', id, 'posts'], queryFn: () => api<Post[]>(`/users/${id}/posts`) });

export function useToggleFollow() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, following }: { id: string; following: boolean }) =>
      api(`/users/${id}/follow`, { method: following ? 'DELETE' : 'POST' }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['me'] });
      client.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
