interface expenseOption {
  label: string;
  value: string;
}

const expenseOptions: expenseOption[] = [
  { label: 'Child Care', value: 'CHILD_CARE' },
  { label: 'Clothing', value: 'CLOTHING' },
  { label: 'Debt Repayment', value: 'DEBT_REPAYMENT' },
  { label: 'Education', value: 'EDUCATION' },
  { label: 'Emergency Fund', value: 'EMERGENCY_FUND' },
  { label: 'Entertainment', value: 'ENTERTAINMENT' },
  { label: 'Food', value: 'FOOD' },
  { label: 'Gifts', value: 'GIFTS' },
  { label: 'Healthcare', value: 'HEALTHCARE' },
  { label: 'Housing', value: 'HOUSING' },
  { label: 'Investments', value: 'INVESTMENTS' },
  { label: 'Large Purchases', value: 'LARGE_PURCHASES' },
  { label: 'Legal', value: 'LEGAL' },
  {
    label: 'Memberships and Subscriptions',
    value: 'MEMBERSHIPS_AND_SUBSCRIPTIONS',
  },
  { label: 'Other', value: 'OTHER' },
  { label: 'Personal Care', value: 'PERSONAL_CARE' },
  { label: 'Pet Care', value: 'PET_CARE' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'Savings', value: 'SAVINGS' },
  { label: 'Taxes', value: 'TAXES' },
  { label: 'Transportation', value: 'TRANSPORTATION' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Utilities', value: 'UTILITIES' },
];

export default expenseOptions;
