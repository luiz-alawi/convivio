import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/queries';
import { colors, fonts, spacing } from '@/theme';
import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import { PillarFlower } from './PillarFlower';

/** Topo fixo do app: logo (volta ao Início), Explorar, painel admin (se admin) e avatar (perfil). */
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
        {me.data?.role === 'admin' && (
          <IconButton
            icon="shield-checkmark"
            label="Painel do administrador"
            color={colors.primary}
            background={colors.primarySoft}
            onPress={() => router.push('/admin' as Href)}
          />
        )}
        <IconButton
          icon="compass"
          label="Explorar a região"
          color={colors.primary}
          background={colors.primarySoft}
          onPress={() => router.push('/explorar')}
        />
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
});
