import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/queries';
import { colors, fonts, spacing } from '@/theme';
import { Avatar } from './Avatar';
import { PillarFlower } from './PillarFlower';

/** Topo fixo do app: logo (volta ao Início), Explorar e avatar (perfil). O painel admin abre pelo perfil. */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const me = useMe();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable style={styles.brand} onPress={() => router.navigate('/')} accessibilityLabel="Início" hitSlop={6}>
        <PillarFlower size={30} />
        <Text style={styles.logo}>convivio</Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explorar a região"
          onPress={() => router.push('/explorar')}
          hitSlop={6}
          style={({ pressed }) => [styles.explore, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="compass" size={18} color={colors.primary} />
          <Text style={styles.exploreText}>Explorar</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/perfil')} accessibilityLabel="Meu perfil" hitSlop={6}>
          <Avatar name={me.data?.name ?? '?'} uri={me.data?.avatarUrl} size={40} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: -0.8, color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  explore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  exploreText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
