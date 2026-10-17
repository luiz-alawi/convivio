import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing, type Gradient } from '@/theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Card colorido em degradê (texto deve ser branco). */
  gradient?: Gradient;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, gradient, style }: Props) {
  const body = gradient ? (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, styles.surface, style]}>{children}</View>
  );

  if (!onPress) return <View style={styles.shadow}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shadow, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadow.card, borderRadius: radius.lg },
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, overflow: 'hidden' },
  surface: { backgroundColor: colors.surface },
});
