import { COURSES, registerSchema, type Course, type UserProfile } from '@convivio/shared';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Chips, TextField } from '@/components';
import { TermsCheckbox } from '@/components/TermsCheckbox';
import { profileLabels, toOptions } from '@/lib/labels';
import { colors, fonts, spacing } from '@/theme';

const profileOptions = toOptions(profileLabels);
const courseOptions = COURSES.map((c) => ({ value: c, label: c }));

// Sugere um @ a partir do nome: "Maria Silva" → "maria.silva"
const suggestUsername = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, 20);

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', phone: '', bio: '' });
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [course, setCourse] = useState<Course>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (text: string) =>
      setForm((f) => ({
        ...f,
        [key]: text,
        ...(key === 'name' && !usernameTouched && { username: suggestUsername(text) }),
      })),
    error: errors[key],
  });

  const needsCourse = profile === 'aluno' || profile === 'professor';

  async function handleSubmit() {
    const parsed = registerSchema.safeParse({
      ...form,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
      profile,
      course: needsCourse ? course : undefined,
      acceptedTerms,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signUp(parsed.data);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Não foi possível criar a conta' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Nome" autoComplete="name" {...field('name')} />
        <TextField
          label="Nome de usuário"
          prefix="@"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setUsernameTouched(true)}
          {...field('username')}
        />
        <TextField label="E-mail" autoCapitalize="none" autoComplete="email" keyboardType="email-address" {...field('email')} />
        <TextField label="Senha (mín. 8 caracteres)" secureTextEntry autoComplete="new-password" {...field('password')} />

        <View style={styles.group}>
          <Text style={styles.label}>Você é</Text>
          <Chips options={profileOptions} value={profile} onChange={setProfile} />
          {!!errors.profile && <Text style={styles.error}>{errors.profile}</Text>}
        </View>

        {needsCourse && (
          <View style={styles.group}>
            <Text style={styles.label}>Curso</Text>
            <Chips options={courseOptions} value={course} onChange={setCourse} />
          </View>
        )}

        <TextField label="Telefone (opcional)" keyboardType="phone-pad" autoComplete="tel" {...field('phone')} />
        <TextField label="Sobre você (opcional)" multiline maxLength={280} style={styles.bio} {...field('bio')} />

        <TermsCheckbox checked={acceptedTerms} onChange={setAcceptedTerms} error={errors.acceptedTerms} />
        {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}

        <Button title="Criar conta" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  group: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  bio: { minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.md },
  error: { fontFamily: fonts.medium, color: colors.danger, fontSize: 13 },
});
