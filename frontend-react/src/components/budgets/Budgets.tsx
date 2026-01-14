import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Avatar,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Budget, Category } from '../../types';
import { budgetService, categoryService } from '../../services';
import BudgetDialog from './BudgetDialog';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBudget(undefined);
  };

  const handleDeleteBudget = async (budget: Budget) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetService.deleteBudget(budget.id!);
      setSuccess('Budget deleted successfully');
      loadBudgets();
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const getStatusClass = (budget: Budget): 'success' | 'warning' | 'error' => {
    if (!budget.percentage) return 'success';
    if (budget.percentage >= 100) return 'error';
    if (budget.percentage >= 80) return 'warning';
    return 'success';
  };

  const getStatusIcon = (budget: Budget) => {
    const status = getStatusClass(budget);
    if (status === 'error') return <ErrorIcon color="error" />;
    if (status === 'warning') return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Budget
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WalletIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No budgets set
            </Typography>
            <Typography color="text.secondary">
              Create your first budget to start tracking your spending!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((budget) => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{ bgcolor: budget.category?.color || 'primary.main' }}
                    >
                      <WalletIcon />
                    </Avatar>
                  }
                  title={budget.category?.name}
                  subheader="Monthly Budget"
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(budget.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Spent
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color={`${getStatusClass(budget)}.main`}
                      >
                        {formatCurrency(budget.spent || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Remaining
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(budget.remaining || 0)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        {Math.round(budget.percentage || 0)}% Used
                      </Typography>
                      {getStatusIcon(budget)}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentage || 0, 100)}
                      color={getStatusClass(budget)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(budget)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteBudget(budget)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <BudgetDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={() => {
          setSuccess(`Budget ${selectedBudget ? 'updated' : 'created'} successfully`);
          loadBudgets();
        }}
        budget={selectedBudget}
        categories={categories}
      />

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

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Budgets;
