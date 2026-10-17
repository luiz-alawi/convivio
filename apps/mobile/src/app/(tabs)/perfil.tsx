import { PILLARS } from '@convivio/shared';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Card, ErrorState, Loading, PillarRadar, Screen } from '@/components';
import { useMe } from '@/hooks/queries';
import { roleLabels } from '@/lib/labels';
import { colors, font, pillarColors, spacing } from '@/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const me = useMe();

  if (me.isLoading) return <Loading />;
  if (!me.data) return <ErrorState error={me.error} onRetry={me.refetch} />;

  const user = me.data;
  const total = Object.values(user.points).reduce((a, b) => a + b, 0);
  const strongest = PILLARS.reduce((best, p) => (user.points[p.id] > user.points[best.id] ? p : best));

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={font.title}>{user.name}</Text>
        <Text style={font.caption}>
          {roleLabels[user.role]}
          {user.course ? ` · ${user.course}` : ''}
        </Text>
        {!!user.bio && <Text style={font.body}>{user.bio}</Text>}
        <Text style={font.caption}>
          {user.followersCount} seguidores · {user.followingCount} seguindo · {user.streak} dia(s) de sequência
        </Text>
      </View>

      <Card style={styles.center}>
        <Text style={font.heading}>Seus cinco pilares</Text>
        <PillarRadar points={user.points} />
        <Text style={font.caption}>
          {total > 0 ? `${total} pontos · mais forte em ${strongest.name}` : 'Use o app para pontuar nos pilares!'}
        </Text>
      </Card>

      <Card>
        {PILLARS.map((pillar) => (
          <View key={pillar.id} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: pillarColors[pillar.id] }]} />
            <Text style={[font.body, styles.flex]}>{pillar.name}</Text>
            <Text style={font.heading}>{user.points[pillar.id]}</Text>
          </View>
        ))}
      </Card>

      <Button title="Comunidade" variant="outline" onPress={() => router.push('/comunidade')} />
      {/* TODO: tela de editar perfil (useUpdateProfile já existe) */}
      <Button title="Sair" variant="ghost" color={colors.danger} onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  dot: { width: 12, height: 12, borderRadius: 6 },
  flex: { flex: 1 },
});
