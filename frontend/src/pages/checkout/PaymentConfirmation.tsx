// src/pages/checkout/PaymentConfirmation.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Container
} from '@mui/material';
import { CheckCircle, Error, ArrowBack } from '@mui/icons-material';
import api from '../../services/api';

export default function PaymentConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await api.get(`/payments/status/${orderId}`);
        const { status, order: orderData } = response.data.data;
        
        setPaymentStatus(status);
        setOrder(orderData);
        
        // If payment is still pending, poll for updates
        if (status === 'pending') {
          const interval = setInterval(async () => {
            const updateResponse = await api.get(`/payments/status/${orderId}`);
            if (updateResponse.data.data.status !== 'pending') {
              clearInterval(interval);
              setPaymentStatus(updateResponse.data.data.status);
              setOrder(updateResponse.data.data.order);
            }
          }, 3000); // Poll every 3 seconds
          
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setError('Failed to verify payment status. Please check your order history.');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying your payment...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        p={3}
      >
        <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Payment Verification Failed
        </Typography>
        <Typography color="textSecondary" align="center" paragraph>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/orders')}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          View Orders
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Thank you for your order. We've received your payment and your order is being processed.
            </Typography>
            
            <Card variant="outlined" sx={{ mt: 4, mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Order Number</Typography>
                    <Typography variant="body1">{order?.orderNumber}</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="subtitle2">Date</Typography>
                    <Typography variant="body1">
                      {order ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Items
                </Typography>
                <List dense>
                  {order?.items?.map((item: any) => (
                    <ListItem key={item._id} disableGutters>
                      <ListItemText
                        primary={item.name}
                        secondary={`Qty: ${item.quantity}`}
                      />
                      <Typography>${item.price.toFixed(2)}</Typography>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1">
                    Total: <strong>${order?.totalAmount?.toFixed(2)}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/orders')}
              startIcon={<ArrowBack />}
              sx={{ mt: 2 }}
            >
              View Orders
            </Button>
          </>
        ) : (
          <>
            <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Payment Verification Failed
            </Typography>
            <Typography color="textSecondary" align="center" paragraph>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/orders')}
              startIcon={<ArrowBack />}
              sx={{ mt: 2 }}
            >
              View Orders
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}   