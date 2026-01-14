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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { Expense, Category, ExpenseFilter } from '../../types';
import { expenseService, categoryService } from '../../services';
import ExpenseDialog from './ExpenseDialog';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filterCategoryId, filterStartDate, filterEndDate]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const filter: ExpenseFilter = {};
      if (filterCategoryId) filter.categoryId = filterCategoryId;
      if (filterStartDate) filter.startDate = filterStartDate.toISOString().split('T')[0];
      if (filterEndDate) filter.endDate = filterEndDate.toISOString().split('T')[0];

      const data = await expenseService.getExpenses(filter);
      setExpenses(data);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense?: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExpense(undefined);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(expense.id!);
      setSuccess('Expense deleted successfully');
      loadExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setFilterCategoryId('');
    setFilterStartDate(null);
    setFilterEndDate(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Expense
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategoryId}
                  label="Category"
                  onChange={(e) => setFilterCategoryId(e.target.value as number | '')}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={filterStartDate}
                onChange={setFilterStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={filterEndDate}
                onChange={setFilterEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No expenses found
            </Typography>
            <Typography color="text.secondary">
              Start tracking your expenses by adding your first one!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {expenses.map((expense) => (
            <Grid item xs={12} sm={6} md={4} key={expense.id}>
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
                      sx={{ bgcolor: expense.category?.color || 'primary.main' }}
                    >
                      <ReceiptIcon />
                    </Avatar>
                  }
                  title={expense.description}
                  subheader={`${expense.category?.name} • ${formatDate(expense.date)}`}
                />
                <CardContent>
                  <Typography variant="h5" sx={{ color: 'success.main', mb: 1 }}>
                    {formatCurrency(expense.amount)}
                  </Typography>
                  {expense.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {expense.notes}
                    </Typography>
                  )}
                  {expense.receiptPath && (
                    <Chip
                      icon={<AttachFileIcon />}
                      label="Receipt attached"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteExpense(expense)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={() => {
          setSuccess(`Expense ${selectedExpense ? 'updated' : 'created'} successfully`);
          loadExpenses();
        }}
        expense={selectedExpense}
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

export default Expenses;
