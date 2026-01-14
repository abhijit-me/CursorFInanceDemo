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
import { Budget, Category } from '../../types';
import { budgetService } from '../../services';

interface BudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  budget?: Budget;
  categories: Category[];
}

const BudgetDialog: React.FC<BudgetDialogProps> = ({
  open,
  onClose,
  onSaved,
  budget,
  categories,
}) => {
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!budget;

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.categoryId);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
    } else {
      resetForm();
    }
  }, [budget, open]);

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setPeriod('monthly');
  };

  const handleSave = async () => {
    if (!categoryId || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const budgetData: Budget = {
        categoryId: categoryId as number,
        amount: parseFloat(amount),
        period,
        startDate: new Date().toISOString().split('T')[0],
      };

      if (isEditMode && budget?.id) {
        await budgetService.updateBudget(budget.id, budgetData);
      } else {
        await budgetService.createBudget(budgetData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} budget`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required disabled={isEditMode}>
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

            <TextField
              label="Budget Amount"
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
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
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

export default BudgetDialog;
