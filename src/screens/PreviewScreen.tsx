import React, { useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/common';
import { useProfileStore } from '../store/profileStore';
import { useDocumentStore } from '../store/documentStore';
import { renderDocument } from '../engine/render';
import { generateNamedPdf, sharePdf } from '../engine/pdf';
import { createDocument } from '../engine/factory';
import { conversionLabel, conversionTarget, convertToInvoiceData } from '../engine/conversions';
import { documentQualityWarnings } from '../engine/quality';
import { FORM_ROUTE } from '../navigation/types';
import type { RootStackParamList } from '../navigation/types';
import type { DocumentData } from '../types';
import { palette, spacing, radius, shadow, fontSize, fontWeight } from '../theme';

type R = RouteProp<RootStackParamList, 'Preview'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PreviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const profile = useProfileStore((s) => s.profile);
  const consumeNextNumber = useProfileStore((s) => s.consumeNextNumber);
  const doc = useDocumentStore((s) =>
    s.documents.find((d) => d.id === route.params.documentId)
  );
  const addDocument = useDocumentStore((s) => s.addDocument);

  const [busy, setBusy] = useState<null | 'share' | 'save' | 'convert'>(null);

  const html = useMemo(
    () => (doc ? renderDocument(doc, profile) : ''),
    [doc, profile]
  );

  // Header "Edit" action: reopen this document's form in edit-in-place mode.
  useLayoutEffect(() => {
    if (!doc) return;
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit document"
          onPress={() =>
            navigation.navigate(
              FORM_ROUTE[doc.type] as keyof RootStackParamList,
              { editId: doc.id } as never
            )
          }
        >
          <Text style={[styles.editAction, { color: profile.brandColor }]}>Edit</Text>
        </Pressable>
      ),
    });
  }, [navigation, doc, profile.brandColor]);

  if (!doc) {
    return (
      <Screen scroll={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Document not found"
          message="It may have been deleted."
          action={<Button label="Go back" onPress={() => navigation.goBack()} />}
        />
      </Screen>
    );
  }

  const continueWithWarnings = (action: string, run: () => void) => {
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
        { text: action, onPress: run },
      ]
    );
  };

  const onShare = () =>
    continueWithWarnings('Share anyway', async () => {
    try {
      setBusy('share');
      const uri = await generateNamedPdf(doc, profile);
      await sharePdf(uri);
    } catch (e) {
      Alert.alert('Could not share', String((e as Error).message ?? e));
    } finally {
      setBusy(null);
    }
  });

  const onSave = () =>
    continueWithWarnings('Save anyway', async () => {
    try {
      setBusy('save');
      await generateNamedPdf(doc, profile);
      Alert.alert('Saved', 'PDF saved to the app documents folder.');
    } catch (e) {
      Alert.alert('Could not save', String((e as Error).message ?? e));
    } finally {
      setBusy(null);
    }
  });

  const onConvert = () => {
    const target = conversionTarget(doc);
    if (!target) return;
    if (target === 'receipt' && doc.type === 'invoice') {
      navigation.navigate('ReceiptForm', { sourceInvoiceId: doc.id });
      return;
    }

    const data = convertToInvoiceData(doc, profile);
    if (!data) return;

    try {
      setBusy('convert');
      const number = consumeNextNumber(target);
      const converted = createDocument(target, number, data as DocumentData, profile);
      addDocument(converted);
      navigation.replace('Preview', { documentId: converted.id });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen
      scroll={false}
      footer={
        <View style={styles.actions}>
          {conversionTarget(doc) && (
            <Button
              label={conversionLabel(doc)}
              icon="copy-outline"
              variant="secondary"
              onPress={onConvert}
              loading={busy === 'convert'}
              style={styles.full}
            />
          )}
          <Button
            label="Save"
            icon="download-outline"
            variant="secondary"
            onPress={onSave}
            loading={busy === 'save'}
            style={styles.flex}
          />
          <Button
            label="Share PDF"
            icon="share-outline"
            onPress={onShare}
            loading={busy === 'share'}
            style={styles.flex}
          />
        </View>
      }
    >
      <View style={styles.previewShell}>
        <View style={styles.previewBar}>
          <View style={styles.previewDot} />
          <Text style={styles.previewTitle}>A4 PDF Preview</Text>
          <Text style={styles.previewMeta}>{doc.number || doc.title}</Text>
        </View>
        <View style={styles.stage}>
          <View style={styles.page}>
            <View style={styles.paperTop} />
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={styles.web}
              showsVerticalScrollIndicator={false}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loading}>
                  <ActivityIndicator color={profile.brandColor} />
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewShell: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.slate200,
    ...shadow.card,
  },
  previewBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate100,
    backgroundColor: palette.white,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.success,
  },
  previewTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: palette.ink },
  previewMeta: {
    flex: 1,
    textAlign: 'right',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: palette.slate400,
  },
  stage: {
    flex: 1,
    backgroundColor: palette.slate100,
    padding: spacing.md,
  },
  page: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.slate200,
    ...shadow.soft,
  },
  paperTop: { height: 6, backgroundColor: palette.white },
  web: { flex: 1, backgroundColor: palette.white },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  full: { width: '100%' },
  flex: { flex: 1 },
  editAction: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
