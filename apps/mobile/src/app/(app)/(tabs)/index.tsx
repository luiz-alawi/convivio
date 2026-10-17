import Ionicons from '@expo/vector-icons/Ionicons';
import { PILLARS, type PillarId } from '@convivio/shared';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, SectionHeader } from '@/components';
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
        <Text style={styles.heroSubtitle}>Pronto para viver os cinco pilares hoje?</Text>
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

      {/* Guia da região */}
      <Card gradient={['#0F766E', '#2DD4BF']} onPress={() => router.push('/explorar')} style={styles.explore}>
        <Ionicons name="map" size={96} color="rgba(255,255,255,0.15)" style={styles.exploreDecor} />
        <Badge label="QUARTA COLÔNIA" color="#FFFFFF" icon="location" />
        <Text style={styles.exploreTitle}>Explorar a região</Text>
        <Text style={styles.exploreText}>Onde comer, onde ficar e o que fazer perto do Recanto Maestro</Text>
        <View style={styles.exploreCta}>
          <Text style={styles.exploreCtaText}>Ver lugares</Text>
          <Ionicons name="arrow-forward" size={16} color="#0F766E" />
        </View>
      </Card>

      {/* Passagem do dia */}
      {passage.data && (
        <Card onPress={() => router.push('/ciencia')}>
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

      {/* Os cinco pilares */}
      <SectionHeader title="Os cinco pilares" action="Meu progresso" onAction={() => router.push('/perfil')} />
      <View style={styles.grid}>
        {PILLARS.map((pillar, i) => (
          <PillarTile
            key={pillar.id}
            id={pillar.id}
            name={pillar.name}
            points={user?.points[pillar.id] ?? 0}
            wide={i === PILLARS.length - 1}
          />
        ))}
      </View>

      {/* Destaques de parceiros */}
      {highlights.length > 0 && (
        <>
          <SectionHeader title="Destaques da região" action="Ver tudo" onAction={() => router.push('/explorar')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {highlights.map((place) => {
              const cat = categoryTheme[place.category];
              return (
                <Card key={place.id} style={styles.highlight} onPress={() => router.push('/explorar')}>
                  <View style={[styles.highlightIcon, { backgroundColor: `${cat.color}1A` }]}>
                    <Ionicons name={cat.icon} size={20} color={cat.color} />
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
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

function PillarTile({ id, name, points, wide }: { id: PillarId; name: string; points: number; wide: boolean }) {
  const theme = pillarTheme[id];
  return (
    <Pressable
      onPress={() => router.push(`/${id}` as Href)}
      style={({ pressed }) => [styles.tileWrap, wide && styles.tileWide, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <Ionicons name={theme.icon} size={wide ? 90 : 72} color="rgba(255,255,255,0.16)" style={styles.tileDecor} />
        <View style={styles.tileIcon}>
          <Ionicons name={theme.icon} size={20} color={theme.color} />
        </View>
        <Text style={styles.tileName}>{name}</Text>
        <Text style={styles.tilePoints}>{points} pts</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg, paddingBottom: spacing.xxl },

  hero: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs, overflow: 'hidden', ...shadow.raised },
  heroDecor: { position: 'absolute', right: -20, top: -20 },
  heroHello: { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.6, color: colors.primaryText },
  heroSubtitle: { fontFamily: fonts.medium, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
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

  explore: { padding: spacing.xl, gap: spacing.sm },
  exploreDecor: { position: 'absolute', right: -10, bottom: -14 },
  exploreTitle: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: -0.4, color: colors.primaryText },
  exploreText: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.9)', maxWidth: '80%' },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  exploreCtaText: { fontFamily: fonts.bold, fontSize: 13, color: '#0F766E' },

  passageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quote: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, color: colors.text, fontStyle: 'italic' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tileWrap: { width: '48%', flexGrow: 1, borderRadius: radius.lg, ...shadow.card },
  tileWide: { width: '100%' },
  tile: { borderRadius: radius.lg, padding: spacing.lg, minHeight: 128, justifyContent: 'flex-end', overflow: 'hidden' },
  tileDecor: { position: 'absolute', right: -12, top: -10 },
  tileIcon: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.primaryText, letterSpacing: -0.2 },
  tilePoints: { fontFamily: fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.88)' },

  row: { gap: spacing.md, paddingRight: spacing.lg },
  highlight: { width: 210 },
  highlightIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
