# Convivio — os cinco pilares

App universitário da AMF (Start Cup) que une **guia da região** (Recanto Maestro e Quarta Colônia) com a **vivência dos cinco pilares**: internacionalidade, alta moralidade, trabalho, ciência e estudo. Roda em Android e iOS.

## Stack

| Camada | Escolha |
| --- | --- |
| App | Expo SDK 57 + React Native + TypeScript, Expo Router (rotas por arquivos) |
| Estilo | `StyleSheet` + tema próprio com as cores do logo (`apps/mobile/src/theme`) |
| Dados no app | TanStack Query |
| Mapas | `react-native-maps` (funciona no Expo Go sem chave) |
| API | Fastify + TypeScript |
| Banco | MongoDB Atlas + Mongoose |
| Auth | Cadastro/login com e-mail e senha (bcrypt + JWT), token guardado no `expo-secure-store` |
| Validação | Zod, compartilhado entre app e API (`packages/shared`) |

> **Por que SDK 57 e não 58?** No momento da criação, o Expo Go das lojas ainda não suportava o SDK 58. Com o 57 dá para testar direto no celular pelo Expo Go.

## Estrutura

```
apps/
  mobile/                 App Expo
    src/app/              Rotas (cada arquivo é uma tela)
      (auth)/             login, cadastro
      (tabs)/             Início, Explorar, Pilares, Perfil
        pilares/          hub + uma tela por pilar
      comunidade.tsx      busca de pessoas
      usuario/[id].tsx    perfil público
    src/components/       Button, Card, Chips, PillarFlower, PillarRadar…
    src/hooks/queries.ts  um hook por recurso da API
    src/auth/             AuthProvider (sessão)
    src/lib/              cliente HTTP, config, labels
    src/theme/            cores, espaçamentos, fontes
  api/                    API Fastify
    src/modules/<recurso>/  model (Mongoose) + rotas
    src/lib/              erros HTTP, pontos (gamificação)
    src/seed.ts           dados de exemplo
packages/
  shared/                 pilares, constantes, tipos e schemas Zod
```

## Rodando

Pré-requisitos: Node 22+ e o app **Expo Go** no celular.

```bash
npm install
```

### 1. API

1. Crie um cluster gratuito no [MongoDB Atlas](https://www.mongodb.com/atlas) e libere o acesso de rede (Network Access).
2. Copie `apps/api/.env.example` para `apps/api/.env` e preencha `MONGODB_URI` e `JWT_SECRET`.
3. Popule o banco e suba a API:

```bash
npm run seed
```

```bash
npm run dev:api
```

A API sobe em `http://0.0.0.0:3333` (`GET /health` para testar).

### 2. App

```bash
npm run dev:mobile
```

Escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS). O celular precisa estar **na mesma Wi-Fi** do notebook.

O app descobre sozinho o IP do notebook para chamar a API. Se a rede bloquear (Wi-Fi de evento costuma bloquear), use `npx expo start --tunnel` dentro de `apps/mobile` e defina `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` (veja `.env.example`) com uma URL pública da API.

Usuário de demo criado pelo seed: `demo@convivio.app` / `convivio-demo`.

### Outros comandos

```bash
npm run typecheck
```

## API

| Método | Rota | Auth | |
| --- | --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | — | cria conta / entra (retorna token) |
| GET/PATCH | `/auth/me` | ✓ | meu perfil |
| POST | `/checkin` | ✓ | check-in diário (+1 ponto em cada pilar) |
| GET | `/places?category=` | — | guia da região |
| POST | `/places/:id/visit` | ✓ | "estive aqui" |
| GET | `/trips`, `/trips/:id` | — | viagens (mapa de internacionalidade) |
| GET | `/videos?course=` · POST `/videos/:id/watched` | —/✓ | videoaulas |
| GET | `/jobs` · POST `/jobs` · POST `/jobs/:id/interest` | —/✓ | vagas e freelas (novas entram como pendentes) |
| GET | `/passages/today`, `/passages` · POST `/passages/:id/read` | —/✓ | passagens |
| GET/POST | `/posts?scope=todos\|seguindo` | ✓ | feed social; like, denúncia, exclusão |
| GET | `/users?search=`, `/users/:id`, `/users/:id/posts` | ✓ | comunidade e perfis |
| POST/DELETE | `/users/:id/follow` | ✓ | seguir |

Cada ação que pontua vale **uma vez por item** (tabela `activities`). As regras de pontos estão em `packages/shared/src/constants.ts`.

## Git

- `main`: versão estável, a que vai para a demo.
- `dev`: integração do dia a dia. Crie branches a partir de `dev` (`feat/explorar-mapa`, `fix/login`…) e abra PR para `dev`. Quando estiver estável, faça merge de `dev` em `main`.

## Pendências (decidir em equipe)

- Lista final de lugares, viagens, vagas e passagens. O seed tem dados marcados com `[confirmar]`, e as coordenadas são aproximadas.
- Storage de imagens e vídeos (Cloudinary, S3…). Hoje os posts recebem uma URL.
- Moderação: quem aprova vagas e revisa denúncias. Posts com 3 denúncias são escondidos automaticamente.
- Feed social só de amigos ou aberto a toda a comunidade AMF (os dois já existem).
- Termos de uso e política de privacidade (LGPD) e autorização de uso de imagem.
- Qual cor do logo representa cada pilar (`apps/mobile/src/theme/index.ts`).
- Deploy da API (Render/Railway) antes do pitch.
