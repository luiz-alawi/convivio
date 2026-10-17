import Ionicons from '@expo/vector-icons/Ionicons';
import { COURSES, updateProfileSchema, type Course, type Me } from '@convivio/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Chips, ErrorState, Loading, TextField } from '@/components';
import { useMe, useUpdateProfile } from '@/hooks/queries';
import { pickAndUploadImage } from '@/lib/upload';
import { colors, font, fonts, spacing } from '@/theme';

const courseOptions = COURSES.map((c) => ({ value: c, label: c }));

export default function EditProfileScreen() {
  const me = useMe();
  if (me.isLoading) return <Loading />;
  if (!me.data) return <ErrorState error={me.error} onRetry={me.refetch} />;
  return <EditProfileForm me={me.data} />;
}

function EditProfileForm({ me }: { me: Me }) {
  const update = useUpdateProfile();
  const [avatarUrl, setAvatarUrl] = useState(me.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: me.name,
    username: me.username ?? '',
    bio: me.bio ?? '',
    phone: me.phone ?? '',
    skills: me.skills.join(', '),
  });
  const [course, setCourse] = useState<Course | undefined>(me.course);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (text: string) => setForm((f) => ({ ...f, [key]: text })),
    error: errors[key],
  });

  async function changePhoto() {
    setUploading(true);
    try {
      const url = await pickAndUploadImage('avatar');
      if (url) setAvatarUrl(url);
    } catch (e) {
      Alert.alert('Foto de perfil', e instanceof Error ? e.message : 'Não foi possível enviar a foto');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    const parsed = updateProfileSchema.safeParse({
      name: form.name,
      username: form.username || undefined,
      bio: form.bio,
      phone: form.phone,
      avatarUrl,
      course: me.role === 'usuario' ? (course ?? null) : undefined,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    update.mutate(parsed.data, {
      onSuccess: () => router.back(),
      onError: (e) => setErrors({ form: e.message }),
    });
  }

  const showCourse = me.profile === 'aluno' || me.profile === 'professor';

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.avatar} onPress={changePhoto} disabled={uploading}>
        <Avatar name={form.name || me.name} uri={avatarUrl} size={110} ring />
        <View style={styles.cameraBadge}>
          {uploading ? (
            <ActivityIndicator color={colors.primaryText} size="small" />
          ) : (
            <Ionicons name="camera" size={18} color={colors.primaryText} />
          )}
        </View>
      </Pressable>
      <Text style={[font.caption, styles.centerText]}>Toque na foto para trocar</Text>

      <TextField label="Nome" autoComplete="name" {...field('name')} />
      <TextField label="Nome de usuário" prefix="@" autoCapitalize="none" autoCorrect={false} {...field('username')} />
      <TextField label="Sobre você" multiline maxLength={280} style={styles.bio} {...field('bio')} />
      {showCourse && (
        <View style={styles.group}>
          <Text style={styles.label}>Curso</Text>
          <Chips options={courseOptions} value={course} onChange={setCourse} />
        </View>
      )}
      <TextField
        label="Habilidades (separadas por vírgula)"
        placeholder="fotografia, inglês, design…"
        autoCapitalize="none"
        {...field('skills')}
      />
      <TextField label="Telefone" keyboardType="phone-pad" autoComplete="tel" {...field('phone')} />

      {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}
      <Button title="Salvar alterações" icon="checkmark" onPress={save} loading={update.isPending} disabled={uploading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  avatar: { alignSelf: 'center' },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: { textAlign: 'center', marginTop: -spacing.sm },
  bio: { minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.md },
  group: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  error: { fontFamily: fonts.medium, color: colors.danger },
});
