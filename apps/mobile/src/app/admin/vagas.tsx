import type { Job } from '@convivio/shared';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, Empty, ErrorState, IconButton, Loading } from '@/components';
import { useDeleteJob, useJobs } from '@/hooks/queries';
import { jobTypeLabels, timeAgo } from '@/lib/labels';
import { colors, font, pillarTheme, spacing } from '@/theme';

export default function AdminJobs() {
  const jobs = useJobs();
  const remove = useDeleteJob();

  const confirmDelete = (job: Job) =>
    Alert.alert('Remover vaga', `Remover "${job.title}" de ${job.company}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove.mutate(job.id) },
    ]);

  return (
    <FlatList
      data={jobs.data}
      keyExtractor={(j) => j.id}
      contentContainerStyle={styles.list}
      refreshing={jobs.isRefetching}
      onRefresh={jobs.refetch}
      ListEmptyComponent={
        jobs.isLoading ? (
          <Loading />
        ) : jobs.error ? (
          <ErrorState error={jobs.error} onRetry={jobs.refetch} />
        ) : (
          <Empty message="Nenhuma vaga publicada." icon="briefcase-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={font.heading}>{item.title}</Text>
              <Text style={font.caption}>
                {item.company} · {timeAgo(item.createdAt)}
              </Text>
            </View>
            <Badge label={jobTypeLabels[item.type].toUpperCase()} color={pillarTheme.trabalho.color} />
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
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
