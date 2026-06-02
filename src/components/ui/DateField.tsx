import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { palette, radius, spacing, fontSize, fontWeight } from '../../theme';
import { formatDate } from '../../utils/format';

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  style?: ViewStyle;
}

/** ISO date string -> Date for the picker, tolerating empty / bad values. */
function parseISO(iso?: string): Date {
  const d = iso ? new Date(iso) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Tappable date input backed by the native date picker. Stores an ISO
 * `yyyy-mm-dd` string (same shape the document data and `formatDate` expect),
 * so it's a drop-in replacement for the old free-text date fields.
 */
export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select date',
  style,
}: DateFieldProps<T>) {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={[styles.wrap, style]}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Pressable
            style={[styles.input, show && styles.focused]}
            onPress={() => setShow((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel={`${label ?? 'Date'}: ${value ? formatDate(value) : placeholder}`}
          >
            <Text style={[styles.value, !value && styles.placeholder]}>
              {value ? formatDate(value) : placeholder}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={palette.slate400} />
          </Pressable>
          {show && (
            <DateTimePicker
              value={parseISO(value)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, date) => {
                if (Platform.OS !== 'ios') setShow(false);
                if (event.type === 'set' && date) onChange(toISO(date));
              }}
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: palette.slate700,
    marginBottom: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.slate200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 50,
  },
  focused: { borderColor: palette.primary },
  value: { fontSize: fontSize.md, color: palette.ink },
  placeholder: { color: palette.slate400 },
});
