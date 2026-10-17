import Ionicons from '@expo/vector-icons/Ionicons';
import { registerCompanySchema } from '@convivio/shared';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, TextField } from '@/components';
import { TermsCheckbox } from '@/components/TermsCheckbox';
import { colors, font, fonts, radius, spacing } from '@/theme';

export default function RegisterCompanyScreen() {
  const { signUpCompany } = useAuth();
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    website: '',
    description: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (text: string) => setForm((f) => ({ ...f, [key]: text })),
    error: errors[key],
  });

  async function handleSubmit() {
    const parsed = registerCompanySchema.safeParse({
      ...form,
      city: form.city || undefined,
      website: form.website || undefined,
      description: form.description || undefined,
      acceptedTerms,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signUpCompany(parsed.data);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Não foi possível concluir o cadastro' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.info}>
          <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          <Text style={[font.caption, styles.flex, { color: colors.text }]}>
            Para evitar golpes, toda empresa passa por uma aprovação da administração antes de publicar vagas.
          </Text>
        </View>

        <TextField label="Nome da empresa" {...field('name')} />
        <TextField label="CNPJ" keyboardType="number-pad" placeholder="00.000.000/0000-00" {...field('cnpj')} />
        <TextField label="E-mail" autoCapitalize="none" autoComplete="email" keyboardType="email-address" {...field('email')} />
        <TextField label="Senha (mín. 8 caracteres)" secureTextEntry autoComplete="new-password" {...field('password')} />
        <TextField label="Telefone para contato" keyboardType="phone-pad" {...field('phone')} />
        <TextField label="Cidade (opcional)" {...field('city')} />
        <TextField label="Site ou Instagram (opcional)" autoCapitalize="none" {...field('website')} />
        <TextField label="Sobre a empresa (opcional)" multiline maxLength={500} style={styles.bio} {...field('description')} />

        <TermsCheckbox checked={acceptedTerms} onChange={setAcceptedTerms} error={errors.acceptedTerms} />
        {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}

        <Button title="Enviar cadastro" icon="send" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  info: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  bio: { minHeight: 90, textAlignVertical: 'top', paddingTop: spacing.md },
  error: { fontFamily: fonts.medium, color: colors.danger, fontSize: 13 },
});
