import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Radio, 
  Card, 
  CardContent, 
  Chip 
} from '@mui/material';
import { Add as AddIcon, CreditCard as CreditCardIcon, Payment as PaymentIcon } from '@mui/icons-material';
import type { PaymentMethod } from '../../types';

interface PaymentStepProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  onPaymentMethodChange: (paymentMethodId: string) => void;
  onAddPaymentMethod: () => void;
  error?: string | null;
  loading?: boolean;
}

export default function PaymentStep({ 
  paymentMethods = [],
  selectedPaymentMethod,
  onPaymentMethodChange,
  onAddPaymentMethod,
  error,
  loading = false
}: PaymentStepProps) {
  const handlePaymentMethodChange = (methodId: string) => {
    console.log('Payment method changed to:', methodId);
    onPaymentMethodChange(methodId);
  };

  const handleCardClick = (methodId: string) => {
    console.log('Card clicked, changing to method:', methodId);
    handlePaymentMethodChange(methodId);
  };
  
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const methodId = event.target.value;
    console.log('Radio button changed to:', methodId);
    handlePaymentMethodChange(methodId);
  };

  // Helper functions for different payment method types
  const getCardLastFour = (method: PaymentMethod) => {
    if (method.last4) return method.last4;
    if (method.details?.cardNumber) {
      return method.details.cardNumber.slice(-4);
    }
    if (method.cardNumber) {
      return method.cardNumber.slice(-4);
    }
    return '****';
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit_card':
      case 'card':
        return `Credit Card •••• ${getCardLastFour(method)}`;
      case 'paypal':
        const email = method.paypalEmail || (method.details as any)?.paypalEmail || method.details?.email || 'no email';
        return `PayPal (${email})`;
      default:
        return method.type;
    }
  };
  
  const getCardholderName = (method: PaymentMethod) => {
    return method.details?.nameOnCard || method.cardHolderName || 'Cardholder Name';
  };
  
  const getExpiryDate = (method: PaymentMethod) => {
    if (method.expMonth && method.expYear) {
      return `${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`;
    }
    if (method.details?.expiryDate) {
      return method.details.expiryDate;
    }
    if (method.expiryDate) {
      return method.expiryDate;
    }
    return 'MM/YY';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mb={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      {paymentMethods.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <PaymentIcon color="action" sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>No payment methods</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            You don't have any saved payment methods. Add one to complete your purchase.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddPaymentMethod}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Add Payment Method
          </Button>
        </Card>
      ) : (
        <Box>
          <Box sx={{ mb: 3 }}>
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                variant="outlined"
                sx={{
                  mb: 2,
                  borderColor: selectedPaymentMethod === method.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  },
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleCardClick(method.id)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center">
                    <Radio
                      checked={selectedPaymentMethod === method.id}
                      value={method.id}
                      name="payment-method"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(method.id);
                      }}
                      onChange={handleRadioChange}
                      sx={{ 
                        mr: 2,
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                      inputProps={{ 
                        'aria-label': `Select ${method.type} payment method`,
                        'data-testid': `payment-method-${method.id}`
                      } as React.InputHTMLAttributes<HTMLInputElement> & { 'data-testid': string }}
                    />
                    <Box flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {method.type === 'credit_card' ? (
                          <CreditCardIcon color="action" />
                        ) : (
                          <PaymentIcon color="action" />
                        )}
                        <Box ml={1} flexGrow={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {getPaymentMethodLabel(method)}
                          </Typography>
                          <Box display="flex" gap={2} mt={0.5}>
                            {['credit_card', 'card'].includes(method.type) && (
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {getCardholderName(method)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Expires {getExpiryDate(method)}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      {(method.isDefault || method.details?.isDefault) && (
                        <Chip 
                          label="Default" 
                          size="small" 
                          color="primary" 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            fontSize: '0.65rem',
                            height: 20
                          }} 
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddPaymentMethod}
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
          >
            Add New Payment Method
          </Button>
        </Box>
      )}
    </Box>
  );
}
