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
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { ErrorState, Loading } from '@/components';
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
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
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
