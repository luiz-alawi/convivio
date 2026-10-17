import Ionicons from '@expo/vector-icons/Ionicons';
import { loginSchema } from '@convivio/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthProvider';
import { Button, PillarFlower, TextField } from '@/components';
import { brandGradient, colors, fonts, radius, shadow, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setError(undefined);
    setLoading(true);
    try {
      await signIn(parsed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <LinearGradient colors={brandGradient} style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
          <View style={styles.flower}>
            <PillarFlower size={110} />
          </View>
          <Text style={styles.logo}>convivio</Text>
          <Text style={styles.tagline}>os cinco pilares da AMF + o melhor da Quarta Colônia</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Entrar</Text>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
          {!!error && (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Button title="Entrar" onPress={handleSubmit} loading={loading} />

          <Pressable onPress={() => router.push('/cadastro')} style={styles.link}>
            <Text style={styles.linkText}>
              Ainda não tem conta? <Text style={styles.linkStrong}>Criar conta</Text>
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/cadastro-empresa' as Href)} style={styles.companyLink}>
            <Ionicons name="business" size={18} color={colors.primary} />
            <Text style={styles.linkStrong}>Sou empresa e quero divulgar vagas</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    gap: spacing.xs,
  },
  flower: { backgroundColor: colors.surface, borderRadius: 80, padding: spacing.md, marginBottom: spacing.md, ...shadow.raised },
  logo: { fontFamily: fonts.extrabold, fontSize: 44, letterSpacing: -1.5, color: colors.primaryText },
  tagline: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  form: {
    marginTop: -spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.card,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.text },
  error: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorText: { fontFamily: fonts.medium, color: colors.danger, flex: 1 },
  link: { alignItems: 'center' },
  linkText: { fontFamily: fonts.medium, color: colors.textMuted },
  linkStrong: { fontFamily: fonts.bold, color: colors.primary },
  companyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
});
