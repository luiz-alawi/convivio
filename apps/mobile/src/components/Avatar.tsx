import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { brandGradient, colors, fonts, type Gradient } from '@/theme';

interface Props {
  name: string;
  uri?: string;
  size?: number;
  /** Anel em degradê em volta (perfil). */
  ring?: boolean;
  gradient?: Gradient;
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export function Avatar({ name, uri, size = 40, ring, gradient = brandGradient }: Props) {
  const inner = (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient colors={gradient} style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
        </LinearGradient>
      )}
    </View>
  );
  if (!ring) return inner;
  const pad = Math.max(3, size * 0.04);
  return (
    <LinearGradient colors={gradient} style={{ padding: pad, borderRadius: size }}>
      <View style={{ padding: pad, borderRadius: size, backgroundColor: colors.surface }}>{inner}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.extrabold, color: colors.primaryText },
});
