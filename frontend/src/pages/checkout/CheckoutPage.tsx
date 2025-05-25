import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services/orderService';
import type { PaymentMethod } from '../../types';
import PaymentStep from '../../components/checkout/PaymentStep';
import ShippingStep from './steps/ShippingStep';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingInfo {
  name: string;
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
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    items = [], 
    clearCart = () => {}, 
    paymentMethods = [], 
    isLoading: isCartLoading = false, 
    error: cartError = null, 
    selectedPaymentMethod = '', 
    setSelectedPaymentMethod = () => {},
    fetchPaymentMethods = async () => {}
  } = useCart();

  const totalAmount = useMemo(() => 
    items.reduce((total, item) => total + (item.price * item.quantity), 0),
    [items]
  );

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
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

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        await fetchPaymentMethods();
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [fetchPaymentMethods]);

  const steps = ['Shipping', 'Payment', 'Review'];

  const validateShippingInfo = useCallback(() => {
    const required = ['name', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];
    return required.every(field => {
      const value = shippingInfo[field as keyof ShippingInfo];
      return value !== undefined && value !== null && value !== '';
    });
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

  const handlePaymentMethodChange = useCallback((id: string) => {
    console.log('Updating selected payment method to:', id);
    setSelectedPaymentMethod(id);
    setError(''); // Clear any previous errors when a payment method is selected
  }, []);
  
  // Log when payment methods or selection changes
  useEffect(() => {
    console.log('Payment methods updated:', paymentMethods);
    console.log('Selected payment method:', selectedPaymentMethod);
  }, [paymentMethods, selectedPaymentMethod]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleNext = useCallback(() => {
    console.log('Next button clicked. Active step:', activeStep);
    
    if (activeStep === 0) {
      if (!validateShippingInfo()) {
        console.log('Shipping info validation failed');
        setError('Please fill in all required shipping information');
        return;
      }
    }
    
    if (activeStep === 1) {
      console.log('Checking payment method selection:', selectedPaymentMethod);
      if (!selectedPaymentMethod) {
        console.log('No payment method selected');
        setError('Please select a payment method');
        return;
      }
    }
    
    console.log('Proceeding to next step');
    setError('');
    setActiveStep(prev => prev + 1);
  }, [activeStep, validateShippingInfo, selectedPaymentMethod]);


  const handlePlaceOrder = useCallback(async () => {
    if (!validateShippingInfo()) {
      setError('Please fill in all required shipping information');
      return;
    }
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    console.log('Placing order with payment method:', selectedPaymentMethod);
    console.log('Cart items:', items);
    
    setIsLoading(true);
    setError('');

    try {
      const orderItems = items.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      console.log('Creating order with items:', orderItems);
      
      const order = await orderService.createOrder({
        items: orderItems,
        shippingInfo,
        paymentMethodId: selectedPaymentMethod,
        totalAmount: totalAmount
      });

      console.log('Order created:', order);
      console.log('Processing payment for order:', order.id);

      await orderService.processPayment({
        orderId: order.id,
        amount: totalAmount,
        paymentMethodId: selectedPaymentMethod
      });
      
      console.log('Payment processed successfully');
      clearCart();
      navigate('/order-confirmation', { state: { orderId: order.id } });
    } catch (err: any) {
      console.error('Error placing order:', err);
      const errorMessage = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(errorMessage);
      
      // Log additional error details for debugging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [shippingInfo, selectedPaymentMethod, items, totalAmount, clearCart, navigate, validateShippingInfo]);

  const renderOrderSummary = useCallback(() => {
    if (!items || items.length === 0) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        {items.map((item: CartItem) => (
          <Box key={item._id} display="flex" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="body1">{item.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Qty: {item.quantity}
              </Typography>
            </Box>
            <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Paper>
    );
  }, [items, totalAmount]);

  const handleAddPaymentMethod = useCallback(() => {
    navigate('/payment-methods/add', { state: { fromCheckout: true } });
  }, [navigate]);

  const renderPaymentStep = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Payment Method</Typography>
      {error && (
        <Box mb={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {cartError && (
        <Box mb={3}>
          <Alert severity="error">{cartError}</Alert>
        </Box>
      )}
      <PaymentStep
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={handlePaymentMethodChange}
        onAddPaymentMethod={handleAddPaymentMethod}
        loading={isLoading || isCartLoading}
        error={error || cartError || undefined}
      />
    </Box>
  );

  const ReviewStepComponent = useCallback(() => {
    const selectedMethod = paymentMethods.find(
      (m: PaymentMethod) => m.id === selectedPaymentMethod
    );
    const paymentType = selectedMethod ? selectedMethod.type : 'Not selected';
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        {renderOrderSummary()}
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Shipping Address</Typography>
          <Typography gutterBottom>
            {shippingInfo.firstName} {shippingInfo.lastName}
          </Typography>
          <Typography color="textSecondary">
            {shippingInfo.address}
            {shippingInfo.address2 && <><br />{shippingInfo.address2}</>}
            <br />
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
            <br />
            {shippingInfo.country}
          </Typography>
          <Typography sx={{ mt: 1 }}>Phone: {shippingInfo.phone}</Typography>
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Payment Method</Typography>
          <Typography>{paymentType}</Typography>
        </Box>
      </Box>
    );
  }, [renderOrderSummary, selectedPaymentMethod, shippingInfo, paymentMethods]);

  const renderStepContent = useCallback((step: number) => {
    switch (step) {
      case 0:
        return (
          <ShippingStep
            shippingInfo={shippingInfo}
            handleShippingInfoChange={handleShippingInfoChange}
            handleCheckboxChange={handleCheckboxChange}
            error={error}
          />
        );
      case 1:
        if (isLoading || isCartLoading) {
          return (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          );
        }
        return renderPaymentStep();
      case 2:
        return <ReviewStepComponent />;
      default:
        return <div>Unknown step</div>;
    }
  }, [shippingInfo, handleShippingInfoChange, handleCheckboxChange, error, ReviewStepComponent, isCartLoading, cartError]);

  if (isCartLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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
          {steps.map((label, index) => (
            <Step key={`${label}-${index}`}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {(error || cartError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || cartError}
            </Alert>
          )}
          
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handlePlaceOrder : handleNext}
              disabled={isSubmitting || isCartLoading}
            >
              {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
