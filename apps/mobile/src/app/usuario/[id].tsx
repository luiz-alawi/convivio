import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, Loading, PillarRadar, Screen } from '@/components';
import { useMe, useToggleFollow, useUser, useUserGallery } from '@/hooks/queries';
import { roleLabels } from '@/lib/labels';
import { colors, font, radius, spacing } from '@/theme';

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
    <Screen edges={[]}>
      <View style={styles.header}>
        <Text style={font.title}>{user.data.name}</Text>
        <Text style={font.caption}>
          {roleLabels[user.data.role]}
          {user.data.course ? ` · ${user.data.course}` : ''}
        </Text>
        {!!user.data.bio && <Text style={font.body}>{user.data.bio}</Text>}
        {user.data.skills.length > 0 && <Text style={font.caption}>{user.data.skills.join(' · ')}</Text>}
        <Text style={font.caption}>
          {user.data.followersCount} seguidores · {user.data.followingCount} seguindo
        </Text>
      </View>

      {!isMe && (
        <Button
          title={following ? 'Seguindo ✓' : 'Seguir'}
          variant={following ? 'outline' : 'primary'}
          loading={follow.isPending}
          onPress={() => follow.mutate({ id, following })}
        />
      )}

      <Card style={styles.center}>
        <PillarRadar points={user.data.points} size={240} />
      </Card>

      <Text style={font.heading}>Galeria</Text>
      <View style={styles.grid}>
        {gallery.data?.map((post) => (
          <Image key={post.id} source={{ uri: post.imageUrl }} style={styles.thumb} />
        ))}
        {gallery.data?.length === 0 && <Text style={font.caption}>Nada na galeria ainda.</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  center: { alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: '31%', aspectRatio: 1, borderRadius: radius.sm, backgroundColor: colors.border },
});
