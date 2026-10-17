import { loginSchema } from '@convivio/shared';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { Button, PillarFlower, Screen, TextField } from '@/components';
import { colors, font, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
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
    <Screen contentStyle={styles.content}>
      <View style={styles.brand}>
        <PillarFlower size={140} />
        <Text style={styles.logo}>convivio</Text>
        <Text style={font.overline}>os cinco pilares</Text>
      </View>

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button title="Entrar" onPress={handleSubmit} loading={loading} />
      <Link href="/cadastro" style={styles.link}>
        Ainda não tem conta? <Text style={styles.linkStrong}>Criar conta</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  logo: { fontSize: 48, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  error: { color: colors.danger },
  link: { textAlign: 'center', color: colors.textMuted, padding: spacing.sm },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});
