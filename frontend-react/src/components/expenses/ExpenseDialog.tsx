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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { Expense, Category } from '../../types';
import { expenseService } from '../../services';

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense?: Expense;
  categories: Category[];
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onClose,
  onSaved,
  expense,
  categories,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!expense;

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategoryId(expense.categoryId);
      setDate(new Date(expense.date));
      setNotes(expense.notes || '');
    } else {
      resetForm();
    }
  }, [expense, open]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategoryId('');
    setDate(new Date());
    setNotes('');
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!description || !amount || !categoryId || !date) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const expenseData: Expense = {
        description,
        amount: parseFloat(amount),
        categoryId: categoryId as number,
        date: formatDate(date),
        notes,
      };

      if (isEditMode && expense?.id) {
        await expenseService.updateExpense(expense.id, expenseData, selectedFile || undefined);
      } else {
        await expenseService.createExpense(expenseData, selectedFile || undefined);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} expense`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              {selectedFile ? selectedFile.name : 'Upload Receipt'}
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </Button>
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

export default ExpenseDialog;
