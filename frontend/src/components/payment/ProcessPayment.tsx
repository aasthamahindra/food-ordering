import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { processPayment, getPaymentMethods } from '../../services/payment.service';
import type { PaymentMethod as PaymentMethodType } from '../../types';

// Format currency without external dependency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Using the PaymentMethod type from types.ts

interface ProcessPaymentProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProcessPayment: React.FC<ProcessPaymentProps> = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        
        // Set default payment method if available
        const defaultMethod = methods.find((method: PaymentMethodType) => method.details.isDefault);
        if (defaultMethod) {
          setSelectedMethod(defaultMethod.id);
        } else if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePaymentMethodChange = (event: SelectChangeEvent<string>) => {
    setSelectedMethod(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const result = await processPayment({
        orderId,
        paymentMethodId: selectedMethod,
        amount,
      });

      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again or use a different payment method.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }


  if (success) {
    return (
      <Box textAlign="center" p={4}>
        <Box mb={3}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
        <Typography variant="h5" gutterBottom>Payment Successful!</Typography>
        <Typography color="textSecondary" paragraph>
          Your payment of {formatCurrency(amount)} has been processed successfully.
        </Typography>
        <Typography color="textSecondary" paragraph>
          Order ID: {orderId}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/orders'}
          sx={{ mt: 2 }}
        >
          View Orders
        </Button>
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardHeader 
        title="Complete Payment" 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Order Total: <Box component="span" fontWeight="bold">{formatCurrency(amount)}</Box>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Order ID: {orderId}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method"
              value={selectedMethod}
              onChange={handlePaymentMethodChange}
              label="Payment Method"
              disabled={paymentMethods.length === 0 || submitting}
            >
              {paymentMethods.length === 0 ? (
                <MenuItem disabled>No payment methods found</MenuItem>
              ) : (
                paymentMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.type.toUpperCase()} •••• {method.details.cardNumber?.slice(-4) || '****'} 
                    {method.details.isDefault && ' (Default)'}
                  </MenuItem>
                ))
              )}
            </Select>
            {paymentMethods.length === 0 && (
              <FormHelperText>
                No payment methods found. Please add a payment method first.
              </FormHelperText>
            )}
          </FormControl>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={paymentMethods.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  <Box component="span" ml={1}>Processing...</Box>
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProcessPayment;
