# Convivio — os cinco pilares

App universitário da AMF (Start Cup) que une **guia da região** (Recanto Maestro e Quarta Colônia) com a **vivência dos cinco pilares**: internacionalidade, alta moralidade, trabalho, ciência e estudo. Roda em Android e iOS.

> Este repositório tem, por enquanto, só a **estrutura base** do projeto. As telas e os módulos da API entram a partir da branch `dev`.

## Stack

| Camada | Escolha |
| --- | --- |
| App | Expo SDK 57 + React Native + TypeScript, Expo Router (rotas por arquivos) |
| Estilo | `StyleSheet` + tema próprio com as cores do logo (`apps/mobile/src/theme`) |
| Dados no app | TanStack Query |
| Mapas | `react-native-maps` (funciona no Expo Go sem chave) |
| API | Fastify + TypeScript |
| Banco | MongoDB Atlas + Mongoose |
| Auth | E-mail e senha (bcrypt + JWT), token no `expo-secure-store` |
| Validação | Zod, compartilhado entre app e API (`packages/shared`) |

> **Por que SDK 57 e não 58?** Hoje o Expo Go das lojas ainda não suporta o SDK 58. Com o 57 dá para testar direto no celular.

## Estrutura

```
apps/
  mobile/                 App Expo
    src/app/              rotas (cada arquivo é uma tela)
    src/components/       componentes reutilizáveis
    src/hooks/            hooks de dados (TanStack Query)
    src/lib/              cliente HTTP da API, config
    src/theme/            cores, espaçamentos, fontes
  api/                    API Fastify
    src/modules/          um módulo por recurso (model Mongoose + rotas)
    src/lib/              utilitários (erros HTTP)
    src/app.ts            registro de plugins e rotas
    src/server.ts         conecta no MongoDB e sobe o servidor
packages/
  shared/                 código compartilhado entre app e API (pilares, tipos, schemas)
```

## Rodando

Pré-requisitos: Node 22+ e o app **Expo Go** no celular.

```bash
npm install
```

### API

1. Crie um cluster gratuito no [MongoDB Atlas](https://www.mongodb.com/atlas) e libere o acesso de rede (Network Access).
2. Copie `apps/api/.env.example` para `apps/api/.env` e preencha `MONGODB_URI` e `JWT_SECRET`.
3. Suba a API:

```bash
npm run dev:api
```

Ela fica em `http://0.0.0.0:3333`. Teste com `GET /health`.

### App

```bash
npm run dev:mobile
```

Escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS). O celular precisa estar na **mesma Wi-Fi** do notebook. O app descobre sozinho o IP do notebook para falar com a API. Se a rede bloquear, rode `npx expo start --tunnel` em `apps/mobile` e defina `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` (veja `.env.example`).

### Checagem de tipos

```bash
npm run typecheck
```

## Git

- `main`: versão estável, a que vai para a demo.
- `dev`: integração do dia a dia. Crie branches a partir de `dev` (`feat/explorar`, `fix/login`…) e abra PR para `dev`. Quando estiver estável, faça merge de `dev` em `main`.
