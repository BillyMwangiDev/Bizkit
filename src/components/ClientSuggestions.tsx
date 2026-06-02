import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDocumentStore } from '../store/documentStore';
import type { CustomerInfo } from '../types';
import { clientsFromDocuments, matchClients } from '../utils/clients';
import { palette, radius, spacing, fontSize, fontWeight, tint } from '../theme';

interface ClientSuggestionsProps {
  query: string;
  brandColor: string;
  onSelect: (customer: CustomerInfo) => void;
}

export function ClientSuggestions({
  query,
  brandColor,
  onSelect,
}: ClientSuggestionsProps) {
  const documents = useDocumentStore((s) => s.documents);
  const suggestions = useMemo(
    () => matchClients(clientsFromDocuments(documents), query),
    [documents, query]
  );

  if (!suggestions.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={15} color={palette.slate400} />
        <Text style={styles.title}>Recent clients</Text>
      </View>
      <View style={styles.list}>
        {suggestions.map((client) => (
          <Pressable
            key={`${client.name}-${client.email}-${client.phone}`}
            onPress={() => onSelect(client)}
            style={({ pressed }) => [
              styles.item,
              { borderColor: tint(brandColor, 0.72), backgroundColor: tint(brandColor, 0.94) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Use ${client.name}`}
          >
            <Text style={[styles.name, { color: brandColor }]} numberOfLines={1}>
              {client.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {[client.email, client.phone].filter(Boolean).join(' | ') || 'Client details'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -spacing.sm, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  title: { fontSize: fontSize.xs, color: palette.slate400, fontWeight: fontWeight.bold },
  list: { gap: spacing.sm },
  item: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.86 },
  name: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  meta: { fontSize: fontSize.xs, color: palette.slate500, marginTop: 2 },
});

