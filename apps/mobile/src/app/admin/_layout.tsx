import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { stackScreenOptions } from '@/lib/navigation';
import { colors } from '@/theme';

// Painel do administrador (só aparece para contas admin)
export default function AdminLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Painel do administrador',
          // Primeira tela da pilha não ganha seta sozinha: volta ao app
          headerLeft: () => (
            <Pressable onPress={() => router.navigate('/')} accessibilityLabel="Voltar ao app" hitSlop={10}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="empresas" options={{ title: 'Empresas' }} />
      <Stack.Screen name="usuarios" options={{ title: 'Usuários' }} />
      <Stack.Screen name="denuncias" options={{ title: 'Denúncias' }} />
      <Stack.Screen name="vagas" options={{ title: 'Vagas' }} />
    </Stack>
  );
}
