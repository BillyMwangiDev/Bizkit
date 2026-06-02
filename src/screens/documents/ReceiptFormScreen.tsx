import React, { useLayoutEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { DateField } from '../../components/ui/DateField';
import { SectionLabel } from '../../components/ui/common';
import { OptionPills } from '../../components/ui/controls';
import { ClientSuggestions } from '../../components/ClientSuggestions';
import { useProfileStore } from '../../store/profileStore';
import { useDocumentStore } from '../../store/documentStore';
import { useDocSubmit } from './useDocSubmit';
import { usePrefill } from './usePrefill';
import { convertToReceiptData } from '../../engine/conversions';
import { todayISO } from '../../utils/format';
import { applyInvoicePayment } from '../../utils/payments';
import { PAYMENT_METHODS, CURRENCIES } from '../../constants';
import type { ReceiptData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type R = RouteProp<RootStackParamList, 'ReceiptForm'>;

function emptyReceipt(currency: string): ReceiptData {
  return {
    customer: { name: '', email: '', phone: '', kraPin: '' },
    amountPaid: 0,
    currency,
    paymentMethod: 'M-Pesa',
    paymentDate: todayISO(),
    referenceNumber: '',
    notes: '',
  };
}

export function ReceiptFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const sourceInvoiceId = route.params?.sourceInvoiceId;
  const brandColor = useProfileStore((s) => s.profile.brandColor);
  const profile = useProfileStore((s) => s.profile);
  const sourceInvoice = useDocumentStore((s) =>
    sourceInvoiceId ? s.documents.find((d) => d.id === sourceInvoiceId) : undefined
  );
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const profileCurrency = profile.currency;
  const defaultReceipt =
    sourceInvoice && sourceInvoice.type === 'invoice'
      ? convertToReceiptData(sourceInvoice, profile) ?? emptyReceipt(profileCurrency)
      : emptyReceipt(profileCurrency);
  const prefill = usePrefill<ReceiptData>(editId ?? route.params?.prefillId, defaultReceipt);
  const peekNextNumber = useProfileStore((s) => s.peekNextNumber);
  const submit = useDocSubmit('receipt', editId, {
    afterCreate: (receipt) => {
      if (!sourceInvoice || sourceInvoice.type !== 'invoice') return;
      updateDocument(
        sourceInvoice.id,
        applyInvoicePayment(sourceInvoice, receipt.totals?.total ?? 0, receipt.createdAt)
      );
    },
  });

  const { control, handleSubmit, setValue } = useForm<ReceiptData>({
    defaultValues: { ...prefill, currency: prefill.currency || profileCurrency },
  });
  const customerName = useWatch({ control, name: 'customer.name' });
  const method = useWatch({ control, name: 'paymentMethod' });
  const currency = useWatch({ control, name: 'currency' });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editId ? 'Edit Receipt' : `Receipt ${peekNextNumber('receipt')}`,
    });
  }, [navigation, peekNextNumber, editId]);

  return (
    <Screen
      footer={
        <Button
          label={editId ? 'Save changes' : 'Preview Receipt'}
          icon={editId ? 'checkmark' : 'eye-outline'}
          onPress={handleSubmit(submit)}
        />
      }
    >
      <SectionLabel>Customer</SectionLabel>
      <FormField
        control={control}
        name="customer.name"
        label="Received From"
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
      <FormField control={control} name="customer.phone" label="Phone" keyboardType="phone-pad" />

      <SectionLabel>Payment</SectionLabel>
      <OptionPills
        options={CURRENCIES}
        value={currency}
        brandColor={brandColor}
        onChange={(v) => setValue('currency', v)}
      />
      <FormField
        control={control}
        name="amountPaid"
        label={`Amount Paid (${currency})`}
        numeric
        rules={{ required: 'Amount is required', min: { value: 1, message: 'Enter an amount' } }}
      />
      <DateField control={control} name="paymentDate" label="Payment Date" />

      <SectionLabel>Method</SectionLabel>
      <OptionPills
        options={PAYMENT_METHODS}
        value={method}
        brandColor={brandColor}
        onChange={(v) => setValue('paymentMethod', v)}
      />
      <FormField control={control} name="referenceNumber" label="Reference Number" placeholder="e.g. M-Pesa code" autoCapitalize="characters" />

      <SectionLabel>Notes</SectionLabel>
      <FormField control={control} name="notes" label="Notes" multiline />
    </Screen>
  );
}
