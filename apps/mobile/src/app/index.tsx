import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/theme';

// Tela provisória: só para confirmar que o app abre. As telas reais entram em src/app/.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>convivio</Text>
      <Text style={font.overline}>os cinco pilares</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  logo: { fontSize: 48, fontWeight: '800', color: colors.text, letterSpacing: -1 },
});
