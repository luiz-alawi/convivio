import { uploadKindSchema, type UploadSignature } from '@convivio/shared';
import { createHash } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { env } from '../../env';
import { HttpError, parse } from '../../lib/http';

// Upload assinado: a API só gera a assinatura, e o app envia a imagem direto para o Cloudinary.
// Assim a foto não passa pela API e o segredo do Cloudinary nunca vai para o celular.
export async function uploadsRoutes(app: FastifyInstance) {
  app.get('/signature', { onRequest: [app.authenticate] }, async (request): Promise<UploadSignature> => {
    const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = env;
    if (!cloud || !apiKey || !secret) {
      throw new HttpError(503, 'Upload de imagens ainda não configurado na API (Cloudinary)');
    }
    const { kind } = parse(uploadKindSchema, request.query);
    const folder = `convivio/${kind}s/${request.account!.id}`;
    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary: sha1 dos parâmetros em ordem alfabética + api_secret
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
    return {
      kind,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      apiKey,
      timestamp,
      folder,
      signature,
    };
  });
}
