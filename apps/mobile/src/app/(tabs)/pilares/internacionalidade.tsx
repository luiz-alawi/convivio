import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, ErrorState, Loading, Screen } from '@/components';
import { useTrip, useTrips } from '@/hooks/queries';
import { colors, font, pillarColors, spacing } from '@/theme';

// Mapa-múndi com as viagens (estilo Snapchat / Fotos do iPhone). Tocar num ponto abre os detalhes.
const WORLD = { latitude: 10, longitude: -20, latitudeDelta: 120, longitudeDelta: 160 };

export default function InternationalityScreen() {
  const trips = useTrips();
  const [selectedId, setSelectedId] = useState<string>();
  const trip = useTrip(selectedId); // abrir uma viagem dá pontos em Internacionalidade

  if (trips.isLoading) return <Loading />;
  if (trips.error) return <ErrorState error={trips.error} onRetry={trips.refetch} />;

  return (
    <Screen scroll={false} edges={[]}>
      <MapView style={styles.map} initialRegion={WORLD} onPress={() => setSelectedId(undefined)}>
        {trips.data?.map((t) => (
          <Marker
            key={t.id}
            coordinate={t.location}
            pinColor={t.kind === 'amf' ? colors.primary : pillarColors.internacionalidade}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedId(t.id);
            }}
          />
        ))}
      </MapView>

      {selectedId && (
        <View style={styles.sheet}>
          {trip.isLoading || !trip.data ? (
            <Loading />
          ) : (
            <Card accent={pillarColors.internacionalidade}>
              <ScrollView style={styles.sheetScroll}>
                <Text style={font.caption}>
                  {trip.data.city}, {trip.data.country} · {new Date(trip.data.date).getFullYear()} ·{' '}
                  {trip.data.kind === 'amf' ? 'Viagem AMF' : 'Viagem de alunos'}
                </Text>
                <Text style={font.heading}>{trip.data.title}</Text>
                <Text style={font.body}>{trip.data.summary}</Text>
                {!!trip.data.history && (
                  <>
                    <Text style={[font.overline, styles.spaced]}>Sobre o lugar</Text>
                    <Text style={font.body}>{trip.data.history}</Text>
                  </>
                )}
                {trip.data.stories.map((s, i) => (
                  <View key={i} style={styles.spaced}>
                    <Text style={font.body}>“{s.text}”</Text>
                    <Text style={font.caption}>— {s.authorName}</Text>
                  </View>
                ))}
                {/* TODO: galeria de fotos/vídeos (trip.data.media) */}
              </ScrollView>
            </Card>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  sheet: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  sheetScroll: { maxHeight: 280 },
  spaced: { marginTop: spacing.md },
});
