import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  InputAdornment,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RecurringBill, Category } from '../../types';
import { recurringBillService } from '../../services';

interface RecurringBillDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  bill?: RecurringBill;
  categories: Category[];
}

const RecurringBillDialog: React.FC<RecurringBillDialogProps> = ({
  open,
  onClose,
  onSaved,
  bill,
  categories,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState<Date | null>(new Date());
  const [reminderDays, setReminderDays] = useState('3');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!bill;

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount.toString());
      setCategoryId(bill.categoryId);
      setFrequency(bill.frequency);
      setNextDueDate(new Date(bill.nextDueDate));
      setReminderDays(bill.reminderDays.toString());
      setNotes(bill.notes || '');
      setIsActive(bill.isActive);
    } else {
      resetForm();
    }
  }, [bill, open]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategoryId('');
    setFrequency('monthly');
    setNextDueDate(new Date());
    setReminderDays('3');
    setNotes('');
    setIsActive(true);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!name || !amount || !categoryId || !nextDueDate) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const billData: RecurringBill = {
        name,
        amount: parseFloat(amount),
        categoryId: categoryId as number,
        frequency,
        nextDueDate: formatDate(nextDueDate),
        reminderDays: parseInt(reminderDays) || 3,
        notes,
        isActive,
      };

      if (isEditMode && bill?.id) {
        await recurringBillService.updateBill(bill.id, billData);
      } else {
        await recurringBillService.createBill(billData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} bill`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Recurring Bill' : 'Add Recurring Bill'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Bill Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryId}
                label="Category"
                onChange={(e) => setCategoryId(e.target.value as number)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={frequency}
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Next Due Date"
              value={nextDueDate}
              onChange={(newValue) => setNextDueDate(newValue)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />

            <TextField
              label="Reminder Days Before"
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              fullWidth
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RecurringBillDialog;
