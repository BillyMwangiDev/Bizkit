import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { SectionLabel } from '../../components/ui/common';
import { ColorPicker, ThemePicker, LogoPicker, OptionPills } from '../../components/ui/controls';
import { useProfileStore } from '../../store/profileStore';
import { profileCompleteness } from '../../engine/quality';
import { CURRENCIES } from '../../constants';
import type { RootStackParamList } from '../../navigation/types';
import {
  palette,
  spacing,
  radius,
  fontSize,
  fontWeight,
  readableTextOn,
} from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((s) => s.profile);
  const prefixes = useProfileStore((s) => s.prefixes);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const setPrefix = useProfileStore((s) => s.setPrefix);
  const readiness = useMemo(() => profileCompleteness(profile), [profile]);

  const [vatText, setVatText] = useState(String(profile.vatPercentage));
  const onVatChange = (t: string) => {
    const cleaned = t.replace(/[^0-9.]/g, '').replace(/(\.\d*)\./g, '$1');
    setVatText(cleaned);
    updateProfile({ vatPercentage: cleaned === '' || cleaned === '.' ? 0 : Number(cleaned) });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>

      {/* Profile summary */}
      <Card style={styles.profileCard} onPress={() => navigation.navigate('ProfileEdit')}>
        <View style={[styles.avatar, { backgroundColor: profile.brandColor }]}>
          {profile.logoUri ? (
            <Image source={{ uri: profile.logoUri }} style={styles.avatarImg} resizeMode="contain" />
          ) : (
            <Text style={[styles.avatarText, { color: readableTextOn(profile.brandColor) }]}>
              {(profile.businessName[0] ?? 'B').toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.flex}>
          <Text style={styles.profileName}>{profile.businessName || 'Your Business'}</Text>
          <Text style={styles.profileSub}>{profile.email || 'Edit business details'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.slate400} />
      </Card>

      <Card style={styles.readinessCard} onPress={() => navigation.navigate('ProfileEdit')}>
        <View style={styles.readinessHeader}>
          <View>
            <Text style={styles.readinessTitle}>Document readiness</Text>
            <Text style={styles.readinessSub}>
              {readiness.completed} of {readiness.total} client-facing details complete
            </Text>
          </View>
          <Text style={[styles.readinessScore, { color: profile.brandColor }]}>
            {readiness.score}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${readiness.score}%`, backgroundColor: profile.brandColor },
            ]}
          />
        </View>
        {readiness.missing.length > 0 ? (
          <View style={styles.missingRow}>
            {readiness.missing.slice(0, 4).map((item) => (
              <View key={item} style={styles.missingPill}>
                <Text style={styles.missingText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.readyText}>Your PDFs are ready for clients.</Text>
        )}
      </Card>

      <SectionLabel>Logo</SectionLabel>
      <LogoPicker value={profile.logoUri} onChange={(uri) => updateProfile({ logoUri: uri })} />

      <SectionLabel>Brand Color</SectionLabel>
      <View style={styles.block}>
        <ColorPicker value={profile.brandColor} onChange={(c) => updateProfile({ brandColor: c })} />
      </View>

      <SectionLabel>Document Theme</SectionLabel>
      <View style={styles.block}>
        <ThemePicker
          value={profile.theme}
          brandColor={profile.brandColor}
          onChange={(t) => updateProfile({ theme: t })}
        />
      </View>

      <SectionLabel>Default Currency</SectionLabel>
      <View style={styles.block}>
        <OptionPills
          options={CURRENCIES}
          value={profile.currency}
          brandColor={profile.brandColor}
          onChange={(c) => updateProfile({ currency: c })}
        />
      </View>

      <SectionLabel>VAT</SectionLabel>
      <TextField
        label="VAT Percentage"
        keyboardType="numeric"
        value={vatText}
        onChangeText={onVatChange}
      />

      <SectionLabel>Numbering Prefixes</SectionLabel>
      <View style={styles.prefixRow}>
        <TextField label="Invoice" value={prefixes.invoice} onChangeText={(t) => setPrefix('invoice', t)} autoCapitalize="characters" style={styles.prefixField} />
        <TextField label="Quotation" value={prefixes.quotation} onChangeText={(t) => setPrefix('quotation', t)} autoCapitalize="characters" style={styles.prefixField} />
      </View>
      <View style={styles.prefixRow}>
        <TextField label="Receipt" value={prefixes.receipt} onChangeText={(t) => setPrefix('receipt', t)} autoCapitalize="characters" style={styles.prefixField} />
        <TextField label="Proforma" value={prefixes.proforma} onChangeText={(t) => setPrefix('proforma', t)} autoCapitalize="characters" style={styles.prefixField} />
      </View>

      <Text style={styles.version}>BizKit • v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.slate50 },
  content: { padding: spacing.lg },
  flex: { flex: 1 },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: palette.ink,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  readinessCard: { marginBottom: spacing.xl },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  readinessTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: palette.ink },
  readinessSub: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },
  readinessScore: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.slate100,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  missingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  missingPill: {
    borderRadius: radius.pill,
    backgroundColor: palette.slate100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  missingText: { fontSize: fontSize.xs, color: palette.slate600, fontWeight: fontWeight.semibold },
  readyText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: palette.success,
    fontWeight: fontWeight.semibold,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  avatarImg: { width: '78%', height: '78%' },
  avatarText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  profileName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: palette.ink },
  profileSub: { fontSize: fontSize.sm, color: palette.slate500, marginTop: 2 },
  block: { marginBottom: spacing.xl },
  prefixRow: { flexDirection: 'row', gap: spacing.md },
  prefixField: { flex: 1 },
  version: {
    textAlign: 'center',
    color: palette.slate400,
    fontSize: fontSize.sm,
    marginTop: spacing.xl,
  },
});
