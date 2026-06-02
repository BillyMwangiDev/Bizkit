import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ArrayPath,
  Control,
  FieldValues,
  Path,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { FormField } from './ui/FormField';
import { palette, radius, spacing, fontSize, fontWeight } from '../theme';
import { formatMoney } from '../utils/format';
import { uid } from '../utils/id';
import type { LineItem } from '../types';

interface ItemsEditorProps<T extends FieldValues> {
  control: Control<T>;
  /** Field-array name pointing at a `LineItem[]` (e.g. "items"). */
  name: ArrayPath<T>;
  /** Currency code used to format the live per-row amount. */
  currency: string;
}

/**
 * Editable list of line items. Each row has name / qty / unit price and shows
 * a live computed amount. Backed by react-hook-form's field array.
 */
export function ItemsEditor<T extends FieldValues>({
  control,
  name,
  currency,
}: ItemsEditorProps<T>) {
  const { fields, append, remove } = useFieldArray({ control, name });
  // Watch the whole array so per-row amounts update as the user types.
  const watched = (useWatch({ control, name: name as unknown as Path<T> }) ??
    []) as LineItem[];

  return (
    <View>
      {fields.map((field, index) => {
        const item = watched[index];
        const amount =
          (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
        return (
          <View key={field.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemIndex}>Item {index + 1}</Text>
              {fields.length > 1 && (
                <Pressable
                  hitSlop={8}
                  onPress={() => remove(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove item ${index + 1}`}
                >
                  <Ionicons name="trash-outline" size={18} color={palette.danger} />
                </Pressable>
              )}
            </View>
            <FormField
              control={control}
              name={`${name}.${index}.name` as Path<T>}
              placeholder="Description"
              rules={{ required: 'Required' }}
            />
            <View style={styles.row}>
              <FormField
                control={control}
                name={`${name}.${index}.quantity` as Path<T>}
                label="Qty"
                numeric
                style={styles.qty}
              />
              <FormField
                control={control}
                name={`${name}.${index}.unitPrice` as Path<T>}
                label="Unit Price"
                numeric
                style={styles.price}
              />
            </View>
            <Text style={styles.amount}>{formatMoney(amount, currency)}</Text>
          </View>
        );
      })}

      <Pressable
        style={styles.addBtn}
        onPress={() =>
          append({ id: uid('item_'), name: '', quantity: 1, unitPrice: 0 } as never)
        }
      >
        <Ionicons name="add-circle-outline" size={20} color={palette.primary} />
        <Text style={styles.addText}>Add item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.slate100,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemIndex: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: palette.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  qty: { flex: 1, marginBottom: 0 },
  price: { flex: 2, marginBottom: 0 },
  amount: {
    textAlign: 'right',
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: palette.ink,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.slate200,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addText: {
    marginLeft: spacing.sm,
    color: palette.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
});
