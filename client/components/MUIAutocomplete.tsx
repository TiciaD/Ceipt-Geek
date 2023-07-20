import { Autocomplete, TextField } from '@mui/material';
import { FieldProps, getIn } from 'formik';

interface MUIAutocompleteProps<T> extends FieldProps<T> {
  options: T[];
}

export default function MUIAutocomplete<T>({
  field,
  form,
  options,
  ...props
}: MUIAutocompleteProps<T>) {
  const error = getIn(form.errors, field.name);
  const touched = getIn(form.touched, field.name);
  const value = getIn(form.values, field.name);

  const handleChange = (e: any, value: T | null) => {
    form.setFieldValue(field.name, value, true);
  };

  return (
    <Autocomplete
      {...field}
      {...props}
      options={options}
      value={value}
      onChange={handleChange}
      isOptionEqualToValue={(option, value) => option === value}
      renderInput={(params) => (
        <TextField
          {...params}
          error={touched && Boolean(error)}
          helperText={touched && error}
          label="Expense Type"
        />
      )}
    />
  );
}
