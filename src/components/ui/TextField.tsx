import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { palette, radius, spacing, fontSize, fontWeight } from '../../theme';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hint?: string;
  style?: ViewStyle;
}

/** Presentational labelled input with focus + error states. */
export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize = 'sentences',
  hint,
  style,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        placeholderTextColor={palette.slate400}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: palette.slate700,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.slate200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: palette.ink,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md },
  focused: { borderColor: palette.primary },
  errored: { borderColor: palette.danger, backgroundColor: palette.dangerSoft },
  error: { color: palette.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
  hint: { color: palette.slate400, fontSize: fontSize.xs, marginTop: spacing.xs },
});
