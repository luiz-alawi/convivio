import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/lib/navigation';

export default function AuthLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="cadastro-empresa" options={{ title: 'Cadastro de empresa' }} />
    </Stack>
  );
}