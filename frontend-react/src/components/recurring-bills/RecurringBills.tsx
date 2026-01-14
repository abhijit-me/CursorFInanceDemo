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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventRepeat as EventRepeatIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { RecurringBill, Category } from '../../types';
import { recurringBillService, categoryService } from '../../services';
import RecurringBillDialog from './RecurringBillDialog';

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

const RecurringBills: React.FC = () => {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadBills();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await recurringBillService.getBills();
      // Sort: overdue first, then by due date
      const sorted = data.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
      });
      setBills(sorted);
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (bill?: RecurringBill) => {
    setSelectedBill(bill);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBill(undefined);
  };

  const handleMarkAsPaid = async (bill: RecurringBill) => {
    try {
      await recurringBillService.markAsPaid(bill.id!);
      setSuccess('Bill marked as paid');
      loadBills();
    } catch (err) {
      setError('Failed to mark bill as paid');
    }
  };

  const handleDeleteBill = async (bill: RecurringBill) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      await recurringBillService.deleteBill(bill.id!);
      setSuccess('Bill deleted successfully');
      loadBills();
    } catch (err) {
      setError('Failed to delete bill');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Recurring Bills
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Bill
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <EventRepeatIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No recurring bills
            </Typography>
            <Typography color="text.secondary">
              Add your recurring bills to track and get reminders!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bills.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                  borderLeft: bill.isOverdue
                    ? '4px solid #f44336'
                    : bill.needsReminder
                    ? '4px solid #ff9800'
                    : undefined,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{ bgcolor: bill.category?.color || 'primary.main' }}
                    >
                      <EventRepeatIcon />
                    </Avatar>
                  }
                  title={bill.name}
                  subheader={`${bill.category?.name} • ${bill.frequency}`}
                />
                <CardContent>
                  <Typography variant="h5" sx={{ color: 'primary.main', mb: 2 }}>
                    {formatCurrency(bill.amount)}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <EventIcon fontSize="small" />
                      <Typography variant="body2">
                        Due: {formatDate(bill.nextDueDate)}
                      </Typography>
                    </Box>
                    {bill.daysUntilDue !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <ScheduleIcon fontSize="small" />
                        <Typography variant="body2">
                          {bill.isOverdue
                            ? `Overdue by ${Math.abs(bill.daysUntilDue)} days`
                            : `In ${bill.daysUntilDue} days`}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {bill.isOverdue && (
                      <Chip
                        icon={<ErrorIcon />}
                        label="Overdue"
                        size="small"
                        color="error"
                      />
                    )}
                    {bill.needsReminder && !bill.isOverdue && (
                      <Chip
                        icon={<NotificationsIcon />}
                        label="Due Soon"
                        size="small"
                        color="warning"
                      />
                    )}
                    {!bill.isActive && (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="default"
                      />
                    )}
                  </Box>

                  {bill.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {bill.notes}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleMarkAsPaid(bill)}
                  >
                    Mark Paid
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(bill)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteBill(bill)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <RecurringBillDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={() => {
          setSuccess(`Bill ${selectedBill ? 'updated' : 'created'} successfully`);
          loadBills();
        }}
        bill={selectedBill}
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

export default RecurringBills;
