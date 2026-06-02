import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  /** Sticky footer (e.g. action buttons) rendered above the safe-area inset. */
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
  background?: string;
}

/** Standard screen wrapper: safe-area aware, optional scroll + keyboard avoid. */
export function Screen({
  children,
  scroll = true,
  footer,
  contentStyle,
  background = palette.slate50,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: footer ? spacing.lg : insets.bottom + spacing.xl },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.slate100,
  },
});
