import React, { useEffect, useRef, useState } from 'react';
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { TextField, TextFieldProps } from './TextField';

interface FormFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  /** Bind a numeric field: stores numbers, displays strings. */
  numeric?: boolean;
}

/** react-hook-form Controller bound to the TextField input. */
export function FormField<T extends FieldValues>({
  control,
  name,
  rules,
  numeric,
  ...rest
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) =>
        numeric ? (
          <NumericField field={field} error={error?.message} rest={rest} />
        ) : (
          <TextField
            {...rest}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={error?.message}
          />
        )
      }
    />
  );
}

/**
 * Numeric input that keeps its own text buffer so intermediate states like a
 * trailing decimal point ("12.") survive while the form stores a `number`.
 * Re-syncs when the stored value changes from the outside (prefill / reset).
 */
function NumericField<T extends FieldValues>({
  field: { value, onChange, onBlur },
  error,
  rest,
}: {
  field: ControllerRenderProps<T, Path<T>>;
  error?: string;
  rest: Omit<TextFieldProps, 'value' | 'onChangeText' | 'onBlur' | 'error'>;
}) {
  const display = (v: unknown) => (v === 0 || v ? String(v) : '');
  const [text, setText] = useState(() => display(value));
  const ours = useRef<unknown>(value);

  useEffect(() => {
    if (value !== ours.current) {
      ours.current = value;
      setText(display(value));
    }
  }, [value]);

  const handle = (t: string) => {
    const cleaned = t.replace(/[^0-9.]/g, '').replace(/(\.\d*)\./g, '$1');
    setText(cleaned);
    const num = cleaned === '' || cleaned === '.' ? 0 : Number(cleaned);
    ours.current = num;
    onChange(num);
  };

  return (
    <TextField
      {...rest}
      keyboardType="numeric"
      value={text}
      onChangeText={handle}
      onBlur={onBlur}
      error={error}
    />
  );
}
