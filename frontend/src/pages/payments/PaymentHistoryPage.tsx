import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { getPaymentHistory } from '../../services/payment.service';
import { format } from 'date-fns';
import type { PaymentHistory } from '../../types';

// Format currency without external dependency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const navigate = useNavigate();

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentHistory({
        page: page + 1,
        limit: rowsPerPage,
      });
      setPayments(response.data);
      setTotal(response.pagination.totalCount);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
      setError('Failed to load payment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'failed':
        return 'error.main';
      case 'refunded':
        return 'info.main';
      default:
        return 'text.primary';
    }
  };

  if (loading && payments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your past transactions and payment details
        </Typography>
      </Box>

      {payments.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No payment history found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your payment history will appear here once you make a payment.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/restaurants')}
            >
              Order Food Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{payment.orderId?.slice(0, 8) || 'N/A'}...</TableCell>
                    <TableCell>
                      {payment.paymentMethod?.type?.toUpperCase() || 'N/A'} •••• 
                      {payment.paymentMethod?.details?.cardNumber?.slice(-4) || '****'}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          color: getStatusColor(payment.status),
                          textTransform: 'capitalize',
                          fontWeight: 500,
                        }}
                      >
                        {payment.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate(`/orders/${payment.orderId}`)}
                      >
                        View Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Container>
  );
};

export default PaymentHistoryPage;
