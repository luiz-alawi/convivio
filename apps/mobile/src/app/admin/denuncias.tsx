import type { ReportedPost } from '@convivio/shared';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, Card, Empty, ErrorState, Loading } from '@/components';
import { useModeratePost, useReportedPosts } from '@/hooks/queries';
import { timeAgo } from '@/lib/labels';
import { colors, font, radius, spacing } from '@/theme';

// Posts denunciados. Com 3 denúncias o post é escondido automaticamente até alguém revisar.
export default function AdminReports() {
  const posts = useReportedPosts();
  const moderate = useModeratePost();

  const confirmDelete = (post: ReportedPost) =>
    Alert.alert('Excluir post', 'O post será apagado definitivamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => moderate.mutate({ id: post.id, action: 'excluir' }) },
    ]);

  return (
    <FlatList
      data={posts.data}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      refreshing={posts.isRefetching}
      onRefresh={posts.refetch}
      ListEmptyComponent={
        posts.isLoading ? (
          <Loading />
        ) : posts.error ? (
          <ErrorState error={posts.error} onRetry={posts.refetch} />
        ) : (
          <Empty message="Nenhuma denúncia. Comunidade em paz! 🕊️" icon="flag-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.row}>
            <Avatar name={item.author.name} uri={item.author.avatarUrl} size={38} />
            <View style={styles.flex}>
              <Text style={font.bodyStrong}>{item.author.name}</Text>
              <Text style={font.caption}>{timeAgo(item.createdAt)}</Text>
            </View>
            <Badge
              label={item.hidden ? 'ESCONDIDO' : 'VISÍVEL'}
              color={item.hidden ? colors.danger : colors.success}
              icon={item.hidden ? 'eye-off' : 'eye'}
            />
          </View>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          {!!item.caption && <Text style={font.body}>{item.caption}</Text>}
          <View style={styles.reports}>
            <Text style={[font.bodyStrong, { color: colors.danger }]}>{item.reports.length} denúncia(s)</Text>
            {[...new Set(item.reports.map((r) => r.reason))].map((reason) => (
              <Text key={reason} style={font.caption}>
                • {reason}
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            <Button
              title={item.hidden ? 'Restaurar' : 'Esconder'}
              size="sm"
              variant="soft"
              icon={item.hidden ? 'eye' : 'eye-off'}
              onPress={() => moderate.mutate({ id: item.id, action: item.hidden ? 'restaurar' : 'esconder' })}
              style={styles.flex}
            />
            <Button title="Excluir" size="sm" color={colors.danger} icon="trash" onPress={() => confirmDelete(item)} style={styles.flex} />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  reports: { backgroundColor: '#FEF2F2', padding: spacing.md, borderRadius: radius.sm, gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
