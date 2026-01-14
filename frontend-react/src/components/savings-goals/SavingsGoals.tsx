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
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Savings as SavingsIcon,
  AddCircle as AddCircleIcon,
  CheckCircle as CheckCircleIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { SavingsGoal } from '../../types';
import { savingsGoalService } from '../../services';
import SavingsGoalDialog from './SavingsGoalDialog';
import ContributeDialog from './ContributeDialog';

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

const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await savingsGoalService.getGoals();
      setGoals(data);
    } catch (err) {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGoalDialog = (goal?: SavingsGoal) => {
    setSelectedGoal(goal);
    setGoalDialogOpen(true);
  };

  const handleCloseGoalDialog = () => {
    setGoalDialogOpen(false);
    setSelectedGoal(undefined);
  };

  const handleOpenContributeDialog = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContributeDialogOpen(true);
  };

  const handleCloseContributeDialog = () => {
    setContributeDialogOpen(false);
    setSelectedGoal(undefined);
  };

  const handleDeleteGoal = async (goal: SavingsGoal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await savingsGoalService.deleteGoal(goal.id!);
      setSuccess('Goal deleted successfully');
      loadGoals();
    } catch (err) {
      setError('Failed to delete goal');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Savings Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenGoalDialog()}
        >
          Add Goal
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <SavingsIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No savings goals
            </Typography>
            <Typography color="text.secondary">
              Create your first savings goal and start building your future!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                  border: goal.isCompleted ? '2px solid #4CAF50' : undefined,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: goal.color || 'primary.main' }}>
                      <SavingsIcon />
                    </Avatar>
                  }
                  title={goal.name}
                  subheader={goal.targetDate ? `Target: ${formatDate(goal.targetDate)}` : undefined}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Current
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(goal.currentAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Target
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Remaining
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        {Math.round(goal.progress || 0)}% Complete
                      </Typography>
                      {goal.isCompleted && <CheckCircleIcon color="success" />}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.progress || 0, 100)}
                      color={goal.isCompleted ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {goal.isCompleted && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        icon={<CelebrationIcon />}
                        label="Goal Achieved!"
                        color="success"
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                    onClick={() => handleOpenContributeDialog(goal)}
                    disabled={goal.isCompleted}
                  >
                    Contribute
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenGoalDialog(goal)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteGoal(goal)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <SavingsGoalDialog
        open={goalDialogOpen}
        onClose={handleCloseGoalDialog}
        onSaved={() => {
          setSuccess(`Goal ${selectedGoal ? 'updated' : 'created'} successfully`);
          loadGoals();
        }}
        goal={selectedGoal}
      />

      {selectedGoal && (
        <ContributeDialog
          open={contributeDialogOpen}
          onClose={handleCloseContributeDialog}
          onSaved={() => {
            setSuccess('Contribution added successfully');
            loadGoals();
          }}
          goal={selectedGoal}
        />
      )}

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

export default SavingsGoals;
