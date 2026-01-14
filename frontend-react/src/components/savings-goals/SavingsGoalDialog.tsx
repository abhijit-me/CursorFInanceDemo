import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SavingsGoal } from '../../types';
import { savingsGoalService } from '../../services';

interface SavingsGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  goal?: SavingsGoal;
}

const SavingsGoalDialog: React.FC<SavingsGoalDialogProps> = ({
  open,
  onClose,
  onSaved,
  goal,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [icon, setIcon] = useState('savings');
  const [color, setColor] = useState('#4CAF50');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!goal;

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setTargetDate(goal.targetDate ? new Date(goal.targetDate) : null);
      setIcon(goal.icon || 'savings');
      setColor(goal.color || '#4CAF50');
    } else {
      resetForm();
    }
  }, [goal, open]);

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate(null);
    setIcon('savings');
    setColor('#4CAF50');
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!name || !targetAmount) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const goalData: SavingsGoal = {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        targetDate: targetDate ? formatDate(targetDate) : undefined,
        icon,
        color,
      };

      if (isEditMode && goal?.id) {
        await savingsGoalService.updateGoal(goal.id, goalData);
      } else {
        await savingsGoalService.createGoal(goalData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} goal`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Savings Goal' : 'Create Savings Goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Goal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Target Amount"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              label="Current Amount"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <DatePicker
              label="Target Date"
              value={targetDate}
              onChange={(newValue) => setTargetDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <TextField
              label="Icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              fullWidth
              placeholder="e.g., home, flight, car"
            />

            <TextField
              label="Color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
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

export default SavingsGoalDialog;
