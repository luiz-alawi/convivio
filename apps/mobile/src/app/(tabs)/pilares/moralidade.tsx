import { createPostSchema, type Post, type PostKind } from '@convivio/shared';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chips, Empty, ErrorState, Loading, Screen, TextField } from '@/components';
import { useCreatePost, useFeed, useReportPost, useToggleLike, type FeedScope } from '@/hooks/queries';
import { colors, font, pillarColors, radius, spacing } from '@/theme';

const scopeOptions = [
  { value: 'todos', label: 'Comunidade AMF' },
  { value: 'seguindo', label: 'Seguindo' },
] as const;

const kindOptions = [
  { value: 'momento', label: 'Momento (24h)' },
  { value: 'galeria', label: 'Galeria' },
] as const;

// Área social (BeReal + Pinterest): bons hábitos do dia a dia.
export default function MoralityScreen() {
  const [scope, setScope] = useState<FeedScope>('todos');
  const [composing, setComposing] = useState(false);
  const feed = useFeed(scope);

  return (
    <Screen scroll={false} edges={[]}>
      <FlatList
        data={feed.data}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshing={feed.isRefetching}
        onRefresh={feed.refetch}
        ListHeaderComponent={
          <View style={styles.header}>
            <Chips
              options={scopeOptions}
              value={scope}
              onChange={(v) => v && setScope(v)}
              color={pillarColors.moralidade}
            />
            {composing ? (
              <NewPost onDone={() => setComposing(false)} />
            ) : (
              <Button title="Compartilhar um bom hábito" color={pillarColors.moralidade} onPress={() => setComposing(true)} />
            )}
          </View>
        }
        ListEmptyComponent={
          feed.isLoading ? (
            <Loading />
          ) : feed.error ? (
            <ErrorState error={feed.error} onRetry={feed.refetch} />
          ) : (
            <Empty message="Nenhum post ainda. Seja o primeiro!" />
          )
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </Screen>
  );
}

function PostCard({ post }: { post: Post }) {
  const like = useToggleLike();
  const report = useReportPost();

  const confirmReport = () =>
    Alert.alert('Denunciar post', 'Esse conteúdo vai para a moderação.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Denunciar',
        style: 'destructive',
        onPress: () => report.mutate({ id: post.id, reason: 'Conteúdo impróprio' }),
      },
    ]);

  return (
    <Card style={styles.post}>
      <Pressable onPress={() => router.push(`/usuario/${post.author.id}` as Href)}>
        <Text style={font.heading}>{post.author.name}</Text>
      </Pressable>
      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      {!!post.caption && <Text style={font.body}>{post.caption}</Text>}
      <View style={styles.actions}>
        <Pressable onPress={() => like.mutate(post)} hitSlop={8}>
          <Text style={[font.body, post.likedByMe && { color: pillarColors.moralidade }]}>
            {post.likedByMe ? '♥' : '♡'} {post.likesCount}
          </Text>
        </Pressable>
        <Text style={font.caption}>{post.kind === 'momento' ? 'Some em 24h' : 'Galeria'}</Text>
        <Pressable onPress={confirmReport} hitSlop={8}>
          <Text style={font.caption}>Denunciar</Text>
        </Pressable>
      </View>
    </Card>
  );
}

// TODO: trocar o campo de URL por câmera/galeria (expo-image-picker) quando o storage de imagens for decidido.
function NewPost({ onDone }: { onDone: () => void }) {
  const create = useCreatePost();
  const [kind, setKind] = useState<PostKind>('momento');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string>();

  function submit() {
    const parsed = createPostSchema.safeParse({ kind, imageUrl, caption: caption || undefined });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    create.mutate(parsed.data, { onSuccess: onDone, onError: (e) => setError(e.message) });
  }

  return (
    <Card accent={pillarColors.moralidade}>
      <Chips options={kindOptions} value={kind} onChange={(v) => v && setKind(v)} color={pillarColors.moralidade} />
      <TextField label="URL da imagem" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
      <TextField label="Legenda" value={caption} onChangeText={setCaption} maxLength={300} />
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title="Publicar" color={pillarColors.moralidade} onPress={submit} loading={create.isPending} />
      <Button title="Cancelar" variant="ghost" color={colors.textMuted} onPress={onDone} />
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.md },
  post: { padding: spacing.md },
  image: { width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.border },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
