import Ionicons from '@expo/vector-icons/Ionicons';
import { PLACE_CATEGORIES, type Place, type PlaceCategory } from '@convivio/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Badge, Button, Card, Empty, ErrorState, Loading, Segmented } from '@/components';
import { usePlaces, usePointsAction } from '@/hooks/queries';
import { categoryLabels } from '@/lib/labels';
import { categoryTheme, colors, font, fonts, radius, shadow, spacing, type IconName } from '@/theme';

// Centro aproximado do Recanto Maestro / Quarta Colônia
const REGION = { latitude: -29.67, longitude: -53.4, latitudeDelta: 0.12, longitudeDelta: 0.12 };

const viewOptions = [
  { value: 'lista', label: 'Lista', icon: 'list' },
  { value: 'mapa', label: 'Mapa', icon: 'map' },
] as const;

export default function ExploreScreen() {
  const [category, setCategory] = useState<PlaceCategory>();
  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const places = usePlaces(category);
  const visit = usePointsAction();

  function markVisited(place: Place) {
    visit.mutate(`/places/${place.id}/visit`, {
      onSuccess: ({ pointsAwarded }) => {
        if (pointsAwarded) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(place.name, pointsAwarded ? `+${pointsAwarded} pontos em Internacionalidade!` : 'Você já registrou essa visita.');
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          <CategoryTile label="Tudo" icon="apps" color={colors.primary} selected={!category} onPress={() => setCategory(undefined)} />
          {PLACE_CATEGORIES.map((c) => (
            <CategoryTile
              key={c}
              label={categoryLabels[c]}
              icon={categoryTheme[c].icon}
              color={categoryTheme[c].color}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>
        <Segmented options={viewOptions} value={view} onChange={setView} />
      </View>

      {places.isLoading ? (
        <Loading />
      ) : places.error ? (
        <ErrorState error={places.error} onRetry={places.refetch} />
      ) : view === 'mapa' ? (
        <View style={styles.mapWrap}>
          <MapView style={StyleSheet.absoluteFill} initialRegion={REGION}>
            {places.data?.map((place) => (
              <Marker
                key={place.id}
                coordinate={place.location}
                title={place.name}
                description={categoryLabels[place.category]}
                pinColor={categoryTheme[place.category].color}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <FlatList
          data={places.data}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty message="Nenhum lugar nessa categoria ainda." icon="location-outline" />}
          refreshing={places.isRefetching}
          onRefresh={places.refetch}
          renderItem={({ item }) => <PlaceCard place={item} onVisit={() => markVisited(item)} />}
        />
      )}
    </View>
  );
}

function CategoryTile(props: { label: string; icon: IconName; color: string; selected: boolean; onPress: () => void }) {
  const { label, icon, color, selected, onPress } = props;
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: selected ? color : `${color}1A` }, selected && shadow.card]}>
        <Ionicons name={icon} size={24} color={selected ? colors.primaryText : color} />
      </View>
      <Text style={[styles.tileLabel, selected && { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlaceCard({ place, onVisit }: { place: Place; onVisit: () => void }) {
  const cat = categoryTheme[place.category];
  return (
    <Card>
      <View style={styles.placeHeader}>
        <View style={[styles.placeIcon, { backgroundColor: `${cat.color}1A` }]}>
          <Ionicons name={cat.icon} size={22} color={cat.color} />
        </View>
        <View style={styles.flex}>
          <Text style={font.heading}>{place.name}</Text>
          <Text style={font.caption}>
            {categoryLabels[place.category]} · {place.city}
          </Text>
        </View>
        {place.partner && <Badge label="PARCEIRO" color={colors.primary} icon="star" />}
      </View>
      <Text style={font.body} numberOfLines={3}>
        {place.description}
      </Text>
      {!!place.highlight && (
        <View style={styles.tip}>
          <Ionicons name="bulb" size={16} color={colors.warning} />
          <Text style={[font.caption, styles.flex, { color: colors.text }]}>{place.highlight}</Text>
        </View>
      )}
      <Button title="Estive aqui · +20 pts" size="sm" variant="soft" icon="checkmark-done" onPress={onVisit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.md },
  categories: { gap: spacing.md, paddingVertical: spacing.xs },
  tile: { alignItems: 'center', gap: 6, width: 68 },
  tileIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  mapWrap: { flex: 1, marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderRadius: radius.xl, overflow: 'hidden' },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.md, paddingBottom: spacing.xxl },
  placeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  placeIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tip: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: radius.sm,
  },
});
