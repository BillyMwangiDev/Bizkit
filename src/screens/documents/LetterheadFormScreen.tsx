import React from 'react';
import { useForm } from 'react-hook-form';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { SectionLabel, PageHeading } from '../../components/ui/common';
import { useDocSubmit } from './useDocSubmit';
import { usePrefill } from './usePrefill';
import type { LetterheadData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type R = RouteProp<RootStackParamList, 'LetterheadForm'>;

export function LetterheadFormScreen() {
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const prefill = usePrefill<LetterheadData>(editId ?? route.params?.prefillId, { body: '' });
  const submit = useDocSubmit('letterhead', editId);
  const { control, handleSubmit } = useForm<LetterheadData>({ defaultValues: prefill });

  return (
    <Screen
      footer={
        <Button
          label={editId ? 'Save changes' : 'Preview Letterhead'}
          icon={editId ? 'checkmark' : 'eye-outline'}
          onPress={handleSubmit(submit)}
        />
      }
    >
      <PageHeading
        title="Branded Letterhead"
        subtitle="Your logo and contact details become a reusable letterhead. Add body text now, or leave it blank for a printable template."
      />
      <SectionLabel>Body (optional)</SectionLabel>
      <FormField
        control={control}
        name="body"
        label="Letter Content"
        placeholder="Dear Sir/Madam, ..."
        multiline
        numberOfLines={10}
      />
    </Screen>
  );
}
