import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import { colors, type IconName } from '@/theme';

interface Props {
  icon: IconName;
  onPress: () => void;
  color?: string;
  background?: string;
  size?: number;
  label: string;
}

export function IconButton({ icon, onPress, color = colors.text, background = colors.surface, size = 40, label }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
});
