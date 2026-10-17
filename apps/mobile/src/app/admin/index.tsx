import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorState, Loading } from '@/components';
import { useAdminStats } from '@/hooks/queries';
import { brandGradient, colors, font, fonts, pillarTheme, radius, shadow, spacing, type IconName } from '@/theme';

export default function AdminHome() {
  const stats = useAdminStats();

  if (stats.isLoading) return <Loading />;
  if (!stats.data) return <ErrorState error={stats.error} onRetry={stats.refetch} />;
  const s = stats.data;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={stats.isRefetching} onRefresh={stats.refetch} />}
    >
      <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Ionicons name="shield-checkmark" size={28} color={colors.primaryText} />
        <Text style={styles.heroTitle}>Visão geral</Text>
        <Text style={styles.heroText}>
          {s.pendingCompanies > 0 || s.reportedPosts > 0
            ? `${s.pendingCompanies} empresa(s) aguardando e ${s.reportedPosts} post(s) denunciado(s)`
            : 'Nada pendente. Tudo em ordem! ✨'}
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        <Tile icon="business" label="Empresas pendentes" value={s.pendingCompanies} color={colors.warning} href="/admin/empresas" highlight={s.pendingCompanies > 0} />
        <Tile icon="flag" label="Posts denunciados" value={s.reportedPosts} color={colors.danger} href="/admin/denuncias" highlight={s.reportedPosts > 0} />
        <Tile icon="people" label="Usuários" value={s.users} color={pillarTheme.internacionalidade.color} href="/admin/usuarios" />
        <Tile icon="storefront" label="Empresas" value={s.companies} color={pillarTheme.ciencia.color} href="/admin/empresas" />
        <Tile icon="briefcase" label="Vagas publicadas" value={s.jobs} color={pillarTheme.trabalho.color} href="/admin/vagas" />
      </View>

      <Text style={font.caption}>
        TODO: cadastro de lugares, viagens, videoaulas e passagens pelo app (hoje é pelo seed da API).
      </Text>
      <Button title="Voltar ao app" icon="arrow-back" variant="soft" onPress={() => router.navigate('/')} />
    </ScrollView>
  );
}

function Tile(props: { icon: IconName; label: string; value: number; color: string; href: string; highlight?: boolean }) {
  const { icon, label, value, color, href, highlight } = props;
  return (
    <Pressable
      onPress={() => router.push(href as Href)}
      style={({ pressed }) => [styles.tile, highlight && { borderColor: color }, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={font.caption}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hero: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.primaryText, marginTop: spacing.sm },
  heroText: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.88)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  tileValue: { fontFamily: fonts.extrabold, fontSize: 28, color: colors.text },
});
