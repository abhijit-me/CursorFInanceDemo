import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import * as XLSX from 'xlsx';
import { MonthlyReport, TopCategory } from '../../types';
import { monthlyReportService } from '../../services';

ChartJS.register(ArcElement, Tooltip, Legend);

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

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const MonthlyReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await monthlyReportService.getMonthlyReport(selectedYear, selectedMonth);
      setReport(data);
    } catch (err) {
      console.error('Error loading monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const exportData = await monthlyReportService.exportMonthlyReport(selectedYear, selectedMonth);
      
      const ws = XLSX.utils.json_to_sheet(exportData.data, {
        header: ['Date', 'Description', 'Category', 'Amount'],
      });
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
      
      const fileName = `monthly-report-${exportData.monthName.replace(/\s+/g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  const getStatusClass = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const pieChartData = report
    ? {
        labels: report.spendingByCategory.map((c) => c.categoryName),
        datasets: [
          {
            data: report.spendingByCategory.map((c) => c.amount),
            backgroundColor: report.spendingByCategory.map((c) => c.color),
          },
        ],
      }
    : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Monthly Report
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value as number)}
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value as number)}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : report ? (
        <>
          {/* Spending Breakdown Pie Chart */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title="Spending Breakup By Category" />
            <CardContent>
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {report.spendingByCategory.length > 0 ? (
                  <Doughnut data={pieChartData} options={chartOptions} />
                ) : (
                  <Typography color="text.secondary">
                    No spending data available for this month
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Top 3 Spending Categories */}
          {report.topCategories.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardHeader title="Top 3 Spending Categories" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {report.topCategories.map((category: TopCategory) => (
                    <Box key={category.categoryId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography fontWeight={500} sx={{ fontSize: 16 }}>
                          {category.categoryName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Budget
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(category.budget)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.300',
                            '& .MuiLinearProgress-bar': { bgcolor: 'grey.400' },
                          }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Spending
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(category.spending)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(category.percentage, 100)}
                          color={getStatusClass(category.percentage)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Spending Details Table */}
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title="Spending Details"
              action={
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={exportToExcel}
                >
                  Export to XLS
                </Button>
              }
            />
            <CardContent>
              {report.expenseDetails.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                            Date
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                            Description
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                            Category
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, bgcolor: 'grey.100' }}
                          >
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.expenseDetails.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{formatDate(expense.date)}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>
                              {expense.category?.name || 'Uncategorized'}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 500, color: 'primary.main' }}
                            >
                              {formatCurrency(expense.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderTop: '2px solid',
                      borderColor: 'primary.main',
                      mt: 2,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      TOTAL
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {formatCurrency(report.totalSpending)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No expenses recorded for this month
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );
};

export default MonthlyReports;
