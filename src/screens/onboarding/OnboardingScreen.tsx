import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { PageHeading, SectionLabel } from '../../components/ui/common';
import {
  ColorPicker,
  ThemePicker,
  LogoPicker,
  OptionPills,
} from '../../components/ui/controls';
import { useProfileStore } from '../../store/profileStore';
import { EMPTY_PROFILE, CURRENCIES } from '../../constants';
import type { BusinessProfile } from '../../types';
import { palette, spacing, radius, fontSize, fontWeight } from '../../theme';

const STEPS = ['Business', 'Contact', 'Tax & Payments', 'Branding'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OnboardingScreen() {
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, watch, setValue, trigger } =
    useForm<BusinessProfile>({
      defaultValues: EMPTY_PROFILE,
      mode: 'onChange',
    });

  const brandColor = watch('brandColor');
  const theme = watch('theme');
  const logoUri = watch('logoUri');
  const currency = watch('currency');

  /** Fields validated before advancing past each step. */
  const stepFields: (keyof BusinessProfile)[][] = [
    ['businessName'],
    ['email'],
    [],
    [],
  ];

  const onNext = async () => {
    const valid = await trigger(stepFields[step] as never);
    if (!valid) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const onFinish = handleSubmit((data) => {
    completeOnboarding({
      ...data,
      vatPercentage: Number(data.vatPercentage) || 0,
    });
  });

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          {step > 0 && (
            <Button
              label="Back"
              variant="secondary"
              fullWidth={false}
              onPress={() => setStep(step - 1)}
              style={styles.backBtn}
            />
          )}
          {step < STEPS.length - 1 ? (
            <Button label="Continue" icon="arrow-forward" onPress={onNext} style={styles.flex} />
          ) : (
            <Button label="Finish setup" icon="checkmark" onPress={onFinish} style={styles.flex} />
          )}
        </View>
      }
    >
      <View style={[styles.progress, { marginTop: insets.top + spacing.sm }]}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBar,
              { backgroundColor: i <= step ? brandColor : palette.slate200 },
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepCount}>
        Step {step + 1} of {STEPS.length}
      </Text>

      {step === 0 && (
        <View>
          <PageHeading
            title="Welcome to BizKit"
            subtitle="Set up your business once — it auto-fills every document."
          />
          <SectionLabel>Logo</SectionLabel>
          <LogoPicker value={logoUri} onChange={(uri) => setValue('logoUri', uri)} />
          <FormField
            control={control}
            name="businessName"
            label="Business Name"
            placeholder="Acme Solutions Ltd"
            rules={{ required: 'Business name is required' }}
          />
          <FormField
            control={control}
            name="businessDescription"
            label="Short Description"
            placeholder="What does your business do?"
            multiline
          />
        </View>
      )}

      {step === 1 && (
        <View>
          <PageHeading title="Contact details" subtitle="Shown on every document header." />
          <FormField
            control={control}
            name="phone"
            label="Phone Number"
            placeholder="+254 700 000 000"
            keyboardType="phone-pad"
          />
          <FormField
            control={control}
            name="email"
            label="Email Address"
            placeholder="hello@business.com"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{
              pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
            }}
          />
          <FormField
            control={control}
            name="address"
            label="Physical Address"
            placeholder="Street, City"
            multiline
          />
          <FormField
            control={control}
            name="website"
            label="Website"
            placeholder="www.business.com"
            autoCapitalize="none"
          />
        </View>
      )}

      {step === 2 && (
        <View>
          <PageHeading title="Tax & payments" subtitle="Used on invoices, receipts and quotes." />
          <SectionLabel>Default Currency</SectionLabel>
          <OptionPills
            options={CURRENCIES}
            value={currency}
            brandColor={brandColor}
            onChange={(c) => setValue('currency', c)}
          />
          <View style={styles.row}>
            <FormField
              control={control}
              name="kraPin"
              label="KRA PIN (optional)"
              placeholder="A000000000X"
              autoCapitalize="characters"
              style={styles.flex}
            />
            <FormField
              control={control}
              name="vatPercentage"
              label="VAT %"
              numeric
              style={styles.vat}
            />
          </View>
          <SectionLabel>Bank Details</SectionLabel>
          <FormField control={control} name="bankDetails.bankName" label="Bank Name" placeholder="e.g. Equity Bank" />
          <FormField control={control} name="bankDetails.accountName" label="Account Name" />
          <FormField control={control} name="bankDetails.accountNumber" label="Account Number" keyboardType="numeric" />
          <FormField control={control} name="bankDetails.branch" label="Branch" />
          <FormField
            control={control}
            name="mpesaTillOrPaybill"
            label="M-Pesa Till / Paybill"
            placeholder="e.g. Till 123456"
          />
        </View>
      )}

      {step === 3 && (
        <View>
          <PageHeading title="Make it yours" subtitle="Pick a brand color and document style." />
          <SectionLabel>Brand Color</SectionLabel>
          <View style={styles.colorWrap}>
            <ColorPicker value={brandColor} onChange={(c) => setValue('brandColor', c)} />
          </View>
          <SectionLabel>Document Theme</SectionLabel>
          <ThemePicker
            value={theme}
            brandColor={brandColor}
            onChange={(t) => setValue('theme', t)}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  progressBar: { flex: 1, height: 6, borderRadius: radius.pill },
  stepCount: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: palette.slate400,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  vat: { width: 100 },
  colorWrap: { marginBottom: spacing.xl },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  backBtn: { paddingHorizontal: spacing.xl },
});
