import type { Job, JobType } from '@convivio/shared';
import { useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chips, Empty, ErrorState, Loading, Screen } from '@/components';
import { useJobs, usePointsAction } from '@/hooks/queries';
import { jobTypeLabels, toOptions } from '@/lib/labels';
import { font, pillarColors, spacing } from '@/theme';

const typeOptions = toOptions(jobTypeLabels);

export default function WorkScreen() {
  const [type, setType] = useState<JobType>();
  const jobs = useJobs();
  const interest = usePointsAction();

  function contact(job: Job) {
    interest.mutate(`/jobs/${job.id}/interest`);
    const url = job.contact.includes('@') ? `mailto:${job.contact}` : `tel:${job.contact.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() => {});
  }

  if (jobs.isLoading) return <Loading />;
  if (jobs.error) return <ErrorState error={jobs.error} onRetry={jobs.refetch} />;

  const data = type ? jobs.data?.filter((j) => j.type === type) : jobs.data;

  return (
    <Screen scroll={false} edges={[]}>
      <FlatList
        data={data}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        refreshing={jobs.isRefetching}
        onRefresh={jobs.refetch}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={font.caption}>Vagas e freelas de empresas da região, em primeira mão.</Text>
            <Chips options={typeOptions} value={type} onChange={setType} color={pillarColors.trabalho} allowAll />
          </View>
        }
        ListEmptyComponent={<Empty message="Nenhuma vaga aberta agora." />}
        renderItem={({ item }) => (
          <Card accent={pillarColors.trabalho}>
            <Text style={font.caption}>
              {jobTypeLabels[item.type]} · {item.company}
              {item.city ? ` · ${item.city}` : ''}
            </Text>
            <Text style={font.heading}>{item.title}</Text>
            <Text style={font.body}>{item.description}</Text>
            <Button title="Tenho interesse" color={pillarColors.trabalho} onPress={() => contact(item)} />
          </Card>
        )}
      />
      {/* TODO: publicar vaga (empresas) e perfil de freelancer (skills no perfil + busca em Comunidade) */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.sm },
});
