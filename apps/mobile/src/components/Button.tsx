import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing, type IconName } from '@/theme';

interface Props {
  title: string;
  onPress: () => void;
  /** primary = cheio; soft = fundo claro da cor; outline = só borda; ghost = só texto */
  variant?: 'primary' | 'soft' | 'outline' | 'ghost';
  color?: string;
  icon?: IconName;
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  color = colors.primary,
  icon,
  size = 'md',
  loading,
  disabled,
  style,
}: Props) {
  const textColor = variant === 'primary' ? colors.primaryText : color;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variant === 'primary' && { backgroundColor: color },
        variant === 'soft' && { backgroundColor: `${color}1A` },
        variant === 'outline' && { borderWidth: 1.5, borderColor: color },
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={textColor} />}
          <Text style={[styles.text, size === 'sm' && styles.textSm, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { minHeight: 38, paddingHorizontal: spacing.lg, borderRadius: radius.pill },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontFamily: fonts.bold, fontSize: 16 },
  textSm: { fontSize: 14 },
});
