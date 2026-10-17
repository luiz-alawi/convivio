import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/lib/navigation';

// Área das contas de empresa: status do cadastro, vagas publicadas e nova vaga
export default function CompanyLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nova-vaga" options={{ title: 'Nova vaga', presentation: 'modal' }} />
    </Stack>
  );
}
