import Constants from 'expo-constants';

// Em desenvolvimento, se EXPO_PUBLIC_API_URL não estiver definido, usa o mesmo IP do Metro (o notebook)
// na porta 3333. Com `expo start --tunnel` isso não funciona — aí defina EXPO_PUBLIC_API_URL no .env.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (devHost ? `http://${devHost}:3333` : 'http://localhost:3333');
