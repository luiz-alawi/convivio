import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/lib/navigation';

// Painel do administrador (só aparece para contas admin)
export default function AdminLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Painel do administrador' }} />
      <Stack.Screen name="empresas" options={{ title: 'Empresas' }} />
      <Stack.Screen name="usuarios" options={{ title: 'Usuários' }} />
      <Stack.Screen name="denuncias" options={{ title: 'Denúncias' }} />
      <Stack.Screen name="vagas" options={{ title: 'Vagas' }} />
    </Stack>
  );
}
