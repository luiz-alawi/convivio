import { Tabs } from 'expo-router';
import { AppHeader, PillarTabBar } from '@/components';
import { colors } from '@/theme';

// Barra de baixo = Início + os cinco pilares. O logo no topo também volta ao Início.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillarTabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="internacionalidade" options={{ title: 'Internacionalidade' }} />
      <Tabs.Screen name="estudo" options={{ title: 'Estudo' }} />
      <Tabs.Screen name="trabalho" options={{ title: 'Trabalho' }} />
      <Tabs.Screen name="ciencia" options={{ title: 'Ciência' }} />
      <Tabs.Screen name="moralidade" options={{ title: 'Alta moralidade' }} />
    </Tabs>
  );
}
