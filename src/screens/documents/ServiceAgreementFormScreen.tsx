import React, { useLayoutEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { DateField } from '../../components/ui/DateField';
import { SectionLabel } from '../../components/ui/common';
import { OptionPills } from '../../components/ui/controls';
import { useProfileStore } from '../../store/profileStore';
import { useDocSubmit } from './useDocSubmit';
import { usePrefill } from './usePrefill';
import { todayISO } from '../../utils/format';
import { CURRENCIES } from '../../constants';
import type { ServiceAgreementData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type R = RouteProp<RootStackParamList, 'ServiceAgreementForm'>;

function empty(currency: string): ServiceAgreementData {
  return {
    clientName: '',
    serviceDescription: '',
    price: 0,
    currency,
    timeline: '',
    terms: '',
    effectiveDate: todayISO(),
  };
}

export function ServiceAgreementFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const profileCurrency = useProfileStore((s) => s.profile.currency);
  const brandColor = useProfileStore((s) => s.profile.brandColor);
  const prefill = usePrefill<ServiceAgreementData>(editId ?? route.params?.prefillId, empty(profileCurrency));
  const submit = useDocSubmit('service_agreement', editId);
  const { control, handleSubmit, setValue } = useForm<ServiceAgreementData>({
    defaultValues: { ...prefill, currency: prefill.currency || profileCurrency },
  });
  const currency = useWatch({ control, name: 'currency' });

  useLayoutEffect(() => {
    if (editId) navigation.setOptions({ title: 'Edit Service Agreement' });
  }, [navigation, editId]);

  return (
    <Screen
      footer={
        <Button
          label={editId ? 'Save changes' : 'Preview Agreement'}
          icon={editId ? 'checkmark' : 'eye-outline'}
          onPress={handleSubmit(submit)}
        />
      }
    >
      <SectionLabel>Parties</SectionLabel>
      <FormField
        control={control}
        name="clientName"
        label="Client Name"
        rules={{ required: 'Client name is required' }}
      />
      <DateField control={control} name="effectiveDate" label="Effective Date" />

      <SectionLabel>Engagement</SectionLabel>
      <FormField
        control={control}
        name="serviceDescription"
        label="Service Description"
        placeholder="Describe the services to be provided"
        multiline
        rules={{ required: 'Describe the services' }}
      />
      <OptionPills
        options={CURRENCIES}
        value={currency}
        brandColor={brandColor}
        onChange={(v) => setValue('currency', v)}
      />
      <FormField control={control} name="price" label={`Price (${currency})`} numeric />
      <FormField control={control} name="timeline" label="Timeline" placeholder="e.g. 6 weeks from signing" />

      <SectionLabel>Terms</SectionLabel>
      <FormField control={control} name="terms" label="Terms & Conditions" multiline />
    </Screen>
  );
}
