import Ionicons from '@expo/vector-icons/Ionicons';
import type { Post, PostKind } from '@convivio/shared';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chips,
  Empty,
  ErrorState,
  Loading,
  PillarHero,
  Segmented,
  TextField,
} from '@/components';
import { useCreatePost, useFeed, useReportPost, useToggleLike, useUsers, type FeedScope } from '@/hooks/queries';
import { timeAgo, userSubtitle } from '@/lib/labels';
import { pickAndUploadImage } from '@/lib/upload';
import { colors, font, fonts, pillarTheme, radius, spacing } from '@/theme';

const theme = pillarTheme.moralidade;

const tabOptions = [
  { value: 'feed', label: 'Feed', icon: 'images-outline' },
  { value: 'pessoas', label: 'Pessoas', icon: 'people-outline' },
] as const;

const scopeOptions = [
  { value: 'todos', label: 'Comunidade AMF', icon: 'globe-outline' },
  { value: 'seguindo', label: 'Seguindo', icon: 'heart-outline' },
] as const;

// Área social (BeReal + Pinterest): bons hábitos do dia a dia, e a comunidade de pessoas.
export default function MoralityScreen() {
  const [tab, setTab] = useState<'feed' | 'pessoas'>('feed');
  const header = (
    <View style={styles.header}>
      <PillarHero pillar="moralidade" />
      <Segmented options={tabOptions} value={tab} onChange={setTab} color={theme.color} />
    </View>
  );
  return tab === 'feed' ? <Feed header={header} /> : <People header={header} />;
}

function Feed({ header }: { header: React.ReactElement }) {
  const [scope, setScope] = useState<FeedScope>('todos');
  const [composing, setComposing] = useState(false);
  const feed = useFeed(scope);

  return (
    <FlatList
      data={feed.data}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      refreshing={feed.isRefetching}
      onRefresh={feed.refetch}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <Chips options={scopeOptions} value={scope} onChange={(v) => v && setScope(v)} color={theme.color} />
          {composing ? (
            <Composer onDone={() => setComposing(false)} />
          ) : (
            <Button title="Compartilhar um bom hábito" icon="add-circle" color={theme.color} onPress={() => setComposing(true)} />
          )}
        </View>
      }
      ListEmptyComponent={
        feed.isLoading ? (
          <Loading />
        ) : feed.error ? (
          <ErrorState error={feed.error} onRetry={feed.refetch} />
        ) : (
          <Empty message="Nenhum post ainda. Seja o primeiro!" icon="sparkles-outline" />
        )
      }
      renderItem={({ item }) => <PostCard post={item} />}
    />
  );
}

function PostCard({ post }: { post: Post }) {
  const like = useToggleLike();
  const report = useReportPost();

  const confirmReport = () =>
    Alert.alert('Denunciar post', 'Esse conteúdo vai para a moderação.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Denunciar', style: 'destructive', onPress: () => report.mutate({ id: post.id, reason: 'Conteúdo impróprio' }) },
    ]);

  return (
    <Card style={styles.post}>
      <Pressable style={styles.author} onPress={() => router.push(`/usuario/${post.author.id}` as Href)}>
        <Avatar name={post.author.name} uri={post.author.avatarUrl} size={38} gradient={theme.gradient} />
        <View style={styles.flex}>
          <Text style={font.bodyStrong}>{post.author.name}</Text>
          <Text style={font.caption}>
            {post.author.username ? `@${post.author.username} · ` : ''}
            {timeAgo(post.createdAt)}
          </Text>
        </View>
        {post.kind === 'momento' && <Badge label="24H" color={theme.color} icon="time" />}
      </Pressable>
      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      {!!post.caption && <Text style={font.body}>{post.caption}</Text>}
      <View style={styles.actions}>
        <Pressable onPress={() => like.mutate(post)} hitSlop={8} style={styles.like}>
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={24}
            color={post.likedByMe ? theme.color : colors.text}
          />
          <Text style={font.bodyStrong}>{post.likesCount}</Text>
        </Pressable>
        <Pressable onPress={confirmReport} hitSlop={8}>
          <Ionicons name="flag-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </Card>
  );
}

const kindOptions = [
  { value: 'momento', label: 'Momento (24h)', icon: 'time-outline' },
  { value: 'galeria', label: 'Galeria', icon: 'grid-outline' },
] as const;

function Composer({ onDone }: { onDone: () => void }) {
  const create = useCreatePost();
  const [kind, setKind] = useState<PostKind>('momento');
  const [imageUrl, setImageUrl] = useState<string>();
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function pickPhoto() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage('post');
      if (url) setImageUrl(url);
    } catch (e) {
      Alert.alert('Foto', e instanceof Error ? e.message : 'Não foi possível enviar a foto');
    } finally {
      setUploading(false);
    }
  }

  function publish() {
    if (!imageUrl) return Alert.alert('Foto', 'Escolha uma foto para publicar');
    create.mutate(
      { kind, imageUrl, caption: caption.trim() || undefined },
      { onSuccess: onDone, onError: (e) => Alert.alert('Erro', e.message) },
    );
  }

  return (
    <Card>
      <Segmented options={kindOptions} value={kind} onChange={setKind} color={theme.color} />
      <Pressable onPress={pickPhoto} style={styles.picker} disabled={uploading}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} />
        ) : (
          <>
            <Ionicons name={uploading ? 'cloud-upload-outline' : 'camera-outline'} size={32} color={theme.color} />
            <Text style={[font.bodyStrong, { color: theme.color }]}>{uploading ? 'Enviando…' : 'Escolher foto'}</Text>
          </>
        )}
      </Pressable>
      <TextInput
        placeholder="Conte o que você fez de bom hoje…"
        placeholderTextColor={colors.textMuted}
        value={caption}
        onChangeText={setCaption}
        maxLength={300}
        multiline
        style={styles.caption}
      />
      <View style={styles.composerActions}>
        <Button title="Cancelar" variant="ghost" color={colors.textMuted} onPress={onDone} style={styles.flex} />
        <Button title="Publicar" color={theme.color} onPress={publish} loading={create.isPending} style={styles.flex} />
      </View>
    </Card>
  );
}

function People({ header }: { header: React.ReactElement }) {
  const [search, setSearch] = useState('');
  const users = useUsers(search.trim());

  return (
    <FlatList
      data={users.data}
      keyExtractor={(u) => u.id}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <TextField
            label="Buscar pessoas"
            placeholder="Nome, @usuário ou habilidade"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      }
      ListEmptyComponent={
        users.isLoading ? (
          <Loading />
        ) : users.error ? (
          <ErrorState error={users.error} onRetry={users.refetch} />
        ) : (
          <Empty message="Ninguém encontrado." icon="people-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card onPress={() => router.push(`/usuario/${item.id}` as Href)}>
          <View style={styles.author}>
            <Avatar name={item.name} uri={item.avatarUrl} size={48} gradient={theme.gradient} />
            <View style={styles.flex}>
              <Text style={font.heading}>{item.name}</Text>
              <Text style={font.caption}>{[item.username && `@${item.username}`, userSubtitle(item)].filter(Boolean).join(' · ')}</Text>
              {item.skills.length > 0 && (
                <Text style={[font.small, { color: theme.color }]} numberOfLines={1}>
                  {item.skills.join(' · ')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, marginBottom: spacing.xs },
  flex: { flex: 1 },
  post: { padding: spacing.md, gap: spacing.md },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  image: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  like: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  picker: {
    height: 220,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.soft,
    backgroundColor: `${theme.soft}80`,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  caption: {
    minHeight: 70,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  composerActions: { flexDirection: 'row', gap: spacing.sm },
});
