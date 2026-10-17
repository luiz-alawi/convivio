import type { Place, PlaceCategory } from '@convivio/shared';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card, Chips, Empty, ErrorState, Loading, Screen } from '@/components';
import { usePlaces, usePointsAction } from '@/hooks/queries';
import { categoryLabels, toOptions } from '@/lib/labels';
import { colors, font, pillarColors, radius, spacing } from '@/theme';

// Centro aproximado do Recanto Maestro / Quarta Colônia
const REGION = { latitude: -29.67, longitude: -53.4, latitudeDelta: 0.12, longitudeDelta: 0.12 };

const categoryOptions = toOptions(categoryLabels);
const viewOptions = [
  { value: 'lista', label: 'Lista' },
  { value: 'mapa', label: 'Mapa' },
] as const;

export default function ExploreScreen() {
  const [category, setCategory] = useState<PlaceCategory>();
  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const places = usePlaces(category);
  const visit = usePointsAction();

  function markVisited(place: Place) {
    visit.mutate(`/places/${place.id}/visit`, {
      onSuccess: ({ pointsAwarded }) =>
        Alert.alert(place.name, pointsAwarded ? `+${pointsAwarded} pontos!` : 'Você já registrou essa visita.'),
    });
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={font.title}>Explorar</Text>
        <Text style={font.caption}>O que fazer, onde comer e onde ficar na Quarta Colônia</Text>
        <Chips options={categoryOptions} value={category} onChange={setCategory} allowAll />
        <Chips options={viewOptions} value={view} onChange={(v) => v && setView(v)} color={colors.text} />
      </View>

      {places.isLoading ? (
        <Loading />
      ) : places.error ? (
        <ErrorState error={places.error} onRetry={places.refetch} />
      ) : view === 'mapa' ? (
        <MapView style={styles.map} initialRegion={REGION}>
          {places.data?.map((place) => (
            <Marker
              key={place.id}
              coordinate={place.location}
              title={place.name}
              description={categoryLabels[place.category]}
              pinColor={place.partner ? colors.primary : pillarColors.internacionalidade}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          data={places.data}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty message="Nenhum lugar nessa categoria ainda." />}
          refreshing={places.isRefetching}
          onRefresh={places.refetch}
          renderItem={({ item }) => (
            <Card accent={item.partner ? colors.primary : undefined}>
              <Text style={font.caption}>
                {categoryLabels[item.category]} · {item.city}
                {item.partner ? ' · Parceiro' : ''}
              </Text>
              <Text style={font.heading}>{item.name}</Text>
              <Text style={font.body}>{item.description}</Text>
              {!!item.highlight && <Text style={styles.highlight}>💡 {item.highlight}</Text>}
              <Button title="Estive aqui" variant="outline" onPress={() => markVisited(item)} />
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, gap: spacing.sm },
  map: { flex: 1, marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderRadius: radius.lg },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.md },
  highlight: { ...font.caption, color: colors.primary },
});
