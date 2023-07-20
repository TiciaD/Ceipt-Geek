import { useState } from 'react';
import { Button, FormControl, Grid, TextField, Alert, Autocomplete } from '@mui/material';

import { useFormik } from 'formik';
import { CreateReceiptSchema } from '../types/schemas';
import { useRouter } from 'next/router';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  TagType,
  useCreateReceiptMutation,
  useGetAllTagsByUserQuery,
} from '../graphql/generated/graphql';
import expenseOptions from '../utils/maps';

export default function CreateReceiptForm() {
  const { data: tags, loading: isTagsLoading, error: tagsError } = useGetAllTagsByUserQuery();
  const [createReceipt] = useCreateReceiptMutation();
  const [error, setError] = useState('');
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      storeName: '',
      cost: 0,
      tax: 0,
      date: dayjs(Date.now()),
      expense: expenseOptions[0],
      tags: [] as TagType[],
    },
    validationSchema: CreateReceiptSchema,
    onSubmit: async (values) => {
      if (!values.date.isValid()) {
        setError('Invalid Date');
      } else {
        createReceipt({
          variables: {
            storeName: values.storeName,
            cost: values.cost.toFixed(2),
            tax: values.tax.toFixed(2),
            date: values.date.toISOString().split('T')[0],
            expense: values.expense.value,
            tags: values.tags.map((tag) => tag.tagName) || [],
          },
          onError: (error) => {
            setError(error.message);
          },
          onCompleted: () => {
            setError('');
            router.push('/');
          },
          refetchQueries: ['AllReceiptsByUser'],
        });
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
        spacing={3}
        sx={{ py: '1rem' }}
      >
        {error && (
          <Grid item>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        <Grid item>
          <TextField
            sx={{ width: { xs: '12rem', sm: '15rem' } }}
            id="storeName"
            name="storeName"
            label="Store Name"
            value={formik.values.storeName}
            onChange={formik.handleChange}
            error={formik.touched.storeName && Boolean(formik.errors.storeName)}
            helperText={formik.touched.storeName && formik.errors.storeName}
          />
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: { xs: '12rem', sm: '15rem' } }}
            id="cost"
            name="cost"
            label="Cost"
            type="number"
            value={formik.values.cost}
            onChange={formik.handleChange}
            error={formik.touched.cost && Boolean(formik.errors.cost)}
            helperText={formik.touched.cost && formik.errors.cost}
          />
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: { xs: '12rem', sm: '15rem' } }}
            id="tax"
            name="tax"
            label="Tax"
            type="number"
            value={formik.values.tax}
            onChange={formik.handleChange}
            error={formik.touched.tax && Boolean(formik.errors.tax)}
            helperText={formik.touched.tax && formik.errors.tax}
          />
        </Grid>
        <Grid item>
          <DatePicker
            label="Date"
            value={formik.values.date}
            onChange={(value) => formik.setFieldValue('date', value, true)}
            slotProps={{
              textField: {
                variant: 'outlined',
                error: formik.touched.date && Boolean(formik.errors.date?.isValid),
                helperText: formik.touched.date && (formik.errors.date?.isValid as boolean),
              },
            }}
          />
        </Grid>
        <Grid item>
          <Autocomplete
            disablePortal
            disableClearable
            id="expense"
            value={formik.values.expense}
            onChange={(e, value) => formik.setFieldValue('expense', value)}
            options={expenseOptions}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Expense Type" />}
          />
        </Grid>
        <Grid item>
          <FormControl sx={{ m: 1, width: 300 }}>
            {!tagsError && !isTagsLoading ? (
              <>
                <Autocomplete
                  multiple
                  id="tags"
                  onChange={(e, value) => formik.setFieldValue('tags', value, true)}
                  options={tags?.allUsersTags?.map((tag) => tag) || []}
                  getOptionLabel={(option) => option?.tagName as string}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Tags" />
                  )}
                />
              </>
            ) : (
              <p>No tags found</p>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <Button type="submit" variant="contained" size="large">
            CREATE RECEIPT
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
