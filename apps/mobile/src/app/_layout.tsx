import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { ErrorState, IntroSplash, Loading } from '@/components';
import { useMe } from '@/hooks/queries';
import { queryClient } from '@/lib/queryClient';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <RootNavigator />
          <IntroGate />
        </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Abertura animada toda vez que o app abre com alguém logado.
// Quem não está logado não vê: a tela de login já tem a própria animação.
function IntroGate() {
  const { status } = useAuth();
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);
  useEffect(() => {
    if (status === 'signedOut') setDone(true);
  }, [status]);
  if (done || status === 'signedOut') return null;
  return <IntroSplash onDone={finish} />;
}

// Cada tipo de conta vê uma parte do app:
//   usuario → (app)  ·  empresa → /empresa  ·  admin → (app) + /admin
function RootNavigator() {
  const { status } = useAuth();
  const signedIn = status === 'signedIn';
  const me = useMe({ enabled: signedIn });

  if (status === 'loading' || (signedIn && me.isLoading)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Loading />
      </View>
    );
  }
  if (signedIn && !me.data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ErrorState error={me.error} onRetry={me.refetch} />
      </View>
    );
  }

  const role = me.data?.role;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'usuario' || role === 'admin'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'empresa'}>
        <Stack.Screen name="empresa" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
