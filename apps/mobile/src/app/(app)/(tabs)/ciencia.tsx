import Ionicons from '@expo/vector-icons/Ionicons';
import type { Passage } from '@convivio/shared';
import * as Haptics from 'expo-haptics';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, Loading, PillarHero, SectionHeader } from '@/components';
import { usePassageOfTheDay, usePassages, usePointsAction } from '@/hooks/queries';
import { colors, font, fonts, pillarTheme, radius, spacing } from '@/theme';

const theme = pillarTheme.ciencia;

export default function ScienceScreen() {
  const today = usePassageOfTheDay();
  const all = usePassages();
  const read = usePointsAction();

  const markRead = (passage: Passage) =>
    read.mutate(`/passages/${passage.id}/read`, {
      onSuccess: ({ pointsAwarded }) => {
        if (!pointsAwarded) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Boa leitura!', `+${pointsAwarded} pontos em Ciência`);
      },
    });

  const others = all.data?.filter((p) => p.id !== today.data?.id) ?? [];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PillarHero pillar="ciencia" />

      {today.isLoading ? (
        <Loading />
      ) : today.error || !today.data ? (
        <ErrorState error={today.error} onRetry={today.refetch} />
      ) : (
        <View style={styles.today}>
          <Ionicons name="chatbox-ellipses" size={28} color={theme.color} />
          <Text style={font.overline}>Passagem do dia</Text>
          <Text style={styles.bigQuote}>“{today.data.text}”</Text>
          <BookInfo passage={today.data} />
          <Button title="Li a passagem" icon="checkmark-circle" color={theme.color} onPress={() => markRead(today.data!)} />
        </View>
      )}

      {others.length > 0 && <SectionHeader title="Outras passagens" />}
      {others.map((p) => (
        <Card key={p.id}>
          <Text style={styles.quote}>“{p.text}”</Text>
          <BookInfo passage={p} />
          <Button title="Li" size="sm" variant="soft" icon="checkmark" color={theme.color} onPress={() => markRead(p)} />
        </Card>
      ))}
      {/* TODO: meta mensal de leitura (1 livro/mês) */}
    </ScrollView>
  );
}

function BookInfo({ passage }: { passage: Passage }) {
  return (
    <View style={styles.book}>
      <View style={[styles.bookIcon, { backgroundColor: theme.soft }]}>
        <Ionicons name="book" size={18} color={theme.color} />
      </View>
      <View style={styles.flex}>
        <Text style={font.bodyStrong}>{passage.book.title}</Text>
        <Text style={font.caption}>{passage.book.author}</Text>
      </View>
      {/* Parceria com a ABO (em negociação): desconto para quem chegou pelo app */}
      {!!passage.book.purchaseUrl && (
        <Button
          title="Comprar"
          size="sm"
          variant="soft"
          color={theme.color}
          onPress={() => Linking.openURL(passage.book.purchaseUrl!)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg, paddingBottom: spacing.xxl },
  flex: { flex: 1 },
  today: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: theme.soft,
  },
  bigQuote: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 30, color: colors.text, letterSpacing: -0.2 },
  quote: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, fontStyle: 'italic', color: colors.text },
  book: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bookIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
