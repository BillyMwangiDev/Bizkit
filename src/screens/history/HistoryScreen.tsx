import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Tag, EmptyState } from '../../components/ui/common';
import { useProfileStore } from '../../store/profileStore';
import { useDocumentStore } from '../../store/documentStore';
import { DOC_TYPE_LABELS, PAYMENT_STATUS_META } from '../../constants';
import { generateNamedPdf, sharePdf } from '../../engine/pdf';
import { createDocument } from '../../engine/factory';
import {
  conversionLabel,
  conversionTarget,
  convertToInvoiceData,
} from '../../engine/conversions';
import { documentQualityWarnings } from '../../engine/quality';
import { FORM_ROUTE } from '../../navigation/types';
import type { RootStackParamList } from '../../navigation/types';
import type { BizDocument, DocumentData, DocumentType } from '../../types';
import {
  palette,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from '../../theme';
import { formatMoney, formatDate } from '../../utils/format';
import { displayStatus } from '../../utils/status';
import { invoiceBalance } from '../../utils/payments';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | DocumentType;
type StatusFilter = 'all' | 'unpaid' | 'partial' | 'overdue' | 'paid';
type DateFilter = 'all' | '7d' | '30d' | 'year';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'quotation', label: 'Quotes' },
  { key: 'receipt', label: 'Receipts' },
  { key: 'proforma', label: 'Proforma' },
  { key: 'company_profile', label: 'Profiles' },
  { key: 'service_agreement', label: 'Agreements' },
  { key: 'letterhead', label: 'Letterheads' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Any status' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'partial', label: 'Partial' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
];

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'Any time' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'year', label: 'This year' },
];

function displayAmount(doc: BizDocument): number {
  return doc.type === 'invoice' ? invoiceBalance(doc) : doc.totals?.total ?? 0;
}

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((s) => s.profile);
  const consumeNextNumber = useProfileStore((s) => s.consumeNextNumber);
  const documents = useDocumentStore((s) => s.documents);
  const addDocument = useDocumentStore((s) => s.addDocument);
  const removeDocument = useDocumentStore((s) => s.removeDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sort, setSort] = useState<'recent' | 'amount'>('recent');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const matches = documents.filter((d) => {
      if (filter !== 'all' && d.type !== filter) return false;
      if (statusFilter !== 'all' && displayStatus(d) !== statusFilter) return false;
      if (dateFilter !== 'all') {
        const created = new Date(d.createdAt);
        if (Number.isNaN(created.getTime())) return false;
        if (dateFilter === 'year' && created.getFullYear() !== now.getFullYear()) return false;
        if (dateFilter === '7d' || dateFilter === '30d') {
          const days = dateFilter === '7d' ? 7 : 30;
          const cutoff = new Date(now);
          cutoff.setDate(cutoff.getDate() - days);
          if (created < cutoff) return false;
        }
      }
      if (!q) return true;
      return (
        d.customerName.toLowerCase().includes(q) ||
        d.number.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q)
      );
    });
    if (sort === 'amount') {
      // Copy first: documents is the store array and sort() mutates in place.
      return [...matches].sort((a, b) => displayAmount(b) - displayAmount(a));
    }
    return matches; // already newest-first from the store
  }, [documents, query, filter, statusFilter, dateFilter, sort]);

  // Only show a money total when every filtered doc shares one currency —
  // summing across currencies would be meaningless.
  const summary = useMemo(() => {
    const withTotals = filtered.filter((d) => d.totals);
    const currencies = new Set(withTotals.map((d) => d.currency));
    const total = withTotals.reduce((sum, d) => sum + displayAmount(d), 0);
    return { total, currency: currencies.size === 1 ? [...currencies][0] : null };
  }, [filtered]);

  const shareAgain = (doc: BizDocument) => {
    const run = async () => {
      try {
        const uri = await generateNamedPdf(doc, profile);
        await sharePdf(uri);
      } catch (e) {
        Alert.alert('Could not share', String((e as Error).message ?? e));
      }
    };
    const warnings = documentQualityWarnings(doc, profile);
    if (!warnings.length) {
      run();
      return;
    }
    Alert.alert(
      'Check before sharing',
      `${warnings.slice(0, 4).join('\n')}${warnings.length > 4 ? '\nMore items need attention.' : ''}`,
      [
        { text: 'Review', style: 'cancel' },
        { text: 'Share anyway', onPress: run },
      ]
    );
  };

  const convertDocument = (doc: BizDocument) => {
    const target = conversionTarget(doc);
    if (!target) return;
    if (target === 'receipt' && doc.type === 'invoice') {
      navigation.navigate('ReceiptForm', { sourceInvoiceId: doc.id });
      return;
    }
    const data = convertToInvoiceData(doc, profile);
    if (!data) return;

    const number = consumeNextNumber(target);
    const converted = createDocument(target, number, data as DocumentData, profile);
    addDocument(converted);
    navigation.navigate('Preview', { documentId: converted.id });
  };

  const openActions = (doc: BizDocument) => {
    const markPaidAction =
      doc.type === 'invoice'
        ? [
            {
              text: doc.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid',
              onPress: () =>
                updateDocument(doc.id, {
                  status: doc.status === 'paid' ? 'unpaid' : 'paid',
                  paidAmount: doc.status === 'paid' ? 0 : doc.totals?.total ?? 0,
                  paidAt: doc.status === 'paid' ? null : new Date().toISOString(),
                }),
            },
          ]
        : [];
    const convertAction = conversionTarget(doc)
      ? [
          {
            text: conversionLabel(doc),
            onPress: () => convertDocument(doc),
          },
        ]
      : [];
    Alert.alert(doc.number || doc.title, doc.customerName || undefined, [
      { text: 'Open', onPress: () => navigation.navigate('Preview', { documentId: doc.id }) },
      {
        text: 'Edit',
        onPress: () =>
          navigation.navigate(
            FORM_ROUTE[doc.type] as keyof RootStackParamList,
            { editId: doc.id } as never
          ),
      },
      {
        text: 'Share again',
        onPress: () => shareAgain(doc),
      },
      ...convertAction,
      {
        text: 'Duplicate',
        onPress: () =>
          navigation.navigate(
            FORM_ROUTE[doc.type] as keyof RootStackParamList,
            { prefillId: doc.id } as never
          ),
      },
      ...markPaidAction,
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete document?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeDocument(doc.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: BizDocument }) => {
    const status = displayStatus(item);
    return (
    <Card style={styles.row} onPress={() => navigation.navigate('Preview', { documentId: item.id })}>
      <View style={styles.flex}>
        <View style={styles.tagRow}>
          <Tag label={DOC_TYPE_LABELS[item.type]} color={profile.brandColor} />
          {status && (
            <Tag label={PAYMENT_STATUS_META[status].label} color={PAYMENT_STATUS_META[status].color} />
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.customerName || item.title}
        </Text>
        <Text style={styles.meta}>
          {item.number ? `${item.number} • ` : ''}
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <View style={styles.right}>
        {item.totals && (
          <Text style={styles.amount}>
            {formatMoney(displayAmount(item), item.currency)}
          </Text>
        )}
        <Pressable
          hitSlop={10}
          onPress={() => openActions(item)}
          style={styles.more}
          accessibilityRole="button"
          accessibilityLabel={`Actions for ${item.number || item.title}`}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={palette.slate400} />
        </Pressable>
      </View>
    </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Documents</Text>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={palette.slate400} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or number"
          placeholderTextColor={palette.slate400}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={palette.slate400} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <Pressable
              onPress={() => setFilter(item.key)}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: profile.brandColor, borderColor: profile.brandColor }
                  : { borderColor: palette.slate200 },
              ]}
            >
              <Text style={[styles.chipText, active && { color: palette.white }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.refineRow}>
        {STATUS_FILTERS.map((item) => {
          const active = statusFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setStatusFilter(item.key)}
              style={[
                styles.smallChip,
                active
                  ? { backgroundColor: profile.brandColor, borderColor: profile.brandColor }
                  : { borderColor: palette.slate200 },
              ]}
            >
              <Text style={[styles.smallChipText, active && { color: palette.white }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.refineRow}>
        {DATE_FILTERS.map((item) => {
          const active = dateFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setDateFilter(item.key)}
              style={[
                styles.smallChip,
                active
                  ? { backgroundColor: palette.ink, borderColor: palette.ink }
                  : { borderColor: palette.slate200 },
              ]}
            >
              <Text style={[styles.smallChipText, active && { color: palette.white }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filtered.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {filtered.length} {filtered.length === 1 ? 'document' : 'documents'}
            {summary.currency && summary.total > 0
              ? ` • ${formatMoney(summary.total, summary.currency)}`
              : ''}
          </Text>
          <Pressable
            onPress={() => setSort((s) => (s === 'recent' ? 'amount' : 'recent'))}
            style={styles.sortBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${sort === 'recent' ? 'amount' : 'most recent'}`}
          >
            <Ionicons name="swap-vertical" size={15} color={profile.brandColor} />
            <Text style={[styles.sortText, { color: profile.brandColor }]}>
              {sort === 'recent' ? 'Recent' : 'Amount'}
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title={documents.length === 0 ? 'No documents yet' : 'No matches'}
            message={
              documents.length === 0
                ? 'Create your first document from the dashboard.'
                : 'Try a different search or filter.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.slate50, paddingHorizontal: spacing.lg },
  flex: { flex: 1 },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: palette.ink,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.slate200,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: palette.ink },
  filters: { marginTop: spacing.md, flexGrow: 0 },
  filtersContent: { gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: palette.white,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: palette.slate600 },
  refineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  smallChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: palette.white,
  },
  smallChipText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: palette.slate600 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryText: { fontSize: fontSize.sm, color: palette.slate500, fontWeight: fontWeight.medium },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs },
  sortText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  list: { paddingTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: palette.ink, marginTop: spacing.sm },
  meta: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: spacing.md },
  amount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: palette.ink },
  more: { marginTop: spacing.sm },
});
