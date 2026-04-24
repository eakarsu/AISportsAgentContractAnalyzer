import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'transaction_type', 'description', 'player_name', 'deal_name', 'amount',
  'commission_earned', 'expense_category', 'payment_status', 'payment_date',
  'due_date', 'notes',
];

const tableColumns = [
  { key: 'transaction_type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'player_name', label: 'Player' },
  { key: 'amount', label: 'Amount' },
  { key: 'commission_earned', label: 'Commission' },
  { key: 'payment_status', label: 'Status' },
];

const selectOptions = {
  transaction_type: ['Commission', 'Expense', 'Bonus', 'Retainer', 'Reimbursement'],
  expense_category: ['Travel', 'Legal', 'Marketing', 'Office', 'Entertainment', 'Training', 'Other'],
  payment_status: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
};

export default function FinancialsPage() {
  return (
    <FeaturePage
      feature="financials"
      title="Financial Tracker"
      description="Track commissions, expenses, and revenue across all deals"
      icon="💵"
      accentColor="green"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
