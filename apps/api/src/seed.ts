// Popula o banco com dados de exemplo para a demo: npm run seed
// Apaga e recria o conteúdo (lugares, viagens, vídeos, vagas, passagens). Usuários e posts não são apagados.
//
// TODO (equipe): o PDF diz que a lista final de lugares, viagens, vagas e passagens ainda será definida.
// Tudo que está marcado com [confirmar] precisa ser revisado com dados reais (endereço, coordenadas, contato).
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './db';
import { JobModel } from './modules/jobs/job.model';
import { PassageModel } from './modules/passages/passage.model';
import { PlaceModel } from './modules/places/place.model';
import { TripModel } from './modules/trips/trip.model';
import { User } from './modules/users/user.model';
import { VideoModel } from './modules/videos/video.model';

// Coordenadas aproximadas da região — [confirmar] no Google Maps antes da demo
const RECANTO_MAESTRO = { latitude: -29.6879, longitude: -53.3874 };
const VALE_VENETO = { latitude: -29.6436, longitude: -53.4255 };

// Vídeo público de teste (substituir pelas videoaulas dos professores)
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const places = [
  {
    name: 'Colibri',
    category: 'restaurante',
    description: 'Descrição do Colibri [confirmar].',
    city: 'Recanto Maestro',
    location: RECANTO_MAESTRO,
    partner: true,
    highlight: 'Dica do parceiro [confirmar]',
  },
  {
    name: 'Monte Rei',
    category: 'passeio',
    description: 'Descrição do Monte Rei [confirmar categoria e texto].',
    city: 'Quarta Colônia',
    location: { latitude: RECANTO_MAESTRO.latitude + 0.01, longitude: RECANTO_MAESTRO.longitude + 0.01 },
    partner: false,
  },
  {
    name: 'Cafeteria Terraza',
    category: 'cafe',
    description: 'Cafeteria no Recanto Maestro [confirmar].',
    city: 'Recanto Maestro',
    location: { latitude: RECANTO_MAESTRO.latitude - 0.002, longitude: RECANTO_MAESTRO.longitude + 0.002 },
    partner: true,
  },
  {
    name: 'Quadra de pádel',
    category: 'esporte',
    description: 'Quadra de pádel para alugar em Vale Vêneto [confirmar nome e contato].',
    city: 'Vale Vêneto',
    location: VALE_VENETO,
    partner: false,
  },
  // TODO: completar com 1–2 hotéis/pousadas reais da região (o PDF pede 5–6 lugares na demo)
];

const trips = [
  {
    title: 'Viagem de exemplo — AMF',
    city: 'Cidade [confirmar]',
    country: 'Itália',
    location: { latitude: 41.9028, longitude: 12.4964 },
    date: new Date('2025-07-01'),
    kind: 'amf',
    summary: 'Resumo da viagem [substituir por uma viagem real da AMF].',
    history: 'Um pouco da história do lugar [preencher].',
    media: [],
    stories: [{ authorName: 'Aluno(a) [exemplo]', text: 'Relato de exemplo [substituir com autorização de uso].' }],
  },
  {
    title: 'Viagem de exemplo — alunos',
    city: 'Cidade [confirmar]',
    country: 'Rússia',
    location: { latitude: 55.7558, longitude: 37.6173 },
    date: new Date('2024-10-01'),
    kind: 'aluno',
    summary: 'Resumo da viagem [substituir].',
    media: [],
    stories: [],
  },
  {
    title: 'Viagem de exemplo — intercâmbio',
    city: 'Cidade [confirmar]',
    country: 'Estados Unidos',
    location: { latitude: 40.7128, longitude: -74.006 },
    date: new Date('2024-03-01'),
    kind: 'aluno',
    summary: 'Resumo da viagem [substituir].',
    media: [],
    stories: [],
  },
];

const videos = [
  { title: 'Videoaula de exemplo 1', course: 'Gastronomia', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEO, durationSec: 15 },
  { title: 'Videoaula de exemplo 2', course: 'Hotelaria', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEO, durationSec: 15 },
  { title: 'Videoaula de exemplo 3', course: 'Sistemas de Informação', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEO, durationSec: 15 },
];

const jobs = [
  {
    title: 'Recepcionista',
    company: 'Hotel da região [confirmar]',
    type: 'vaga',
    description: 'Vaga de exemplo — o hotel está sempre contratando. [confirmar detalhes]',
    contact: 'contato@exemplo.com',
    city: 'Recanto Maestro',
    status: 'aprovada',
  },
  {
    title: 'Garçom/garçonete para eventos',
    company: 'Restaurante parceiro [confirmar]',
    type: 'freela',
    description: 'Freela de exemplo para fins de semana.',
    contact: 'contato@exemplo.com',
    city: 'Quarta Colônia',
    status: 'aprovada',
  },
  {
    title: 'Fotógrafo(a) de eventos',
    company: 'Empresa da região [confirmar]',
    type: 'freela',
    description: 'Freela de exemplo para cobertura de eventos.',
    contact: 'contato@exemplo.com',
    status: 'aprovada',
  },
];

// Não inventar citações: usar trechos reais escolhidos pela equipe, com autorização.
const passages = [
  {
    text: 'Trecho de exemplo 1 — substituir por uma passagem escolhida pela equipe.',
    book: { title: 'Título do livro [confirmar]', author: 'Antonio Meneghetti', purchaseUrl: undefined },
  },
  {
    text: 'Trecho de exemplo 2 — substituir por uma passagem escolhida pela equipe.',
    book: { title: 'Título do livro [confirmar]', author: 'Antonio Meneghetti', purchaseUrl: undefined },
  },
];

// Usuário para a demo do pitch (senha só para ambiente de teste)
const DEMO_USER = { name: 'Aluno Demo', email: 'demo@convivio.app', password: 'convivio-demo' };

async function main() {
  await connectDb();

  await Promise.all([
    PlaceModel.deleteMany({}),
    TripModel.deleteMany({}),
    VideoModel.deleteMany({}),
    JobModel.deleteMany({}),
    PassageModel.deleteMany({}),
  ]);

  await PlaceModel.insertMany(places);
  await TripModel.insertMany(trips);
  await VideoModel.insertMany(videos);
  await JobModel.insertMany(jobs);
  await PassageModel.insertMany(passages);

  await User.updateOne(
    { email: DEMO_USER.email },
    {
      $setOnInsert: {
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        passwordHash: await bcrypt.hash(DEMO_USER.password, 10),
        role: 'aluno',
        course: 'Sistemas de Informação',
        acceptedTermsAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log(
    `Seed ok: ${places.length} lugares, ${trips.length} viagens, ${videos.length} vídeos, ${jobs.length} vagas, ${passages.length} passagens.`,
  );
  console.log(`Usuário demo: ${DEMO_USER.email}`);
  await disconnectDb();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
