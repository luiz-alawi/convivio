import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, radius, type IconName } from '@/theme';

/** Etiqueta pequena colorida (status, tipo, parceiro...). */
export function Badge({ label, color, icon, solid }: { label: string; color: string; icon?: IconName; solid?: boolean }) {
  const fg = solid ? '#FFFFFF' : color;
  return (
    <View style={[styles.badge, { backgroundColor: solid ? color : `${color}1F` }]}>
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.3 },
});
