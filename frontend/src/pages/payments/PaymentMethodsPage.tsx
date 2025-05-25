import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, CardActions, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select,
  TextField, Typography, IconButton, Divider, FormControlLabel,
  Checkbox, Chip, CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { 
  paymentService, 
  type AddCardMethodPayload,
  type AddPayPalMethodPayload
} from '../../services/paymentService';

type PaymentMethodType = 'card' | 'paypal';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  details: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    paypalEmail?: string;
  };
  isDefault: boolean;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  paypalEmail?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodForm {
  type: PaymentMethodType;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  paypalEmail: string;
  isDefault: boolean;
}

const PaymentMethodsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formValues, setFormValues] = useState<PaymentMethodForm>({
    type: 'card',
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      if (formValues.type === 'card') {
        if (!formValues.cardNumber || !formValues.cardHolderName || !formValues.expiryDate || !formValues.cvv) {
          setError('Please fill in all card details');
          return;
        }
        
        const payload: AddCardMethodPayload = {
          type: 'card',
          cardNumber: formValues.cardNumber.replace(/\s/g, ''),
          cardHolderName: formValues.cardHolderName.trim(),
          expiryDate: formValues.expiryDate,
          cvv: formValues.cvv,
          isDefault: formValues.isDefault
        };
        
        const newMethod = await paymentService.addPaymentMethod(payload);
        setPaymentMethods(prev => [...prev, newMethod]);
      } else {
        if (!formValues.paypalEmail) {
          setError('Please enter your PayPal email');
          return;
        }
        
        const payload: AddPayPalMethodPayload = {
          type: 'paypal',
          paypalEmail: formValues.paypalEmail.trim(),
          isDefault: formValues.isDefault
        };
        
        const newMethod = await paymentService.addPaymentMethod(payload);
        setPaymentMethods(prev => [...prev, newMethod]);
      }

      setOpenAddDialog(false);
      setFormValues({
        type: 'card',
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: '',
        paypalEmail: '',
        isDefault: false,
      });
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Failed to add payment method';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await paymentService.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (err) {
      setError('Failed to delete payment method');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: keyof PaymentMethodForm; value: unknown };
    if (!name) return;
    
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'type' ? (value as PaymentMethodType) : String(value)
    }));
  };

  const renderCardForm = () => (
    <>
      <TextField
        name="cardNumber"
        label="Card Number"
        value={formValues.cardNumber}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        placeholder="1234 5678 9012 3456"
        inputProps={{ maxLength: 19 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          name="expiryDate"
          label="Expiry Date"
          value={formValues.expiryDate}
          onChange={handleFormChange}
          fullWidth
          placeholder="MM/YY"
          inputProps={{ maxLength: 5 }}
        />
        <TextField
          name="cvv"
          label="CVV"
          value={formValues.cvv}
          onChange={handleFormChange}
          fullWidth
          placeholder="123"
          type="password"
          inputProps={{ maxLength: 4 }}
        />
      </Box>
      <TextField
        name="cardHolderName"
        label="Cardholder Name"
        value={formValues.cardHolderName}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
      />
    </>
  );

  const renderPayPalForm = () => (
    <TextField
      name="paypalEmail"
      label="PayPal Email"
      value={formValues.paypalEmail}
      onChange={handleFormChange}
      fullWidth
      margin="normal"
      type="email"
      placeholder="your.email@example.com"
    />
  );

  const renderPaymentIcon = (type: PaymentMethodType) => {
    return type === 'card' ? (
      <CreditCardIcon color="primary" />
    ) : (
      <Box sx={{ 
        color: '#003087',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        lineHeight: 1,
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <span style={{ transform: 'translateY(-1px)' }}>Pay</span>
      </Box>
    );
  };

  const validateForm = () => {
    if (formValues.type === 'card') {
      if (!formValues.cardNumber?.trim()) {
        setError('Please enter your card number');
        return false;
      }
      if (!formValues.cardHolderName?.trim()) {
        setError('Please enter your cardholder name');
        return false;
      }
      if (!formValues.expiryDate?.trim()) {
        setError('Please enter your expiry date');
        return false;
      }
      if (!formValues.cvv?.trim()) {
        setError('Please enter your CVV');
        return false;
      }
    } else {
      if (!formValues.paypalEmail?.trim()) {
        setError('Please enter your PayPal email');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.paypalEmail)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Box key="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Payment Methods
        </Typography>
        <Button
          key="add-payment-button"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Payment Method
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Box 
        component="div"
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
          gap: 3 
        }}
      >
        {paymentMethods.length === 0 ? (
          <Box key="no-methods" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No payment methods found. Add one to get started.
            </Typography>
          </Box>
        ) : (
          paymentMethods.map((method, index) => (
            <Card 
              key={`payment-method-${method.id || `temp-${index}`}`} 
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {renderPaymentIcon(method.type)}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {method.type === 'card' ? 'Credit/Debit Card' : 'PayPal'}
                  </Typography>
                </Box>
                
                {method.type === 'card' ? (
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      {method.details?.cardNumber ? 
                        `•••• •••• •••• ${method.details.cardNumber.slice(-4)}` : 
                        'Card details not available'}
                    </Typography>
                    {method.details?.cardHolderName && (
                      <Typography variant="body2" color="textSecondary">
                        {method.details.cardHolderName}
                      </Typography>
                    )}
                    {method.details?.expiryDate && (
                      <Typography variant="body2" color="textSecondary">
                        Expires: {method.details.expiryDate}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      {method.details?.paypalEmail || method.paypalEmail || 'PayPal email not available'}
                    </Typography>
                    {method.last4 && (
                      <Typography variant="body2" color="textSecondary">
                        •••• {method.last4}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {method.isDefault && (
                  <Box mt={1}>
                    <Chip label="Default" size="small" color="primary" />
                  </Box>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={() => handleDeleteMethod(method.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      {/* Add Payment Method Dialog */}
      <Dialog key="add-payment-dialog" open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle key="dialog-title">Add Payment Method</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method Type</InputLabel>
              <Select
                value={formValues.type}
                onChange={(e) => {
                  const value = e.target.value as PaymentMethodType;
                  setFormValues(prev => ({
                    ...prev,
                    type: value,
                    cvv: ''
                  }));
                }}
                label="Payment Method Type"
                fullWidth
              >
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              {formValues.type === 'card' ? renderCardForm() : renderPayPalForm()}
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.isDefault}
                  onChange={(e) => setFormValues(prev => ({
                    ...prev,
                    isDefault: e.target.checked
                  }))}
                />
              }
              label="Set as default payment method"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddMethod} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Payment Method'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMethodsPage;
