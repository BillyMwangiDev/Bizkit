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
import type { QuotationData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { palette, spacing, fontSize, fontWeight } from '../../theme';

type R = RouteProp<RootStackParamList, 'QuotationForm'>;

function emptyQuotation(currency: string): QuotationData {
  return {
    customer: { name: '', email: '', phone: '', kraPin: '' },
    projectTitle: '',
    description: '',
    items: [{ id: uid('item_'), name: '', quantity: 1, unitPrice: 0 }],
    validUntil: addDaysISO(todayISO(), 30),
    vatEnabled: true,
    currency,
    notes: '',
  };
}

export function QuotationFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const vatPercentage = useProfileStore((s) => s.profile.vatPercentage);
  const profileCurrency = useProfileStore((s) => s.profile.currency);
  const brandColor = useProfileStore((s) => s.profile.brandColor);
  const prefill = usePrefill<QuotationData>(editId ?? route.params?.prefillId, emptyQuotation(profileCurrency));
  const peekNextNumber = useProfileStore((s) => s.peekNextNumber);
  const submit = useDocSubmit('quotation', editId);

  const { control, handleSubmit, setValue } = useForm<QuotationData>({
    defaultValues: { ...prefill, currency: prefill.currency || profileCurrency },
  });
  const customerName = useWatch({ control, name: 'customer.name' });
  const items = useWatch({ control, name: 'items' });
  const vatEnabled = useWatch({ control, name: 'vatEnabled' });
  const currency = useWatch({ control, name: 'currency' });
  const totals = computeTotals(items ?? [], vatEnabled, vatPercentage);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit Quotation' : `Quotation ${peekNextNumber('quotation')}`,
    });
  }, [navigation, peekNextNumber, editId]);

  return (
    <Screen
      footer={
        <View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(totals.total, currency)}</Text>
          </View>
          <Button
            label={editId ? 'Save changes' : 'Preview Quotation'}
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

      <SectionLabel>Project</SectionLabel>
      <FormField
        control={control}
        name="projectTitle"
        label="Project Title"
        placeholder="Website redesign"
        rules={{ required: 'Project title is required' }}
      />
      <FormField control={control} name="description" label="Description / Scope" multiline />
      <DateField control={control} name="validUntil" label="Valid Until" />

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
        value={vatEnabled}
        onChange={(v) => setValue('vatEnabled', v)}
      />

      <SectionLabel>Notes</SectionLabel>
      <FormField control={control} name="notes" label="Notes" multiline />
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: palette.ink },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: palette.ink },
});
