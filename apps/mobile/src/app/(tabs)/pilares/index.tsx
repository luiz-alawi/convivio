import { PILLARS, type PillarId } from '@convivio/shared';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, PillarFlower, Screen } from '@/components';
import { font, pillarColors, spacing } from '@/theme';

const descriptions: Record<PillarId, string> = {
  internacionalidade: 'O mapa das viagens da AMF e dos alunos',
  estudo: 'Videoaulas rápidas de cada curso',
  trabalho: 'Vagas e freelas da região em primeira mão',
  ciencia: 'Passagens diárias dos livros de Antonio Meneghetti',
  moralidade: 'Compartilhe seus bons hábitos com a comunidade',
};

const open = (id: PillarId) => router.push(`/pilares/${id}` as Href);

export default function PillarsHub() {
  return (
    <Screen>
      <View style={styles.header}>
        <PillarFlower size={200} onPressPillar={open} />
        <Text style={font.title}>Os cinco pilares</Text>
      </View>
      {PILLARS.map((pillar) => (
        <Card key={pillar.id} accent={pillarColors[pillar.id]} onPress={() => open(pillar.id)}>
          <Text style={[font.heading, { color: pillarColors[pillar.id] }]}>{pillar.name}</Text>
          <Text style={font.caption}>{descriptions[pillar.id]}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm },
});
