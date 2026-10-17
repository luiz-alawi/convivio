import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components';
import { useCheckIn, useMe, usePassageOfTheDay, usePlaces } from '@/hooks/queries';
import { categoryLabels } from '@/lib/labels';
import { colors, font, pillarColors, spacing } from '@/theme';

const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString();

export default function HomeScreen() {
  const me = useMe();
  const checkIn = useCheckIn();
  const passage = usePassageOfTheDay();
  const places = usePlaces();

  const checkedInToday = isToday(me.data?.lastCheckInAt);
  const highlights = places.data?.filter((p) => p.partner) ?? [];

  return (
    <Screen>
      <View>
        <Text style={font.caption}>Olá,</Text>
        <Text style={font.title}>{me.data?.name.split(' ')[0] ?? ''}</Text>
      </View>

      {/* Check-in diário: cria o hábito de abrir o app */}
      <Card accent={colors.primary}>
        <Text style={font.heading}>Check-in diário</Text>
        <Text style={font.caption}>
          {me.data?.streak ? `Sequência de ${me.data.streak} dia(s) 🔥` : 'Comece sua sequência hoje!'}
        </Text>
        <Button
          title={checkedInToday ? 'Check-in feito ✓' : 'Fazer check-in (+1 em cada pilar)'}
          onPress={() => checkIn.mutate()}
          loading={checkIn.isPending}
          disabled={checkedInToday}
        />
      </Card>

      {passage.data && (
        <Card accent={pillarColors.ciencia} onPress={() => router.push('/pilares/ciencia')}>
          <Text style={font.overline}>Passagem do dia</Text>
          <Text style={[font.body, styles.quote]} numberOfLines={4}>
            “{passage.data.text}”
          </Text>
          <Text style={font.caption}>
            {passage.data.book.title} — {passage.data.book.author}
          </Text>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={font.heading}>Destaques da região</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {highlights.map((place) => (
            <Card key={place.id} style={styles.highlight} onPress={() => router.push('/explorar')}>
              <Text style={font.caption}>{categoryLabels[place.category]}</Text>
              <Text style={font.heading} numberOfLines={1}>
                {place.name}
              </Text>
              {!!place.highlight && (
                <Text style={font.caption} numberOfLines={2}>
                  {place.highlight}
                </Text>
              )}
            </Card>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quote: { fontStyle: 'italic' },
  section: { gap: spacing.sm },
  row: { gap: spacing.md },
  highlight: { width: 220 },
});
