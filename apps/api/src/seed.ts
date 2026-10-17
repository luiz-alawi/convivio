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

// Vídeos públicos de teste (substituir pelas videoaulas dos professores)
const SAMPLE_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', // CC0
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', // CC-BY Blender Foundation
];

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
  { title: 'Videoaula de exemplo 1', course: 'Gastronomia', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEOS[0]!, durationSec: 6 },
  { title: 'Videoaula de exemplo 2', course: 'Hotelaria', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEOS[1]!, durationSec: 10 },
  { title: 'Videoaula de exemplo 3', course: 'Sistemas de Informação', professor: 'Professor(a) [confirmar]', url: SAMPLE_VIDEOS[0]!, durationSec: 6 },
];

const jobs = [
  {
    title: 'Recepcionista',
    company: 'Hotel Demo [confirmar]',
    type: 'vaga',
    description: 'Vaga de exemplo — o hotel está sempre contratando. [confirmar detalhes]',
    contact: 'contato@exemplo.com',
    city: 'Recanto Maestro',
  },
  {
    title: 'Garçom/garçonete para eventos',
    company: 'Hotel Demo [confirmar]',
    type: 'freela',
    description: 'Freela de exemplo para fins de semana.',
    contact: 'contato@exemplo.com',
    city: 'Quarta Colônia',
  },
  {
    title: 'Fotógrafo(a) de eventos',
    company: 'Hotel Demo [confirmar]',
    type: 'freela',
    description: 'Freela de exemplo para cobertura de eventos.',
    contact: 'contato@exemplo.com',
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

// Contas para a demo do pitch, uma de cada tipo (senhas só para ambiente de teste)
const DEMO_ACCOUNTS = [
  {
    name: 'Aluno Demo',
    username: 'demo',
    email: 'demo@convivio.app',
    password: 'convivio-demo',
    role: 'usuario',
    profile: 'aluno',
    course: 'Sistemas de Informação',
  },
  {
    name: 'Hotel Demo [confirmar]',
    email: 'empresa@convivio.app',
    password: 'convivio-empresa',
    role: 'empresa',
    company: { cnpj: '00000000000000', city: 'Recanto Maestro', status: 'aprovada' },
  },
  {
    name: 'Administração Convivio',
    username: 'admin',
    email: 'admin@convivio.app',
    password: 'convivio-admin',
    role: 'admin',
  },
] as const;

async function upsertAccount({ password, ...account }: (typeof DEMO_ACCOUNTS)[number]) {
  await User.updateOne(
    { email: account.email },
    {
      $set: account,
      $setOnInsert: { passwordHash: await bcrypt.hash(password, 10), acceptedTermsAt: new Date() },
    },
    { upsert: true },
  );
  return User.findOne({ email: account.email }).lean();
}

async function main() {
  await connectDb();

  // Migração: contas criadas antes dos papéis usavam "role" para o vínculo (aluno, visitante...)
  const migrated = await User.updateMany(
    { role: { $nin: ['usuario', 'empresa', 'admin'] } },
    [{ $set: { profile: '$role', role: 'usuario' } }],
    { updatePipeline: true },
  );
  await User.syncIndexes();

  await Promise.all([
    PlaceModel.deleteMany({}),
    TripModel.deleteMany({}),
    VideoModel.deleteMany({}),
    JobModel.deleteMany({}),
    PassageModel.deleteMany({}),
  ]);

  const [, company] = await Promise.all(DEMO_ACCOUNTS.map(upsertAccount));

  await PlaceModel.insertMany(places);
  await TripModel.insertMany(trips);
  await VideoModel.insertMany(videos);
  await JobModel.insertMany(jobs.map((job) => ({ ...job, createdBy: company?._id })));
  await PassageModel.insertMany(passages);

  console.log(
    `Seed ok: ${places.length} lugares, ${trips.length} viagens, ${videos.length} vídeos, ${jobs.length} vagas, ${passages.length} passagens.`,
  );
  if (migrated.modifiedCount) console.log(`${migrated.modifiedCount} conta(s) antiga(s) migrada(s) para o papel "usuario".`);
  console.log(`Contas demo: ${DEMO_ACCOUNTS.map((a) => `${a.email} (${a.role})`).join(', ')}`);
  await disconnectDb();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
