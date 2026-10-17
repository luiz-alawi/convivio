import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing, type IconName } from '@/theme';
import { Button } from './Button';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={[font.bodyStrong, styles.text]}>{error instanceof Error ? error.message : 'Algo deu errado'}</Text>
      {onRetry && <Button title="Tentar de novo" variant="soft" size="sm" onPress={onRetry} />}
    </View>
  );
}

export function Empty({ message, icon = 'leaf-outline' }: { message: string; icon?: IconName }) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={36} color={colors.border} />
      <Text style={[font.caption, styles.text]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  text: { textAlign: 'center' },
});
