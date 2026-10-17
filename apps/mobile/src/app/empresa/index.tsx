import Ionicons from '@expo/vector-icons/Ionicons';
import type { CompanyStatus, Job } from '@convivio/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthProvider';
import { Badge, Button, Card, Empty, ErrorState, IconButton, Loading } from '@/components';
import { useDeleteJob, useMe, useMyJobs } from '@/hooks/queries';
import { companyStatusLabels, formatCnpj, jobTypeLabels, timeAgo } from '@/lib/labels';
import { colors, font, fonts, pillarTheme, radius, spacing, type IconName } from '@/theme';

const statusStyle: Record<CompanyStatus, { color: string; icon: IconName; title: string; text: string }> = {
  pendente: {
    color: colors.warning,
    icon: 'time',
    title: 'Cadastro em análise',
    text: 'A administração está conferindo os dados da sua empresa. Assim que for aprovada, você poderá publicar vagas e freelas.',
  },
  recusada: {
    color: colors.danger,
    icon: 'close-circle',
    title: 'Cadastro recusado',
    text: 'Seu cadastro não foi aprovado. Entre em contato com a administração da AMF para mais informações.',
  },
  aprovada: { color: colors.success, icon: 'checkmark-circle', title: '', text: '' },
};

export default function CompanyHome() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const me = useMe();
  const status = me.data?.company?.status ?? 'pendente';
  const approved = status === 'aprovada';
  const jobs = useMyJobs();
  const remove = useDeleteJob();

  const confirmDelete = (job: Job) =>
    Alert.alert('Remover vaga', `Remover "${job.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove.mutate(job.id) },
    ]);

  const header = (
    <View style={styles.headerWrap}>
      <LinearGradient
        colors={pillarTheme.trabalho.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
      >
        <View style={styles.heroTop}>
          <Badge label="ÁREA DA EMPRESA" color="#FFFFFF" icon="business" />
          <IconButton icon="log-out-outline" label="Sair" color={colors.primaryText} background="rgba(255,255,255,0.2)" onPress={signOut} />
        </View>
        <Text style={styles.name}>{me.data?.name}</Text>
        {me.data?.company && <Text style={styles.cnpj}>CNPJ {formatCnpj(me.data.company.cnpj)}</Text>}
        <Badge label={companyStatusLabels[status].toUpperCase()} color={statusStyle[status].color} icon={statusStyle[status].icon} solid />
      </LinearGradient>

      {approved ? (
        <View style={styles.section}>
          <Button title="Publicar nova vaga" icon="add-circle" color={pillarTheme.trabalho.color} onPress={() => router.push('/empresa/nova-vaga' as Href)} />
          <Text style={font.heading}>Suas vagas</Text>
        </View>
      ) : (
        <Card style={styles.section}>
          <Ionicons name={statusStyle[status].icon} size={36} color={statusStyle[status].color} />
          <Text style={font.heading}>{statusStyle[status].title}</Text>
          <Text style={font.body}>{statusStyle[status].text}</Text>
          <Button title="Atualizar status" variant="soft" size="sm" icon="refresh" onPress={() => me.refetch()} />
        </Card>
      )}
    </View>
  );

  return (
    <FlatList
      data={approved ? jobs.data : []}
      keyExtractor={(j) => j.id}
      contentContainerStyle={styles.list}
      refreshing={jobs.isRefetching || me.isRefetching}
      onRefresh={() => {
        me.refetch();
        jobs.refetch();
      }}
      ListHeaderComponent={header}
      ListEmptyComponent={
        !approved ? null : jobs.isLoading ? (
          <Loading />
        ) : jobs.error ? (
          <ErrorState error={jobs.error} onRetry={jobs.refetch} />
        ) : (
          <Empty message="Você ainda não publicou nenhuma vaga." icon="briefcase-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card style={styles.job}>
          <View style={styles.jobRow}>
            <View style={styles.flex}>
              <Text style={font.heading}>{item.title}</Text>
              <Text style={font.caption}>
                {jobTypeLabels[item.type]} · publicada há {timeAgo(item.createdAt)}
              </Text>
            </View>
            <IconButton icon="trash-outline" label="Remover vaga" color={colors.danger} background="#FEE2E2" size={36} onPress={() => confirmDelete(item)} />
          </View>
          <Text style={font.body} numberOfLines={3}>
            {item.description}
          </Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl, gap: spacing.md },
  flex: { flex: 1 },
  headerWrap: { gap: spacing.lg },
  hero: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  name: { fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.5, color: colors.primaryText },
  cnpj: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  section: { marginHorizontal: spacing.lg, gap: spacing.md },
  job: { marginHorizontal: spacing.lg },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
