import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  palette,
  radius,
  spacing,
  fontSize,
  fontWeight,
  readableTextOn,
  tint,
  BRAND_COLORS,
  DOCUMENT_THEMES,
} from '../../theme';
import type { ThemeName } from '../../types';

/** Tappable swatch grid for choosing the brand color. */
export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <View style={styles.swatchRow}>
      {BRAND_COLORS.map((color) => {
        const selected = color.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Brand color ${color}`}
            style={[
              styles.swatch,
              { backgroundColor: color },
              selected && styles.swatchSelected,
            ]}
          >
            {selected && (
              <Ionicons name="checkmark" size={18} color={readableTextOn(color)} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Three document-theme cards (Modern / Corporate / Minimal). */
export function ThemePicker({
  value,
  brandColor,
  onChange,
}: {
  value: ThemeName;
  brandColor: string;
  onChange: (theme: ThemeName) => void;
}) {
  return (
    <View style={styles.themeCol}>
      {(Object.keys(DOCUMENT_THEMES) as ThemeName[]).map((key) => {
        const theme = DOCUMENT_THEMES[key];
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.themeCard,
              selected && { borderColor: brandColor, backgroundColor: tint(brandColor, 0.94) },
            ]}
          >
            <View style={[styles.themeSwatch, { backgroundColor: brandColor }]}>
              <View
                style={[
                  styles.themeSwatchInner,
                  theme.filledHeader ? { backgroundColor: readableTextOn(brandColor), opacity: 0.4 } : { backgroundColor: palette.white },
                ]}
              />
            </View>
            <View style={styles.themeInfo}>
              <Text style={styles.themeLabel}>{theme.label}</Text>
              <Text style={styles.themeDesc}>{theme.description}</Text>
            </View>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selected ? brandColor : palette.slate300}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Logo picker backed by expo-image-picker. */
export function LogoPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (uri: string | null) => void;
}) {
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add your logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Embed as data URI so it renders reliably inside generated PDFs.
      const uri = asset.base64
        ? `data:image/${asset.uri.endsWith('.png') ? 'png' : 'jpeg'};base64,${asset.base64}`
        : asset.uri;
      onChange(uri);
    }
  };

  return (
    <Pressable onPress={pick} style={styles.logoPicker}>
      {value ? (
        <Image source={{ uri: value }} style={styles.logoPreview} resizeMode="contain" />
      ) : (
        <View style={styles.logoEmpty}>
          <Ionicons name="image-outline" size={26} color={palette.slate400} />
          <Text style={styles.logoText}>Add logo</Text>
        </View>
      )}
      {value ? (
        <Pressable
          hitSlop={10}
          onPress={() => onChange(null)}
          style={styles.logoRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove logo"
        >
          <Ionicons name="close-circle" size={22} color={palette.slate500} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** Labelled switch row. */
export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: palette.primary, false: palette.slate300 }}
      />
    </View>
  );
}

/** Single-select pill row (e.g. payment method). */
export function OptionPills({
  options,
  value,
  onChange,
  brandColor = palette.primary,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  brandColor?: string;
}) {
  return (
    <View style={styles.pillWrap}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.pill,
              selected
                ? { backgroundColor: brandColor, borderColor: brandColor }
                : { borderColor: palette.slate200 },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: selected ? readableTextOn(brandColor) : palette.slate600 },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: palette.white, ...{ transform: [{ scale: 1.08 }] } },

  themeCol: { gap: spacing.md },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: palette.slate200,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  themeSwatch: {
    width: 44,
    height: 56,
    borderRadius: radius.sm,
    padding: 6,
    justifyContent: 'flex-start',
  },
  themeSwatchInner: { height: 10, borderRadius: 3, marginBottom: 4 },
  themeInfo: { flex: 1, marginHorizontal: spacing.md },
  themeLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: palette.ink },
  themeDesc: { fontSize: fontSize.xs, color: palette.slate500, marginTop: 2 },

  logoPicker: {
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: palette.slate200,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    marginBottom: spacing.lg,
  },
  logoPreview: { width: '80%', height: '80%' },
  logoEmpty: { alignItems: 'center' },
  logoText: { color: palette.slate500, marginTop: spacing.sm, fontSize: fontSize.sm },
  logoRemove: { position: 'absolute', top: 8, right: 8 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleText: { flex: 1, marginRight: spacing.lg },
  toggleLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: palette.ink },
  toggleDesc: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },

  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  pillText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
