import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Props<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  color?: string;
  /** Mostra um chip "Todos" que limpa a seleção. */
  allowAll?: boolean;
}

export function Chips<T extends string>({ options, value, onChange, color = colors.primary, allowAll }: Props<T>) {
  const items = allowAll ? [{ value: undefined, label: 'Todos' }, ...options] : options;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.label}
            onPress={() => onChange(item.value)}
            style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
          >
            <Text style={[styles.text, selected && { color: colors.primaryText }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { fontSize: 14, fontWeight: '600', color: colors.text },
});
