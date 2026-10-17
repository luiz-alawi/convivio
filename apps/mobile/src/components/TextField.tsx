import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, font, radius, spacing } from '@/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  /** Texto fixo antes do campo (ex.: "@" no nome de usuário). */
  prefix?: string;
}

export function TextField({ label, error, prefix, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, !!error && { borderColor: colors.danger }]}>
        {!!prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { ...font.caption, fontFamily: fonts.semibold, color: colors.text },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  prefix: { fontFamily: fonts.semibold, fontSize: 16, color: colors.textMuted, marginRight: 2 },
  input: { flex: 1, minHeight: 50, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
});
