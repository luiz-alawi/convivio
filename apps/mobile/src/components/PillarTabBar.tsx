import Ionicons from '@expo/vector-icons/Ionicons';
import { PILLAR_IDS, type PillarId } from '@convivio/shared';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, pillarTheme, shadow, spacing, type IconName } from '@/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Barra inferior: Início + os cinco pilares. */
export function PillarTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;

  const tabs = [
    { route: 'index', label: 'Início', icon: 'home' as IconName, color: colors.primary },
    ...PILLAR_IDS.map((id: PillarId) => ({ route: id, label: pillarTheme[id].short, icon: pillarTheme[id].icon, color: pillarTheme[id].color })),
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabs.map(({ route, label, icon, color }) => {
        const focused = current === route;
        return (
          <Pressable
            key={route}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => navigation.navigate(route)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, focused && { backgroundColor: color }]}>
              <Ionicons
                name={focused ? icon : (`${icon}-outline` as IconName)}
                size={22}
                color={focused ? colors.primaryText : color}
              />
            </View>
            <Text style={[styles.label, { color: focused ? color : colors.textMuted }]} numberOfLines={1}>
              {label}
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
  iconWrap: { width: 42, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.bold, fontSize: 11 },
});
