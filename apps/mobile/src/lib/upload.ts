import type { UploadKind, UploadSignature } from '@convivio/shared';
import * as ImagePicker from 'expo-image-picker';
import { api, ApiError } from './api';

/**
 * Abre a galeria, e envia a foto escolhida direto para o Cloudinary com uma assinatura gerada pela API.
 * Retorna a URL pública da imagem, ou null se a pessoa cancelar.
 */
export async function pickAndUploadImage(kind: UploadKind): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new ApiError(0, 'Permita o acesso às fotos nas configurações do celular');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: kind === 'avatar' ? [1, 1] : [4, 5],
    quality: 0.7,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];

  const sig = await api<UploadSignature>(`/uploads/signature?kind=${kind}`);
  const form = new FormData();
  // React Native aceita { uri, name, type } como arquivo no FormData
  form.append('file', { uri: asset.uri, name: asset.fileName ?? 'foto.jpg', type: asset.mimeType ?? 'image/jpeg' } as never);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const response = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.secure_url) {
    throw new ApiError(response.status, data?.error?.message ?? 'Não foi possível enviar a foto');
  }
  return data.secure_url as string;
}
