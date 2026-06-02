import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { TextField } from '../../components/ui/TextField';
import { SectionLabel } from '../../components/ui/common';
import { useDocSubmit } from './useDocSubmit';
import { useDocumentStore } from '../../store/documentStore';
import type { CompanyProfileData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { palette, radius, spacing, fontSize, fontWeight } from '../../theme';

type R = RouteProp<RootStackParamList, 'CompanyProfileForm'>;

/** Form shape: services held as objects so the field array has stable keys. */
interface FormVals {
  overview: string;
  mission: string;
  vision: string;
  services: { value: string }[];
}

export function CompanyProfileFormScreen() {
  const route = useRoute<R>();
  const editId = route.params?.editId;
  const submit = useDocSubmit('company_profile', editId);

  // Resolve prefill (edit / duplicate flow) and map string[] -> {value}[].
  const sourceId = editId ?? route.params?.prefillId;
  const prefillDoc = useDocumentStore((s) =>
    sourceId ? s.documents.find((d) => d.id === sourceId) : undefined
  );
  const prefill = prefillDoc?.data as CompanyProfileData | undefined;

  const { control, handleSubmit } = useForm<FormVals>({
    defaultValues: {
      overview: prefill?.overview ?? '',
      mission: prefill?.mission ?? '',
      vision: prefill?.vision ?? '',
      services: (prefill?.services ?? ['']).map((value) => ({ value })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'services' });

  const onSubmit = (vals: FormVals) => {
    const data: CompanyProfileData = {
      overview: vals.overview,
      mission: vals.mission,
      vision: vals.vision,
      services: vals.services.map((s) => s.value).filter((s) => s.trim()),
    };
    submit(data);
  };

  return (
    <Screen
      footer={
        <Button
          label={editId ? 'Save changes' : 'Preview Profile'}
          icon={editId ? 'checkmark' : 'eye-outline'}
          onPress={handleSubmit(onSubmit)}
        />
      }
    >
      <SectionLabel>About</SectionLabel>
      <FormField
        control={control}
        name="overview"
        label="Company Overview"
        placeholder="Who you are and what you do"
        multiline
        rules={{ required: 'An overview helps tell your story' }}
      />

      <SectionLabel>Services</SectionLabel>
      {fields.map((field, index) => (
        <View key={field.id} style={styles.serviceRow}>
          <Controller
            control={control}
            name={`services.${index}.value`}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={`Service ${index + 1}`}
                style={styles.serviceInput}
              />
            )}
          />
          {fields.length > 1 && (
            <Pressable
              hitSlop={8}
              onPress={() => remove(index)}
              style={styles.removeBtn}
              accessibilityRole="button"
              accessibilityLabel={`Remove service ${index + 1}`}
            >
              <Ionicons name="close-circle" size={22} color={palette.slate400} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={() => append({ value: '' })}>
        <Ionicons name="add-circle-outline" size={20} color={palette.primary} />
        <Text style={styles.addText}>Add service</Text>
      </Pressable>

      <SectionLabel>Mission & Vision</SectionLabel>
      <FormField control={control} name="mission" label="Mission" multiline />
      <FormField control={control} name="vision" label="Vision" multiline />
    </Screen>
  );
}

const styles = StyleSheet.create({
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  serviceInput: { flex: 1 },
  removeBtn: { paddingTop: spacing.md, paddingLeft: spacing.sm },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.slate200,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },
  addText: {
    marginLeft: spacing.sm,
    color: palette.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
});
