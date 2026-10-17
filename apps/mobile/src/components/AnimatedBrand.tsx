import { PILLARS } from '@convivio/shared';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, pillarTheme } from '@/theme';

interface Props {
  /** Tamanho da flor no começo (grande, centralizada). */
  size?: number;
  /** Tamanho final da flor, ao lado do nome. */
  finalSize?: number;
  /** Chamado quando a flor começa a ir para o lado do nome (bom momento para mostrar o resto da tela). */
  onReveal?: () => void;
}

const GAP = 10;

/** Posição e tamanho de cada pétala da flor (mesma geometria do logo), para uma flor de `size` px. */
export function petalGeometry(size: number) {
  const center = size / 2;
  const radius = size * 0.24;
  const dist = size * 0.2;
  return PILLARS.map((pillar, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / PILLARS.length;
    return {
      pillar,
      angle,
      radius,
      dx: dist * Math.cos(angle),
      dy: dist * Math.sin(angle),
      left: center + dist * Math.cos(angle) - radius,
      top: center + dist * Math.sin(angle) - radius,
    };
  });
}

/**
 * Logo animado: as cinco pétalas chegam em espiral, se juntam na flor, a flor dá um pulso
 * e depois encolhe e vai para o lado do nome "convivio". Tocar repete a animação.
 */
export function AnimatedBrand({ size = 150, finalSize = 52, onReveal }: Props) {
  const petals = useRef(PILLARS.map(() => new Animated.Value(0))).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const collapse = useRef(new Animated.Value(0)).current;
  const textIn = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  const play = useCallback(async () => {
    [...petals, spin, collapse, textIn].forEach((v) => v.setValue(0));
    pulse.setValue(1);

    if (await AccessibilityInfo.isReduceMotionEnabled()) {
      [...petals, spin, collapse, textIn].forEach((v) => v.setValue(1));
      onRevealRef.current?.();
      return;
    }

    // 1) pétalas chegando em espiral, uma de cada vez
    Animated.stagger(
      110,
      petals.map((p) => Animated.spring(p, { toValue: 1, damping: 13, stiffness: 120, mass: 0.9, useNativeDriver: true })),
    ).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // 2) a flor fecha: pulso + giro de uma pétala
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.14, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(pulse, { toValue: 1, damping: 7, stiffness: 160, useNativeDriver: true }),
        ]),
        Animated.timing(spin, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => {
        // 3) vai para o lado do nome, que entra deslizando
        onRevealRef.current?.();
        Animated.parallel([
          Animated.spring(collapse, { toValue: 1, damping: 16, stiffness: 120, useNativeDriver: true }),
          Animated.timing(textIn, { toValue: 1, duration: 450, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    });
  }, [petals, pulse, spin, collapse, textIn]);

  // Começa quando já sabemos a largura do nome (para calcular onde a flor termina)
  useEffect(() => {
    if (textWidth > 0) play();
  }, [textWidth, play]);

  // Posições finais: [flor][gap][convivio], o conjunto centralizado
  const total = finalSize + GAP + textWidth;
  const flowerX = -total / 2 + finalSize / 2;
  const textX = -total / 2 + finalSize + GAP + textWidth / 2;

  const geometry = petalGeometry(size);

  return (
    <Pressable
      onPress={play}
      accessibilityRole="image"
      accessibilityLabel="Logo do Convivio"
      style={{ height: size + 16, alignSelf: 'stretch' }}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Animated.View
            style={{
              width: size,
              height: size,
              transform: [
                { translateX: collapse.interpolate({ inputRange: [0, 1], outputRange: [0, flowerX] }) },
                { scale: collapse.interpolate({ inputRange: [0, 1], outputRange: [1, finalSize / size] }) },
                { scale: pulse },
                { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '72deg'] }) },
              ],
            }}
          >
            {geometry.map(({ pillar, angle, radius, left, top }, i) => {
              // Ponto de partida: longe, girado 50° (dá o efeito de espiral)
              const from = angle + 0.9;
              const far = size * 1.7 + i * 12;
              const p = petals[i]!;
              return (
                <Animated.View
                  key={pillar.id}
                  style={[
                    styles.petal,
                    {
                      width: radius * 2,
                      height: radius * 2,
                      borderRadius: radius,
                      left,
                      top,
                      backgroundColor: pillarTheme[pillar.id].color,
                      opacity: p.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.85, 0.85] }),
                      transform: [
                        { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [Math.cos(from) * far, 0] }) },
                        { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [Math.sin(from) * far, 0] }) },
                        { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
        </View>

        <View style={styles.center}>
          <Animated.Text
            onLayout={(e) => textWidth === 0 && setTextWidth(e.nativeEvent.layout.width)}
            style={[
              styles.word,
              {
                opacity: textIn,
                transform: [
                  { translateX: textX },
                  { translateX: textIn.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              },
            ]}
          >
            convivio
          </Animated.Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  // multiply escurece as sobreposições, como no logo original
  petal: { position: 'absolute', mixBlendMode: 'multiply' },
  word: { fontFamily: fonts.extrabold, fontSize: 44, letterSpacing: -1.5, color: colors.text },
});
