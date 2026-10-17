import Ionicons from '@expo/vector-icons/Ionicons';
import { loginSchema } from '@convivio/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthProvider';
import { AnimatedBrand, Button, TextField } from '@/components';
import { colors, fonts, radius, shadow, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // O resto da tela aparece quando a flor vai para o lado do nome
  const reveal = useRef(new Animated.Value(0)).current;
  const showContent = () =>
    Animated.timing(reveal, { toValue: 1, duration: 600, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  const fadeUp = (offset: number) => ({
    opacity: reveal,
    transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }],
  });

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
      <LinearGradient colors={['#FFF8EF', '#F3ECFB']} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <AnimatedBrand onReveal={showContent} />
          <Animated.Text style={[styles.overline, fadeUp(8)]}>os cinco pilares</Animated.Text>
          <Animated.Text style={[styles.tagline, fadeUp(10)]}>
            A vivência da AMF e o melhor da Quarta Colônia num só lugar
          </Animated.Text>
        </View>

        <Animated.View style={[styles.form, fadeUp(40)]}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  brand: { alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.xl },
  overline: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#8E3E8C',
    marginTop: -spacing.lg,
  },
  tagline: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  form: {
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
