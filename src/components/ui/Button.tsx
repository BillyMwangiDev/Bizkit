import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, fontSize, fontWeight } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { readableTextOn } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled,
  loading,
  fullWidth = true,
  style,
}: ButtonProps) {
  const brand = useProfileStore((s) => s.profile.brandColor) || palette.primary;
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? brand
      : variant === 'danger'
      ? palette.danger
      : variant === 'secondary'
      ? palette.slate100
      : 'transparent';
  const fg =
    variant === 'primary'
      ? readableTextOn(brand)
      : variant === 'danger'
      ? palette.white
      : variant === 'secondary'
      ? palette.slate700
      : brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg },
        fullWidth && styles.fullWidth,
        variant === 'ghost' && styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={styles.icon} />}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  fullWidth: { alignSelf: 'stretch' },
  ghost: { paddingVertical: spacing.md },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
