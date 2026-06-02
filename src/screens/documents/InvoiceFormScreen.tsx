import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { DateField } from '../../components/ui/DateField';
import { SectionLabel } from '../../components/ui/common';
import { ToggleRow, OptionPills } from '../../components/ui/controls';
import { ItemsEditor } from '../../components/ItemsEditor';
import { ClientSuggestions } from '../../components/ClientSuggestions';
import { useProfileStore } from '../../store/profileStore';
import { useDocSubmit } from './useDocSubmit';
import { usePrefill } from './usePrefill';
import { computeTotals } from '../../utils/calc';
import { formatMoney, todayISO, addDaysISO } from '../../utils/format';
import { CURRENCIES } from '../../constants';
import { uid } from '../../utils/id';
import type { InvoiceData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { palette, spacing, fontSize, fontWeight } from '../../theme';

type R = RouteProp<RootStackParamList, 'InvoiceForm' | 'ProformaForm'>;

function emptyInvoice(currency: string): InvoiceData {
  return {
    customer: { name: '', email: '', phone: '', kraPin: '' },
    invoiceDate: todayISO(),
    dueDate: addDaysISO(todayISO(), 14),
    items: [{ id: uid('item_'), name: '', quantity: 1, unitPrice: 0 }],
    vatEnabled: true,
    currency,
    notes: '',
    terms: 'Payment due within 14 days.',
  };
}

export function InvoiceFormScreen({ docType = 'invoice' as const }: { docType?: 'invoice' | 'proforma' }) {
  const navigation = useNavigation();
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const vatPercentage = useProfileStore((s) => s.profile.vatPercentage);
  const profileCurrency = useProfileStore((s) => s.profile.currency);
  const brandColor = useProfileStore((s) => s.profile.brandColor);
  const prefill = usePrefill<InvoiceData>(editId ?? route.params?.prefillId, emptyInvoice(profileCurrency));
  const peekNextNumber = useProfileStore((s) => s.peekNextNumber);
  const submit = useDocSubmit(docType, editId);

  const { control, handleSubmit, setValue } = useForm<InvoiceData>({
    defaultValues: { ...prefill, currency: prefill.currency || profileCurrency },
  });

  const items = useWatch({ control, name: 'items' });
  const customerName = useWatch({ control, name: 'customer.name' });
  const vatEnabled = useWatch({ control, name: 'vatEnabled' });
  const currency = useWatch({ control, name: 'currency' });
  const totals = computeTotals(items ?? [], vatEnabled, vatPercentage);

  const title = docType === 'proforma' ? 'Proforma Invoice' : 'Invoice';
  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? `Edit ${title}` : `${title} ${peekNextNumber(docType)}`,
    });
  }, [navigation, title, docType, peekNextNumber, editId]);

  return (
    <Screen
      footer={
        <View>
          <TotalsBar
            subtotal={totals.subtotal}
            vat={totals.vat}
            total={totals.total}
            vatEnabled={vatEnabled}
            vatPercentage={vatPercentage}
            currency={currency}
          />
          <Button
            label={editId ? 'Save changes' : `Preview ${title}`}
            icon={editId ? 'checkmark' : 'eye-outline'}
            onPress={handleSubmit(submit)}
          />
        </View>
      }
    >
      <SectionLabel>Customer</SectionLabel>
      <FormField
        control={control}
        name="customer.name"
        label="Customer Name"
        placeholder="Jane Doe"
        rules={{ required: 'Customer name is required' }}
      />
      <ClientSuggestions
        query={customerName ?? ''}
        brandColor={brandColor}
        onSelect={(customer) => {
          setValue('customer.name', customer.name);
          setValue('customer.email', customer.email);
          setValue('customer.phone', customer.phone);
          setValue('customer.kraPin', customer.kraPin);
        }}
      />
      <FormField control={control} name="customer.email" label="Email" keyboardType="email-address" autoCapitalize="none" />
      <FormField control={control} name="customer.phone" label="Phone" keyboardType="phone-pad" />
      <FormField control={control} name="customer.kraPin" label="KRA PIN" autoCapitalize="characters" />

      <SectionLabel>Dates</SectionLabel>
      <View style={styles.row}>
        <DateField control={control} name="invoiceDate" label="Invoice Date" style={styles.flex} />
        <DateField control={control} name="dueDate" label="Due Date" style={styles.flex} />
      </View>

      <SectionLabel>Currency</SectionLabel>
      <OptionPills
        options={CURRENCIES}
        value={currency}
        brandColor={brandColor}
        onChange={(v) => setValue('currency', v)}
      />

      <SectionLabel>Items</SectionLabel>
      <ItemsEditor control={control} name="items" currency={currency} />

      <ToggleRow
        label={`Apply VAT (${vatPercentage}%)`}
        description="Adds VAT to the subtotal"
        value={vatEnabled}
        onChange={(v) => setValue('vatEnabled', v)}
      />

      <SectionLabel>Notes & Terms</SectionLabel>
      <FormField control={control} name="notes" label="Notes" placeholder="Thank you for your business." multiline />
      <FormField control={control} name="terms" label="Terms" multiline />
    </Screen>
  );
}

function TotalsBar({
  subtotal,
  vat,
  total,
  vatEnabled,
  vatPercentage,
  currency,
}: {
  subtotal: number;
  vat: number;
  total: number;
  vatEnabled: boolean;
  vatPercentage: number;
  currency: string;
}) {
  return (
    <View style={styles.totalsBar}>
      <View style={styles.totalsLine}>
        <Text style={styles.totalsLabel}>Subtotal</Text>
        <Text style={styles.totalsValue}>{formatMoney(subtotal, currency)}</Text>
      </View>
      {vatEnabled && (
        <View style={styles.totalsLine}>
          <Text style={styles.totalsLabel}>VAT ({vatPercentage}%)</Text>
          <Text style={styles.totalsValue}>{formatMoney(vat, currency)}</Text>
        </View>
      )}
      <View style={[styles.totalsLine, styles.grandLine]}>
        <Text style={styles.grandLabel}>Total</Text>
        <Text style={styles.grandValue}>{formatMoney(total, currency)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  totalsBar: { marginBottom: spacing.md },
  totalsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalsLabel: { fontSize: fontSize.base, color: palette.slate500 },
  totalsValue: { fontSize: fontSize.base, color: palette.slate700, fontWeight: fontWeight.medium },
  grandLine: { marginTop: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.slate100 },
  grandLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: palette.ink },
  grandValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: palette.ink },
});
