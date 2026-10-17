import { Stack } from 'expo-router';
import { colors, pillarColors } from '@/theme';

export default function PillarsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Pilares',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="internacionalidade"
        options={{ title: 'Internacionalidade', headerTintColor: pillarColors.internacionalidade }}
      />
      <Stack.Screen name="estudo" options={{ title: 'Estudo', headerTintColor: pillarColors.estudo }} />
      <Stack.Screen name="trabalho" options={{ title: 'Trabalho', headerTintColor: pillarColors.trabalho }} />
      <Stack.Screen name="ciencia" options={{ title: 'Ciência', headerTintColor: pillarColors.ciencia }} />
      <Stack.Screen name="moralidade" options={{ title: 'Alta moralidade', headerTintColor: pillarColors.moralidade }} />
    </Stack>
  );
}
