import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Container,
  CircularProgress
} from '@mui/material';
import { CartContext } from '../../contexts/CartContext';
import { paymentService } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import type { PaymentMethod } from '../../types';
import ShippingStep from './steps/ShippingStep';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId?: string;
}

// This type is now defined in the order service

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
  notes?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { items, clearCart } = cartContext || { items: [], clearCart: () => {} };

  const totalAmount = items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    saveInfo: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [error, setError] = useState('');
  const steps = ['Shipping', 'Payment', 'Review'];

  const validateShippingInfo = useCallback((): { isValid: boolean; missingFields?: string[] } => {
    const requiredFields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'zipCode', label: 'ZIP/Postal Code' },
      { key: 'country', label: 'Country' },
      { key: 'phone', label: 'Phone Number' }
    ] as const;

    const missingFields = requiredFields
      .filter(({ key }) => {
        const value = shippingInfo[key as keyof ShippingInfo];
        return typeof value === 'string' ? !value.trim() : !value;
      })
      .map(({ label }) => label);

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }, [shippingInfo]);

  const handleShippingInfoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setShippingInfo(prev => ({
      ...prev,
      [name]: checked
    }));
  }, []);

  const handlePaymentMethodChange = (id: string) => {
    setSelectedPaymentMethod(id);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const { isValid, missingFields } = validateShippingInfo();
      if (!isValid) {
        setError(
          missingFields?.length 
            ? `Please fill in the following required fields: ${missingFields.join(', ')}`
            : 'Please fill in all required shipping information'
        );
        return;
      }
    }
    if (activeStep === 1 && !selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handlePlaceOrder = async () => {
    // Validate shipping info
    const { isValid, missingFields } = validateShippingInfo();
    if (!isValid) {
      setError(
        missingFields?.length 
          ? `Please fill in the following required fields: ${missingFields.join(', ')}`
          : 'Please fill in all required shipping information'
      );
      return;
    }
    
    // Validate payment method
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    // Validate cart items
    if (!items || items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Get the restaurant ID from the first item in the cart
      // Note: This assumes all items are from the same restaurant
      const restaurantId = items[0]?.restaurantId;
      
      if (!restaurantId) {
        throw new Error('Could not determine restaurant for the order');
      }

      // Format delivery address as a single line string
      const deliveryAddress = [
        shippingInfo.address,
        shippingInfo.address2,
        `${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
        shippingInfo.country
      ].filter(Boolean).join(', ');

      // Prepare order items in the format expected by the backend
      const orderItems = items.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      // Prepare order data
      const orderData = {
        restaurantId,
        items: orderItems,
        deliveryAddress,
        notes: shippingInfo.notes?.trim() || undefined
      };

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      // Create order
      const order = await orderService.createOrder(orderData);

      // Process payment
      try {
        console.log('Processing payment for order:', order._id);
        const paymentResponse = await orderService.processPayment({
          orderId: order._id,
          paymentMethodId: selectedPaymentMethod,
          amount: order.totalAmount
        });

        console.log('Payment response:', paymentResponse);

        // Handle the payment response based on its structure
        const paymentResult = paymentResponse.payment || paymentResponse;
        
        if (!paymentResult || !paymentResult.success) {
          throw new Error(paymentResult?.error?.message || 'Payment processing failed');
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        // If payment fails, we should delete the order to maintain consistency
        try {
          await orderService.cancelOrder(order._id);
          console.log('Order cancelled due to payment failure');
        } catch (cancelError) {
          console.error('Failed to cancel order after payment failure:', cancelError);
        }
        throw error; // Re-throw to be caught by the outer try-catch
      }

      // Clear cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', { 
        state: { 
          orderId: order._id,
          orderNumber: order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`,
          totalAmount: order.totalAmount
        },
        replace: true // Prevent going back to checkout
      });
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        // Handle API error response
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Handle JavaScript/TypeScript error
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderSummary = (): React.ReactNode => {
    if (!items || items.length === 0) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List>
          {items.map((item: CartItem) => (
            <ListItem key={item._id}>
              {item.imageUrl && (
                <ListItemAvatar>
                  <Avatar src={item.imageUrl} alt={item.name} variant="square" />
                </ListItemAvatar>
              )}
              <ListItemText
                primary={item.name}
                secondary={`Qty: ${item.quantity}`}
              />
              <Typography variant="body2">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
        </Box>
      </Paper>
    );
  };

  const PaymentStepComponent = () => {
    if (loadingPaymentMethods) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Loading payment methods...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ my: 2 }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Method
        </Typography>
        {paymentMethods.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            {paymentMethods.map((method) => {
              const paymentLabel = method.type === 'card' 
                ? `Card ending in ${method.last4 || '****'}` 
                : `PayPal (${method.paypalEmail || 'no email'})`;
                
              return (
                <Paper 
                  key={method._id}
                  elevation={selectedPaymentMethod === method._id ? 3 : 0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: selectedPaymentMethod === method._id 
                      ? '1px solid #1976d2' 
                      : '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'rgba(25, 118, 210, 0.5)',
                    },
                  }}
                  onClick={() => handlePaymentMethodChange(method._id)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPaymentMethod === method._id}
                        onChange={() => handlePaymentMethodChange(method._id)}
                        sx={{ mr: 1 }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1">
                          {method.type.toUpperCase()} - {paymentLabel}
                        </Typography>
                        {method.isDefault && (
                          <Typography variant="caption" color="primary">
                            Default
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ 
                      width: '100%',
                      m: 0,
                      '& .MuiFormControlLabel-label': {
                        flex: 1,
                      },
                    }}
                  />
                </Paper>
              );
            })}
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                // TODO: Implement add new payment method flow
                console.log('Add new payment method');
              }}
            >
              Add New Payment Method
            </Button>
          </Box>
        ) : (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              No payment methods found
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // TODO: Implement add new payment method flow
                console.log('Add new payment method');
              }}
            >
              Add Payment Method
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const ReviewStepComponent = () => {
    const selectedMethod = paymentMethods.find(m => m._id === selectedPaymentMethod);
    let paymentType = 'Not selected';
    
    if (selectedMethod) {
      paymentType = selectedMethod.type === 'card' 
        ? `Card ending in ${selectedMethod.last4 || '****'}`
        : `PayPal (${selectedMethod.paypalEmail || 'no email'})`;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {renderOrderSummary()}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          <Typography gutterBottom>
            {shippingInfo.firstName} {shippingInfo.lastName}
          </Typography>
          <Typography color="text.secondary">
            {shippingInfo.address}
            {shippingInfo.address2 && <><br />{shippingInfo.address2}</>}
            <br />
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
            <br />
            {shippingInfo.country}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Phone: {shippingInfo.phone}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          <Typography gutterBottom>
            {paymentType}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <ShippingStep
              shippingInfo={shippingInfo}
              handleShippingInfoChange={handleShippingInfoChange}
              handleCheckboxChange={handleCheckboxChange}
              error={error}
            />
          </Box>
        );
      case 1:
        return <PaymentStepComponent />;
      case 2:
        return <ReviewStepComponent />;
      default:
        return <div>Unknown step</div>;
    }
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      setError('');
      
      try {
        const methods = await paymentService.getPaymentMethods();
        if (Array.isArray(methods)) {
          setPaymentMethods(methods);
          if (methods.length > 0) {
            // Pre-select the default payment method if available
            const defaultMethod = methods.find(m => m.isDefault) || methods[0];
            setSelectedPaymentMethod(defaultMethod._id);
          }
        } else {
          console.error('Invalid payment methods response:', methods);
          setError('Failed to load payment methods. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  if (loading) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4, mt: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handlePlaceOrder : handleNext}
              sx={{ mt: 3, ml: 1 }}
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}