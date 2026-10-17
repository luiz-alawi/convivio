import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, fonts, pillarTheme } from '@/theme';
import { petalGeometry } from './AnimatedBrand';

const SIZE = 120;
const petals = petalGeometry(SIZE);

/**
 * Abertura rápida do app (~1,3 s): a flor desabrocha do centro, o nome sobe,
 * e tudo some com um leve zoom revelando o app por baixo.
 */
export function IntroSplash({ onDone }: { onDone: () => void }) {
  const bloom = useRef(petals.map(() => new Animated.Value(0))).current;
  const word = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) return onDone();
      Animated.sequence([
        Animated.parallel([
          Animated.stagger(
            70,
            bloom.map((v) => Animated.spring(v, { toValue: 1, damping: 12, stiffness: 170, useNativeDriver: true })),
          ),
          Animated.timing(word, { toValue: 1, duration: 380, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.delay(220),
        Animated.timing(exit, { toValue: 1, duration: 340, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => finished && !cancelled && onDone());
    });
    return () => {
      cancelled = true;
    };
  }, [bloom, word, exit, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
    >
      <LinearGradient colors={['#FFF8EF', '#F3ECFB']} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[styles.brand, { transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }] }]}
      >
        <View style={{ width: SIZE, height: SIZE }}>
          {petals.map((p, i) => {
            const v = bloom[i]!;
            return (
              <Animated.View
                key={p.pillar.id}
                style={[
                  styles.petal,
                  {
                    width: p.radius * 2,
                    height: p.radius * 2,
                    borderRadius: p.radius,
                    left: p.left,
                    top: p.top,
                    backgroundColor: pillarTheme[p.pillar.id].color,
                    opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.85, 0.85] }),
                    transform: [
                      // nasce no centro da flor e abre até o seu lugar
                      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-p.dx, 0] }) },
                      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-p.dy, 0] }) },
                      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
        <Animated.Text
          style={[
            styles.word,
            {
              opacity: word,
              transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            },
          ]}
        >
          convivio
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 100, alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 12 },
  petal: { position: 'absolute', mixBlendMode: 'multiply' },
  word: { fontFamily: fonts.extrabold, fontSize: 38, letterSpacing: -1.3, color: colors.text },
});
