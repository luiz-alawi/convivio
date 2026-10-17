import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Badge, Card, ErrorState, IconButton, Loading } from '@/components';
import { useTrip, useTrips } from '@/hooks/queries';
import { flyOut, flyTo } from '@/lib/map';
import { colors, font, fonts, pillarTheme, radius, shadow, spacing } from '@/theme';

// Mapa-múndi das viagens (estilo Snapchat / Fotos do iPhone). Tocar num ponto aproxima a câmera e abre os detalhes.
const WORLD = { latitude: 10, longitude: -20, latitudeDelta: 120, longitudeDelta: 160 };
const theme = pillarTheme.internacionalidade;
const AMF_COLOR = colors.primary;

export default function InternationalityScreen() {
  const trips = useTrips();
  const [selectedId, setSelectedId] = useState<string>();
  const trip = useTrip(selectedId); // abrir uma viagem dá pontos em Internacionalidade
  const mapRef = useRef<MapView>(null);

  function close() {
    if (!selectedId) return;
    setSelectedId(undefined);
    flyOut(mapRef, WORLD);
  }

  if (trips.isLoading) return <Loading />;
  if (trips.error) return <ErrorState error={trips.error} onRetry={trips.refetch} />;

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={WORLD} mapType="satellite" onPress={close}>
        {trips.data?.map((t) => (
          <Marker
            key={t.id}
            coordinate={t.location}
            pinColor={t.kind === 'amf' ? AMF_COLOR : theme.color}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedId(t.id);
              flyTo(mapRef, t.location, { zoom: 13, altitude: 6000 });
            }}
          />
        ))}
      </MapView>

      {/* Cabeçalho flutuante */}
      <View style={styles.top}>
        <View style={[styles.topIcon, { backgroundColor: theme.color }]}>
          <Ionicons name={theme.icon} size={20} color={colors.primaryText} />
        </View>
        <View style={styles.flex}>
          <Text style={font.heading}>Internacionalidade</Text>
          <Text style={font.caption}>{trips.data?.length ?? 0} viagens · toque num ponto</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <Badge label="AMF" color={AMF_COLOR} icon="school" />
        <Badge label="Alunos" color={theme.color} icon="people" />
      </View>

      {selectedId && (
        <View style={styles.sheet}>
          <Card style={styles.sheetCard}>
            {trip.isLoading || !trip.data ? (
              <Loading />
            ) : (
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.sheetHeader}>
                  <Badge
                    label={trip.data.kind === 'amf' ? 'VIAGEM AMF' : 'VIAGEM DE ALUNOS'}
                    color={trip.data.kind === 'amf' ? AMF_COLOR : theme.color}
                  />
                  <IconButton
                    icon="close"
                    label="Fechar"
                    size={32}
                    background={colors.surfaceAlt}
                    onPress={close}
                  />
                </View>
                <Text style={font.title}>{trip.data.title}</Text>
                <Text style={font.caption}>
                  📍 {trip.data.city}, {trip.data.country} · {new Date(trip.data.date).getFullYear()}
                </Text>
                <Text style={[font.body, styles.spaced]}>{trip.data.summary}</Text>
                {!!trip.data.history && (
                  <>
                    <Text style={[font.overline, styles.spaced]}>Sobre o lugar</Text>
                    <Text style={font.body}>{trip.data.history}</Text>
                  </>
                )}
                {trip.data.stories.map((s, i) => (
                  <View key={i} style={[styles.story, { borderLeftColor: theme.color }]}>
                    <Text style={styles.storyText}>“{s.text}”</Text>
                    <Text style={font.caption}>— {s.authorName}</Text>
                  </View>
                ))}
                {/* TODO: galeria de fotos/vídeos (trip.data.media) */}
              </ScrollView>
            )}
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  top: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.raised,
  },
  topIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  legend: { position: 'absolute', top: 84, left: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  sheet: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  sheetCard: { ...shadow.raised },
  sheetScroll: { maxHeight: 320 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  spaced: { marginTop: spacing.md },
  story: { borderLeftWidth: 3, paddingLeft: spacing.md, marginTop: spacing.md, gap: 4 },
  storyText: { fontFamily: fonts.medium, fontSize: 15, fontStyle: 'italic', color: colors.text },
});
