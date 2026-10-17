import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Empty, ErrorState, Loading, PillarRadar, ProfileHeader, SectionHeader } from '@/components';
import { useMe, useToggleFollow, useUser, useUserGallery } from '@/hooks/queries';
import { colors, radius, spacing } from '@/theme';

// Perfil público: pilares, galeria e botão de seguir
export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const user = useUser(id);
  const gallery = useUserGallery(id);
  const follow = useToggleFollow();

  if (user.isLoading) return <Loading />;
  if (!user.data) return <ErrorState error={user.error} onRetry={user.refetch} />;

  const isMe = me.data?.id === id;
  const following = !!me.data?.following.includes(id);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ProfileHeader user={user.data}>
        {!isMe && (
          <Button
            title={following ? 'Seguindo' : 'Seguir'}
            icon={following ? 'checkmark' : 'person-add'}
            variant={following ? 'soft' : 'primary'}
            size="sm"
            loading={follow.isPending}
            onPress={() => follow.mutate({ id, following })}
            style={styles.follow}
          />
        )}
      </ProfileHeader>

      <Card style={styles.center}>
        <PillarRadar points={user.data.points} size={250} />
      </Card>

      <SectionHeader title="Galeria" />
      {gallery.data?.length ? (
        <View style={styles.grid}>
          {gallery.data.map((post) => (
            <Image key={post.id} source={{ uri: post.imageUrl }} style={styles.thumb} />
          ))}
        </View>
      ) : (
        <Empty message="Nada na galeria ainda." icon="images-outline" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  center: { alignItems: 'center' },
  follow: { marginTop: spacing.md, minWidth: 140 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: '31.5%', aspectRatio: 1, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
});
