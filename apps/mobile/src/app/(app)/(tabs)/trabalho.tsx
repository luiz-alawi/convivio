import Ionicons from '@expo/vector-icons/Ionicons';
import type { Job, JobType } from '@convivio/shared';
import { useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, Card, Empty, ErrorState, Loading, PillarHero, Segmented } from '@/components';
import { useJobs, usePointsAction } from '@/hooks/queries';
import { jobTypeLabels, timeAgo } from '@/lib/labels';
import { font, pillarTheme, spacing } from '@/theme';

const theme = pillarTheme.trabalho;
const filterOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'vaga', label: 'Vagas', icon: 'briefcase-outline' },
  { value: 'freela', label: 'Freelas', icon: 'flash-outline' },
] as const;

export default function WorkScreen() {
  const [filter, setFilter] = useState<'todas' | JobType>('todas');
  const jobs = useJobs();
  const interest = usePointsAction();

  function contact(job: Job) {
    interest.mutate(`/jobs/${job.id}/interest`);
    const url = job.contact.includes('@') ? `mailto:${job.contact}` : `tel:${job.contact.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() => Alert.alert('Contato', job.contact));
  }

  const data = filter === 'todas' ? jobs.data : jobs.data?.filter((j) => j.type === filter);

  return (
    <FlatList
      data={data}
      keyExtractor={(j) => j.id}
      contentContainerStyle={styles.list}
      refreshing={jobs.isRefetching}
      onRefresh={jobs.refetch}
      ListHeaderComponent={
        <View style={styles.header}>
          <PillarHero pillar="trabalho" />
          <Segmented options={filterOptions} value={filter} onChange={setFilter} color={theme.color} />
        </View>
      }
      ListEmptyComponent={
        jobs.isLoading ? (
          <Loading />
        ) : jobs.error ? (
          <ErrorState error={jobs.error} onRetry={jobs.refetch} />
        ) : (
          <Empty message="Nenhuma vaga aberta agora." icon="briefcase-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.row}>
            <Avatar name={item.company} size={44} gradient={theme.gradient} />
            <View style={styles.flex}>
              <Text style={font.heading}>{item.title}</Text>
              <Text style={font.caption}>
                {item.company} · {timeAgo(item.createdAt)}
              </Text>
            </View>
            <Badge label={jobTypeLabels[item.type].toUpperCase()} color={item.type === 'vaga' ? theme.color : '#D97706'} />
          </View>
          <Text style={font.body}>{item.description}</Text>
          {!!item.city && (
            <View style={styles.city}>
              <Ionicons name="location-outline" size={14} color={theme.color} />
              <Text style={font.caption}>{item.city}</Text>
            </View>
          )}
          <Button title="Tenho interesse" icon="paper-plane" color={theme.color} onPress={() => contact(item)} />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  header: { gap: spacing.lg, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
