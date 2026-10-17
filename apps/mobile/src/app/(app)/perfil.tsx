import { PILLARS } from '@convivio/shared';
import { router, type Href } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Card, ErrorState, Loading, PillarProgress, PillarRadar, ProfileHeader } from '@/components';
import { useMe } from '@/hooks/queries';
import { colors, font, spacing } from '@/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const me = useMe();

  if (me.isLoading) return <Loading />;
  if (!me.data) return <ErrorState error={me.error} onRetry={me.refetch} />;

  const user = me.data;
  const total = Object.values(user.points).reduce((a, b) => a + b, 0);
  const strongest = PILLARS.reduce((best, p) => (user.points[p.id] > user.points[best.id] ? p : best));

  const confirmSignOut = () =>
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ProfileHeader user={user} streak={user.streak}>
        <View style={styles.actions}>
          <Button title="Editar perfil" icon="create-outline" variant="soft" size="sm" onPress={() => router.push('/editar-perfil')} />
          {user.role === 'admin' && (
            <Button title="Painel admin" icon="shield-checkmark" size="sm" onPress={() => router.push('/admin' as Href)} />
          )}
        </View>
      </ProfileHeader>

      <Card style={styles.center}>
        <Text style={font.heading}>Seus cinco pilares</Text>
        <Text style={font.caption}>
          {total > 0 ? `Mais forte em ${strongest.name}` : 'Use o app para pontuar nos pilares!'}
        </Text>
        <PillarRadar points={user.points} />
      </Card>

      <Card>
        <PillarProgress points={user.points} />
      </Card>

      <Button title="Sair da conta" icon="log-out-outline" variant="ghost" color={colors.danger} onPress={confirmSignOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
