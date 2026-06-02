import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/common';
import { useProfileStore } from '../store/profileStore';
import { useDocumentStore } from '../store/documentStore';
import { DOC_TYPE_META, DOC_TYPE_LABELS, PAYMENT_STATUS_META } from '../constants';
import type { RootStackParamList } from '../navigation/types';
import {
  palette,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadow,
  tint,
  readableTextOn,
} from '../theme';
import { formatMoney, formatDate } from '../utils/format';
import { displayStatus } from '../utils/status';
import { invoiceBalance } from '../utils/payments';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((s) => s.profile);
  const documents = useDocumentStore((s) => s.documents);
  const recent = documents.slice(0, 3);

  // At-a-glance totals. Amounts are grouped by currency (never summed across
  // currencies); the card shows the currency with the largest billed total.
  // Outstanding sums unpaid/overdue invoices in that same currency.
  const stats = useMemo(() => {
    const byCurrency = new Map<string, number>();
    const outstandingByCurrency = new Map<string, number>();
    documents.forEach((d) => {
      if (d.type !== 'invoice' && d.type !== 'proforma') return;
      const cur = d.currency || profile.currency;
      const amt = d.totals?.total ?? 0;
      byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + amt);
      if (d.type === 'invoice' && displayStatus(d) !== 'paid') {
        outstandingByCurrency.set(cur, (outstandingByCurrency.get(cur) ?? 0) + invoiceBalance(d));
      }
    });
    let currency = profile.currency;
    let invoiced = 0;
    byCurrency.forEach((amt, cur) => {
      if (amt > invoiced) {
        invoiced = amt;
        currency = cur;
      }
    });
    return {
      invoiced,
      outstanding: outstandingByCurrency.get(currency) ?? 0,
      currency,
      count: documents.length,
    };
  }, [documents, profile.currency]);

  const initials = profile.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <ScrollView
      style={{ backgroundColor: palette.slate50 }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.bizName} numberOfLines={1}>
            {profile.businessName || 'Your Business'}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: profile.brandColor }]}>
          {profile.logoUri ? (
            <Image source={{ uri: profile.logoUri }} style={styles.avatarImg} resizeMode="contain" />
          ) : (
            <Text style={[styles.avatarText, { color: readableTextOn(profile.brandColor) }]}>
              {initials || 'B'}
            </Text>
          )}
        </View>
      </View>

      {/* Hero quick action */}
      <Pressable
        style={[styles.hero, { backgroundColor: profile.brandColor }]}
        onPress={() => navigation.navigate('InvoiceForm', {})}
      >
        <View style={styles.flex}>
          <Text style={[styles.heroTitle, { color: readableTextOn(profile.brandColor) }]}>
            Create an invoice
          </Text>
          <Text style={[styles.heroSub, { color: readableTextOn(profile.brandColor) }]}>
            Branded & ready in under a minute
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="add" size={26} color={readableTextOn(profile.brandColor)} />
        </View>
      </Pressable>

      {/* At-a-glance stats */}
      {stats.count > 0 && (
        <View style={[styles.statsCard, shadow.soft]}>
          <View style={styles.statCol}>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(stats.invoiced, stats.currency)}
            </Text>
            <Text style={styles.statLabel}>Total invoiced</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text
              style={[
                styles.statValue,
                stats.outstanding > 0 && { color: PAYMENT_STATUS_META.unpaid.color },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(stats.outstanding, stats.currency)}
            </Text>
            <Text style={styles.statLabel}>Outstanding</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>
              {stats.count === 1 ? 'Document' : 'Documents'}
            </Text>
          </View>
        </View>
      )}

      {/* Document type grid */}
      <Text style={styles.sectionTitle}>Create document</Text>
      <View style={styles.grid}>
        {DOC_TYPE_META.map((meta) => (
          <Pressable
            key={meta.type}
            style={styles.gridItem}
            onPress={() => navigation.navigate(meta.route as keyof RootStackParamList, {} as never)}
          >
            <View style={[styles.tile, shadow.soft]}>
              <View style={[styles.tileIcon, { backgroundColor: tint(meta.color, 0.86) }]}>
                <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={22} color={meta.color} />
              </View>
              <Text style={styles.tileTitle}>{meta.title}</Text>
              <Text style={styles.tileSub}>{meta.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Recent documents */}
      {recent.length > 0 && (
        <>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Pressable onPress={() => navigation.navigate('History' as never)}>
              <Text style={[styles.seeAll, { color: profile.brandColor }]}>See all</Text>
            </Pressable>
          </View>
          {recent.map((doc) => (
            <Card
              key={doc.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('Preview', { documentId: doc.id })}
            >
              <View style={styles.recentRow}>
                <View style={styles.flex}>
                  <Tag label={DOC_TYPE_LABELS[doc.type]} color={profile.brandColor} />
                  <Text style={styles.recentName} numberOfLines={1}>
                    {doc.customerName || doc.title}
                  </Text>
                  <Text style={styles.recentMeta}>
                    {doc.number ? `${doc.number} • ` : ''}
                    {formatDate(doc.createdAt)}
                  </Text>
                </View>
                {doc.totals && (
                  <Text style={styles.recentAmount}>
                    {formatMoney(doc.type === 'invoice' ? invoiceBalance(doc) : doc.totals.total, doc.currency)}
                  </Text>
                )}
              </View>
            </Card>
          ))}
        </>
      )}
      <View style={{ height: insets.bottom + spacing.xl }} />
    </ScrollView>
  );
}

const COL_GAP = spacing.md;

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  hello: { fontSize: fontSize.base, color: palette.slate500 },
  bizName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: palette.ink,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    overflow: 'hidden',
  },
  avatarImg: { width: '78%', height: '78%' },
  avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    ...shadow.card,
  },
  heroTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  heroSub: { fontSize: fontSize.sm, opacity: 0.9, marginTop: 2 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.slate100,
    paddingVertical: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  statCol: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: palette.ink },
  statLabel: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: palette.slate100 },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: palette.ink,
    marginBottom: spacing.lg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP, marginBottom: spacing.xl },
  gridItem: { width: `${(100 - 4) / 2}%` },
  tile: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.slate100,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tileTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: palette.ink },
  tileSub: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  recentCard: { marginBottom: spacing.md },
  recentRow: { flexDirection: 'row', alignItems: 'center' },
  recentName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: palette.ink,
    marginTop: spacing.sm,
  },
  recentMeta: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },
  recentAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: palette.ink,
    marginLeft: spacing.md,
  },
});
