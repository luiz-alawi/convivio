import Ionicons from '@expo/vector-icons/Ionicons';
import { PILLAR_IDS, type PillarId } from '@convivio/shared';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, pillarTheme, shadow, spacing } from '@/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Barra inferior com os cinco pilares. No Início nenhum pilar fica selecionado. */
export function PillarTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {PILLAR_IDS.map((id: PillarId) => {
        const theme = pillarTheme[id];
        const focused = current === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={theme.short}
            onPress={() => navigation.navigate(id)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, focused && { backgroundColor: theme.color }]}>
              <Ionicons
                name={focused ? theme.icon : (`${theme.icon}-outline` as typeof theme.icon)}
                size={22}
                color={focused ? colors.primaryText : theme.color}
              />
            </View>
            <Text style={[styles.label, { color: focused ? theme.color : colors.textMuted }]} numberOfLines={1}>
              {theme.short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow.raised,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: { width: 46, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.bold, fontSize: 11 },
});
