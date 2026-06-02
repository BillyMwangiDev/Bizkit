import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { InvoiceFormScreen } from '../screens/documents/InvoiceFormScreen';
import { ProformaFormScreen } from '../screens/documents/ProformaFormScreen';
import { QuotationFormScreen } from '../screens/documents/QuotationFormScreen';
import { ReceiptFormScreen } from '../screens/documents/ReceiptFormScreen';
import { CompanyProfileFormScreen } from '../screens/documents/CompanyProfileFormScreen';
import { ServiceAgreementFormScreen } from '../screens/documents/ServiceAgreementFormScreen';
import { LetterheadFormScreen } from '../screens/documents/LetterheadFormScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ProfileEditScreen } from '../screens/settings/ProfileEditScreen';
import { useProfileStore } from '../store/profileStore';
import { palette, fontWeight } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboarded = useProfileStore((s) => s.onboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.slate50 },
        headerShadowVisible: false,
        headerTintColor: palette.ink,
        headerTitleStyle: { fontWeight: fontWeight.bold },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.slate50 },
      }}
    >
      {!onboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={{ title: 'Invoice' }} />
          <Stack.Screen name="ProformaForm" component={ProformaFormScreen} options={{ title: 'Proforma Invoice' }} />
          <Stack.Screen name="QuotationForm" component={QuotationFormScreen} options={{ title: 'Quotation' }} />
          <Stack.Screen name="ReceiptForm" component={ReceiptFormScreen} options={{ title: 'Receipt' }} />
          <Stack.Screen name="CompanyProfileForm" component={CompanyProfileFormScreen} options={{ title: 'Company Profile' }} />
          <Stack.Screen name="ServiceAgreementForm" component={ServiceAgreementFormScreen} options={{ title: 'Service Agreement' }} />
          <Stack.Screen name="LetterheadForm" component={LetterheadFormScreen} options={{ title: 'Letterhead' }} />
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: 'Preview' }} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: 'Business Profile' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
