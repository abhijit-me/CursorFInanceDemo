import React, { useState } from 'react';
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
  Typography,
  Paper,
} from '@mui/material';
import { SavingsGoal } from '../../types';
import { savingsGoalService } from '../../services';

interface ContributeDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  goal: SavingsGoal;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const ContributeDialog: React.FC<ContributeDialogProps> = ({
  open,
  onClose,
  onSaved,
  goal,
}) => {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await savingsGoalService.contribute(goal.id!, contributionAmount);
      setAmount('');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add contribution');
    } finally {
      setSaving(false);
    }
  };

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Contribute to {goal.name}</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Current:</strong> {formatCurrency(goal.currentAmount)}
              </Typography>
              <Typography variant="body2">
                <strong>Target:</strong> {formatCurrency(goal.targetAmount)}
              </Typography>
              <Typography variant="body2">
                <strong>Remaining:</strong> {formatCurrency(remaining)}
              </Typography>
            </Box>
          </Paper>

          <TextField
            label="Contribution Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Contribute'}
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

export default ContributeDialog;
