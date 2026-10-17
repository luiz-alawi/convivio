import { COURSES, type Course, type Video } from '@convivio/shared';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { Chips, Empty, ErrorState, Loading, Screen } from '@/components';
import { usePointsAction, useVideos } from '@/hooks/queries';
import { colors, font, pillarColors, spacing } from '@/theme';

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
    <Screen scroll={false} edges={[]}>
      <View style={styles.filters}>
        <Chips options={courseOptions} value={course} onChange={setCourse} color={pillarColors.estudo} allowAll />
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
              ListEmptyComponent={<Empty message="Nenhuma videoaula desse curso ainda." />}
              renderItem={({ item }) => (
                <View style={{ height }}>
                  {item.id === activeId ? <ActiveVideo video={item} /> : <View style={styles.placeholder} />}
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>
                      {item.course} · {item.professor}
                    </Text>
                  </View>
                </View>
              )}
            />
          )
        )}
      </View>
    </Screen>
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
  filters: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  feed: { flex: 1, backgroundColor: '#000' },
  placeholder: { ...StyleSheet.absoluteFill, backgroundColor: '#111' },
  info: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl, gap: spacing.xs },
  title: { ...font.heading, color: colors.primaryText },
  meta: { ...font.caption, color: '#ddd' },
});
