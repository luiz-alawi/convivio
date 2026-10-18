import Ionicons from '@expo/vector-icons/Ionicons';
import { PILLARS, type PillarId } from '@convivio/shared';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SectionHeader } from '@/components';
import { useCheckIn, useMe, usePassageOfTheDay, usePlaces } from '@/hooks/queries';
import { categoryLabels } from '@/lib/labels';
import { brandGradient, categoryTheme, colors, font, fonts, pillarTheme, radius, shadow, spacing } from '@/theme';

const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString();

export default function HomeScreen() {
  const me = useMe();
  const checkIn = useCheckIn();
  const passage = usePassageOfTheDay();
  const places = usePlaces();

  const user = me.data;
  const checkedInToday = isToday(user?.lastCheckInAt);
  const highlights = places.data?.filter((p) => p.partner) ?? [];

  const doCheckIn = () =>
    checkIn.mutate(undefined, {
      onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Saudação + check-in diário */}
      <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Ionicons name="sparkles" size={120} color="rgba(255,255,255,0.08)" style={styles.heroDecor} />
        <Text style={styles.heroHello}>Olá, {user?.name.split(' ')[0]} 👋</Text>
        <View style={styles.heroRow}>
          <View style={styles.streak}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>{user?.streak ?? 0} dias</Text>
              <Text style={styles.streakLabel}>de sequência</Text>
            </View>
          </View>
          <Pressable
            onPress={doCheckIn}
            disabled={checkedInToday || checkIn.isPending}
            style={({ pressed }) => [styles.checkIn, checkedInToday && styles.checkInDone, pressed && { opacity: 0.85 }]}
          >
            {checkIn.isPending ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons
                  name={checkedInToday ? 'checkmark-circle' : 'flash'}
                  size={18}
                  color={checkedInToday ? colors.primaryText : colors.primary}
                />
                <Text style={[styles.checkInText, checkedInToday && { color: colors.primaryText }]}>
                  {checkedInToday ? 'Check-in feito' : 'Fazer check-in'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {/* Passagem do dia */}
      {passage.data && (
        <Card onPress={() => router.push('/ciencia')} style={styles.passage}>
          <Ionicons name="chatbox-ellipses" size={96} color={`${pillarTheme.ciencia.color}14`} style={styles.passageDecor} />
          <View style={styles.passageHeader}>
            <Ionicons name="book" size={16} color={pillarTheme.ciencia.color} />
            <Text style={[font.overline, { color: pillarTheme.ciencia.color }]}>Passagem do dia</Text>
          </View>
          <Text style={styles.quote} numberOfLines={4}>
            “{passage.data.text}”
          </Text>
          <Text style={font.caption}>
            {passage.data.book.title} · {passage.data.book.author}
          </Text>
        </Card>
      )}

      {/* Progresso nos cinco pilares (os pilares em si ficam na barra de baixo) */}
      <SectionHeader title="Seu progresso" action="Ver perfil" onAction={() => router.push('/perfil')} />
      <Card style={styles.progress}>
        {PILLARS.map((pillar) => (
          <PillarStat key={pillar.id} id={pillar.id} name={pillar.name} points={user?.points[pillar.id] ?? 0} />
        ))}
      </Card>

      {/* Explorar a região: destaques de parceiros */}
      <SectionHeader title="Explorar a região" action="Ver tudo" onAction={() => router.push('/explorar')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {highlights.map((place) => {
          const cat = categoryTheme[place.category];
          return (
            <Card key={place.id} style={styles.highlight} onPress={() => router.push('/explorar')}>
              <View style={[styles.highlightIcon, { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon} size={20} color={colors.primaryText} />
              </View>
              <Text style={font.heading} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={font.caption} numberOfLines={2}>
                {place.highlight ?? categoryLabels[place.category]}
              </Text>
            </Card>
          );
        })}
        <Card gradient={brandGradient} style={styles.highlight} onPress={() => router.push('/explorar')}>
          <View style={[styles.highlightIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="map" size={20} color={colors.primary} />
          </View>
          <Text style={[font.heading, { color: colors.primaryText }]}>Ver todos os lugares</Text>
          <Text style={[font.caption, styles.onBrand]} numberOfLines={2}>
            Onde comer, ficar e o que fazer na Quarta Colônia
          </Text>
        </Card>
      </ScrollView>
    </ScrollView>
  );
}

function PillarStat({ id, name, points }: { id: PillarId; name: string; points: number }) {
  const theme = pillarTheme[id];
  return (
    <Pressable
      onPress={() => router.push(`/${id}` as Href)}
      accessibilityLabel={`${name}: ${points} pontos`}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.statIcon, { backgroundColor: theme.color }]}>
        <Ionicons name={theme.icon} size={20} color={colors.primaryText} />
      </View>
      <Text style={[styles.statPoints, { color: theme.color }]}>{points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg, paddingBottom: spacing.xxl },

  hero: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs, overflow: 'hidden', ...shadow.raised },
  heroDecor: { position: 'absolute', right: -20, top: -20 },
  heroHello: { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.6, color: colors.primaryText },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakFire: { fontSize: 28 },
  streakValue: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.primaryText },
  streakLabel: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  checkIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.pill,
  },
  checkInDone: { backgroundColor: 'rgba(255,255,255,0.2)' },
  checkInText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  passage: { backgroundColor: pillarTheme.ciencia.soft },
  passageDecor: { position: 'absolute', right: -8, bottom: -16 },
  passageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quote: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, color: colors.text, fontStyle: 'italic' },

  progress: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  stat: { alignItems: 'center', gap: 6, flex: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statPoints: { fontFamily: fonts.extrabold, fontSize: 14 },

  row: { gap: spacing.md, paddingRight: spacing.lg },
  highlight: { width: 210 },
  onBrand: { color: 'rgba(255,255,255,0.88)' },
  highlightIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
