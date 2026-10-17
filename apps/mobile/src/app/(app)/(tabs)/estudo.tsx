import Ionicons from '@expo/vector-icons/Ionicons';
import { COURSES, type Course, type Video } from '@convivio/shared';
import { useEventListener } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { Badge, Chips, Empty, ErrorState, Loading } from '@/components';
import { usePointsAction, useVideos } from '@/hooks/queries';
import { colors, fonts, pillarTheme, radius, spacing } from '@/theme';

const theme = pillarTheme.estudo;
const courseOptions = COURSES.map((c) => ({ value: c, label: c }));

// Feed vertical de vídeos curtos (estilo TikTok): um vídeo por "página", só o visível toca.
export default function StudyScreen() {
  const [course, setCourse] = useState<Course>();
  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState<string>();
  const videos = useVideos(course);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<Video>[] }) => {
    setActiveId(viewableItems[0]?.item.id);
  }).current;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Chips options={courseOptions} value={course} onChange={setCourse} color={theme.color} allowAll />
      </View>
      <View style={styles.feed} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {videos.isLoading ? (
          <Loading />
        ) : videos.error ? (
          <ErrorState error={videos.error} onRetry={videos.refetch} />
        ) : (
          height > 0 && (
            <FlatList
              data={videos.data}
              keyExtractor={(v) => v.id}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
              ListEmptyComponent={<Empty message="Nenhuma videoaula desse curso ainda." icon="videocam-outline" />}
              renderItem={({ item }) => (
                <View style={{ height }}>
                  {item.id === activeId ? <ActiveVideo video={item} /> : <View style={styles.placeholder} />}
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.shade} />
                  <View style={styles.info}>
                    <Badge label={item.course.toUpperCase()} color={theme.color} solid icon="school" />
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.meta}>
                      <Ionicons name="person-circle" size={16} color="#ddd" />
                      <Text style={styles.metaText}>
                        {item.professor} · {Math.round(item.durationSec)}s
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )
        )}
      </View>
    </View>
  );
}

function ActiveVideo({ video }: { video: Video }) {
  const watched = usePointsAction();
  const player = useVideoPlayer(video.url, (p) => {
    p.loop = true;
    p.play();
  });
  // Assistiu até o fim pelo menos uma vez → pontos em Estudo
  useEventListener(player, 'playToEnd', () => {
    if (!watched.isSuccess && !watched.isPending) watched.mutate(`/videos/${video.id}/watched`);
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  feed: { flex: 1, marginHorizontal: spacing.md, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#000' },
  placeholder: { ...StyleSheet.absoluteFill, backgroundColor: '#111' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%' },
  info: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl, gap: spacing.sm },
  title: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: -0.4, color: colors.primaryText },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.medium, fontSize: 13, color: '#ddd' },
});
