import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/lib/navigation';

// Área de usuários (e admins): as abas dos pilares + telas que abrem por cima delas
export default function AppLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="explorar" options={{ title: 'Explorar a região' }} />
      <Stack.Screen name="perfil" options={{ title: 'Meu perfil' }} />
      <Stack.Screen name="editar-perfil" options={{ title: 'Editar perfil', presentation: 'modal' }} />
      <Stack.Screen name="usuario/[id]" options={{ title: 'Perfil' }} />
    </Stack>
  );
}
