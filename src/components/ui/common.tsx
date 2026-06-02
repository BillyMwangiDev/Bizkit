import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  palette,
  radius,
  spacing,
  fontSize,
  fontWeight,
  tint,
} from '../../theme';

/** Screen title + optional subtitle, used at the top of content. */
export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.headingWrap}>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
    </View>
  );
}

/** Small uppercase section label. */
export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/** Centered empty-state with icon, message and optional action. */
export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={34} color={palette.slate400} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMsg}>{message}</Text> : null}
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

/** Colored status / category pill. */
export function Tag({
  label,
  color = palette.primary,
}: {
  label: string;
  color?: string;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: tint(color, 0.85) }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingWrap: { marginBottom: spacing.xl },
  heading: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: palette.ink,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: fontSize.base,
    color: palette.slate500,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: palette.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  empty: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: palette.slate700,
  },
  emptyMsg: {
    fontSize: fontSize.base,
    color: palette.slate500,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyAction: { marginTop: spacing.xl, alignSelf: 'stretch', paddingHorizontal: spacing.xl },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
