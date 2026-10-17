import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '@/theme';

// LGPD: consentimento explícito. TODO: linkar termos de uso e política de privacidade reais.
export function TermsCheckbox({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.row} onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }}>
        <View style={[styles.box, checked && styles.boxOn]}>
          {checked && <Ionicons name="checkmark" size={16} color={colors.primaryText} />}
        </View>
        <Text style={[font.caption, styles.text]}>
          Li e aceito os termos de uso e a política de privacidade, incluindo o uso de imagem nas publicações.
        </Text>
      </Pressable>
      {!!error && <Text style={[font.caption, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  text: { flex: 1 },
  box: {
    width: 26,
    height: 26,
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.primary },
});
