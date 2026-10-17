import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, type IconName } from '@/theme';

interface Option<T> {
  value: T;
  label: string;
  icon?: IconName;
}

interface ChipsProps<T extends string> {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  color?: string;
  /** Mostra um chip "Todos" que limpa a seleção. */
  allowAll?: boolean;
}

/** Filtros em pílulas roláveis. */
export function Chips<T extends string>({ options, value, onChange, color = colors.primary, allowAll }: ChipsProps<T>) {
  const items: Option<T | undefined>[] = allowAll ? [{ value: undefined, label: 'Todos' }, ...options] : [...options];
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
            {item.icon && <Ionicons name={item.icon} size={14} color={selected ? colors.primaryText : color} />}
            <Text style={[styles.chipText, selected && { color: colors.primaryText }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface SegmentedProps<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  color?: string;
}

/** Alternância entre 2–3 visões (ex.: Lista | Mapa). */
export function Segmented<T extends string>({ options, value, onChange, color = colors.primary }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            {item.icon && <Ionicons name={item.icon} size={16} color={selected ? color : colors.textMuted} />}
            <Text style={[styles.segmentText, selected && { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  segmentSelected: { backgroundColor: colors.surface },
  segmentText: { fontFamily: fonts.bold, fontSize: 14, color: colors.textMuted },
});
