import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Savings as SavingsIcon,
  EventRepeat as EventRepeatIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { dashboardService } from '../../services';
import { DashboardStats, SpendingByCategory, SpendingTrend, Budget, Expense } from '../../types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

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

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalBudget: 0,
    budgetRemaining: 0,
    budgetPercentage: 0,
    upcomingBills: 0,
    activeSavingsGoals: 0,
    totalSaved: 0,
  });
  const [spendingByCategory, setSpendingByCategory] = useState<SpendingByCategory[]>([]);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrend[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      const [statsData, categoryData, trendData, budgetData, expenseData] = await Promise.all([
        dashboardService.getStats().catch(() => stats),
        dashboardService.getSpendingByCategory().catch(() => []),
        dashboardService.getSpendingTrend().catch(() => []),
        dashboardService.getBudgetOverview().catch(() => []),
        dashboardService.getRecentExpenses(5).catch(() => []),
      ]);

      setStats(statsData);
      setSpendingByCategory(categoryData);
      setSpendingTrend(trendData);
      setBudgets(budgetData || []);
      setRecentExpenses(expenseData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetStatusClass = (budget: Budget): string => {
    if (!budget.percentage) return 'success';
    if (budget.percentage >= 100) return 'error';
    if (budget.percentage >= 80) return 'warning';
    return 'success';
  };

  const categoryChartData = {
    labels: spendingByCategory.map((c) => c.categoryName),
    datasets: [
      {
        data: spendingByCategory.map((c) => c.amount),
        backgroundColor: spendingByCategory.map((c) => c.color),
      },
    ],
  };

  const trendChartData = {
    labels: spendingTrend.map((t) => t.month),
    datasets: [
      {
        label: 'Monthly Spending',
        data: spendingTrend.map((t) => t.amount),
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              textAlign: 'center',
              p: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
            }}
          >
            <WalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={500}>
              {formatCurrency(stats.totalExpenses)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Expenses
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              textAlign: 'center',
              p: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
            }}
          >
            <SavingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={500}>
              {formatCurrency(stats.budgetRemaining)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Budget Remaining
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              textAlign: 'center',
              p: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
            }}
          >
            <EventRepeatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={500}>
              {stats.upcomingBills}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Bills
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              textAlign: 'center',
              p: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
            }}
          >
            <FlagIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={500}>
              {stats.activeSavingsGoals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Goals
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 400 }}>
            <CardHeader title="Spending by Category" />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {spendingByCategory.length > 0 ? (
                  <Doughnut data={categoryChartData} options={chartOptions} />
                ) : (
                  <Typography color="text.secondary">No spending data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 400 }}>
            <CardHeader title="Spending Trend" />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {spendingTrend.length > 0 ? (
                  <Line data={trendChartData} options={lineChartOptions} />
                ) : (
                  <Typography color="text.secondary">No trend data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title="Budget Overview"
            action={
              <Button color="primary" onClick={() => navigate('/budgets')}>
                View All
              </Button>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {budgets.slice(0, 5).map((budget) => (
                <Box key={budget.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight={500}>{budget.category?.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budget.percentage || 0, 100)}
                    color={getBudgetStatusClass(budget) as 'success' | 'warning' | 'error'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <Card>
          <CardHeader
            title="Recent Expenses"
            action={
              <Button color="primary" onClick={() => navigate('/expenses')}>
                View All
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category?.name}</TableCell>
                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        {formatCurrency(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
