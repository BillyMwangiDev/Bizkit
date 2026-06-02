import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { SectionLabel } from '../../components/ui/common';
import { LogoPicker } from '../../components/ui/controls';
import { useProfileStore } from '../../store/profileStore';
import type { BusinessProfile } from '../../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const { control, handleSubmit, watch, setValue } = useForm<BusinessProfile>({
    defaultValues: profile,
  });
  const logoUri = watch('logoUri');

  const onSave = handleSubmit((data) => {
    updateProfile({ ...data, vatPercentage: Number(data.vatPercentage) || 0 });
    navigation.goBack();
  });

  return (
    <Screen footer={<Button label="Save changes" icon="checkmark" onPress={onSave} />}>
      <SectionLabel>Logo</SectionLabel>
      <LogoPicker value={logoUri} onChange={(uri) => setValue('logoUri', uri)} />

      <SectionLabel>Business</SectionLabel>
      <FormField control={control} name="businessName" label="Business Name" rules={{ required: 'Required' }} />
      <FormField control={control} name="businessDescription" label="Description" multiline />

      <SectionLabel>Contact</SectionLabel>
      <FormField control={control} name="phone" label="Phone" keyboardType="phone-pad" />
      <FormField
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        rules={{ pattern: { value: EMAIL_RE, message: 'Enter a valid email' } }}
      />
      <FormField control={control} name="address" label="Address" multiline />
      <FormField control={control} name="website" label="Website" autoCapitalize="none" />

      <SectionLabel>Tax & Payments</SectionLabel>
      <FormField control={control} name="kraPin" label="KRA PIN" autoCapitalize="characters" />
      <FormField control={control} name="mpesaTillOrPaybill" label="M-Pesa Till / Paybill" />
      <FormField control={control} name="bankDetails.bankName" label="Bank Name" />
      <FormField control={control} name="bankDetails.accountName" label="Account Name" />
      <FormField control={control} name="bankDetails.accountNumber" label="Account Number" keyboardType="numeric" />
      <FormField control={control} name="bankDetails.branch" label="Branch" />
    </Screen>
  );
}
