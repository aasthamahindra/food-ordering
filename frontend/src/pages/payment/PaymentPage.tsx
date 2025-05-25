import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { paymentService } from '../../services/paymentService';
import type { PaymentMethod } from '../../services/paymentService';

interface CartContextType {
  cartItems: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  cartTotal: number;
  clearCart: () => void;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext<CartContextType | null>(CartContext as any);
  const cartItems = cartContext?.cartItems || [];
  const cartTotal = cartContext?.cartTotal || 0;
  const clearCart = cartContext?.clearCart || (() => {});

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await paymentService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      const orderId = Date.now().toString(); // Generate a unique order ID
      const paymentData = {
        orderId,
        paymentMethodId: selectedPaymentMethod,
        amount: cartTotal,
      };

      await paymentService.processPayment(paymentData);
      clearCart();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const renderOrderSummary = () => {
    if (!cartItems || cartItems.length === 0) {
      return (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/restaurants')}
          >
            Continue Shopping
          </Button>
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
          {cartItems.map((item) => (
            <ListItem key={item._id}>
              <ListItemAvatar>
                {item.imageUrl ? (
                  <Avatar src={item.imageUrl} />
                ) : (
                  <Avatar>{item.name[0]}</Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={`${item.quantity} × ${item.price.toFixed(2)}`}
              />
              <Typography variant="body2">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading payment methods...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Payment
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 0', minWidth: '100%', maxWidth: '66.66%' }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                sx={{
                  mb: 2,
                  backgroundColor:
                    selectedPaymentMethod === method.id ? 'primary.light' : 'inherit',
                }}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {method.type}
                  </Typography>
                  {method.details && (
                    <Typography variant="body2" color="text.secondary">
                      {method.details.cardNumber}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ flex: '1 1 0', minWidth: '100%', maxWidth: '33.33%' }}>
            {renderOrderSummary()}
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePayment}
            disabled={!selectedPaymentMethod}
          >
            Pay ${cartTotal.toFixed(2)}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
