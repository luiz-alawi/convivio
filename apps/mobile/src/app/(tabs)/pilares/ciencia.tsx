import type { Passage } from '@convivio/shared';
import { Alert, Linking, StyleSheet, Text } from 'react-native';
import { Button, Card, ErrorState, Loading, Screen } from '@/components';
import { usePassageOfTheDay, usePassages, usePointsAction } from '@/hooks/queries';
import { font, pillarColors, spacing } from '@/theme';

export default function ScienceScreen() {
  const today = usePassageOfTheDay();
  const all = usePassages();
  const read = usePointsAction();

  if (today.isLoading) return <Loading />;
  if (today.error || !today.data) return <ErrorState error={today.error} onRetry={today.refetch} />;

  const markRead = (passage: Passage) =>
    read.mutate(`/passages/${passage.id}/read`, {
      onSuccess: ({ pointsAwarded }) => pointsAwarded && Alert.alert('Boa leitura!', `+${pointsAwarded} pontos`),
    });

  const others = all.data?.filter((p) => p.id !== today.data.id) ?? [];

  return (
    <Screen edges={[]}>
      <Text style={font.overline}>Passagem do dia</Text>
      <PassageCard passage={today.data} onRead={() => markRead(today.data)} highlight />

      {others.length > 0 && <Text style={[font.heading, styles.spaced]}>Outras passagens</Text>}
      {others.map((p) => (
        <PassageCard key={p.id} passage={p} onRead={() => markRead(p)} />
      ))}
      {/* TODO: meta mensal de leitura (1 livro/mês) */}
    </Screen>
  );
}

function PassageCard({ passage, onRead, highlight }: { passage: Passage; onRead: () => void; highlight?: boolean }) {
  return (
    <Card accent={pillarColors.ciencia}>
      <Text style={[font.body, highlight && styles.big, styles.quote]}>“{passage.text}”</Text>
      <Text style={font.caption}>
        {passage.book.title} — {passage.book.author}
      </Text>
      <Button title="Li ✓" variant="outline" color={pillarColors.ciencia} onPress={onRead} />
      {/* Parceria com a ABO (em negociação): desconto para quem chegou pelo app */}
      {!!passage.book.purchaseUrl && (
        <Button
          title="Quero o livro (desconto ABO)"
          color={pillarColors.ciencia}
          onPress={() => Linking.openURL(passage.book.purchaseUrl!)}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 20, lineHeight: 28 },
  quote: { fontStyle: 'italic' },
  spaced: { marginTop: spacing.md },
});
