import { COURSES, registerSchema, type Course, type UserRole } from '@convivio/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, Chips, Screen, TextField } from '@/components';
import { roleLabels, toOptions } from '@/lib/labels';
import { colors, font, radius, spacing } from '@/theme';

const roleOptions = toOptions(roleLabels);
const courseOptions = COURSES.map((c) => ({ value: c, label: c }));

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bio: '' });
  const [role, setRole] = useState<UserRole>();
  const [course, setCourse] = useState<Course>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (text: string) => setForm((f) => ({ ...f, [key]: text })),
    error: errors[key],
  });

  const needsCourse = role === 'aluno' || role === 'professor';

  async function handleSubmit() {
    const parsed = registerSchema.safeParse({
      ...form,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
      role,
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
    <Screen edges={[]}>
      <TextField label="Nome" autoComplete="name" {...field('name')} />
      <TextField
        label="E-mail"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        {...field('email')}
      />
      <TextField label="Senha (mín. 8 caracteres)" secureTextEntry autoComplete="new-password" {...field('password')} />

      <View style={styles.group}>
        <Text style={styles.label}>Você é</Text>
        <Chips options={roleOptions} value={role} onChange={setRole} />
        {!!errors.role && <Text style={styles.error}>Escolha uma opção</Text>}
      </View>

      {needsCourse && (
        <View style={styles.group}>
          <Text style={styles.label}>Curso</Text>
          <Chips options={courseOptions} value={course} onChange={setCourse} />
        </View>
      )}

      <TextField label="Telefone (opcional)" keyboardType="phone-pad" autoComplete="tel" {...field('phone')} />
      <TextField label="Sobre você (opcional)" multiline maxLength={280} style={styles.bio} {...field('bio')} />

      {/* LGPD: consentimento explícito. TODO: linkar termos de uso e política de privacidade reais. */}
      <Pressable style={styles.terms} onPress={() => setAcceptedTerms((v) => !v)} accessibilityRole="checkbox">
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
          {acceptedTerms && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={[font.caption, styles.termsText]}>
          Li e aceito os termos de uso e a política de privacidade, incluindo o uso de imagem nas publicações.
        </Text>
      </Pressable>
      {!!errors.acceptedTerms && <Text style={styles.error}>{errors.acceptedTerms}</Text>}
      {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}

      <Button title="Criar conta" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { ...font.caption, fontWeight: '600', color: colors.text },
  bio: { minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.md },
  error: { color: colors.danger, fontSize: 13 },
  terms: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  termsText: { flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary },
  check: { color: colors.primaryText, fontWeight: '800' },
});
