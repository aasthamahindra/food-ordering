import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderNumber, totalAmount } = location.state || {};

  useEffect(() => {
    // If user navigates directly to this page without order data, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null; // or a loading spinner
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Thank you for your order
        </Typography>
        
        <Box sx={{ mt: 4, mb: 4, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
          <Typography variant="body1" paragraph>
            <strong>Order Number:</strong> {orderNumber}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Order Total:</strong> ${totalAmount?.toFixed(2) || '0.00'}
          </Typography>
          <Typography variant="body1" paragraph>
            A confirmation email has been sent to your email address.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/orders')}
          sx={{ mt: 2, mr: 2 }}
        >
          View My Orders
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
}
