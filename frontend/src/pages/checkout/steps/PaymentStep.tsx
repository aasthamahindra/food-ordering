import React from 'react';
import {
  Box,
  Radio,
  FormControlLabel,
  Typography,
} from '@mui/material';

interface PaymentStepProps {
  paymentMethods: Array<{
    id: string;
    type: string;
    details: {
      cardNumber?: string;
      expiryDate?: string;
      nameOnCard?: string;
      isDefault: boolean;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  selectedPaymentMethod: string;
  handlePaymentMethodChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
}

export default function PaymentStep({ paymentMethods, selectedPaymentMethod, handlePaymentMethodChange, error }: PaymentStepProps) {
  return (
    <Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {paymentMethods.map((method) => (
        <FormControlLabel
          key={method.id}
          control={
            <Radio
              key={method.id}
              checked={selectedPaymentMethod === method.id}
              onChange={handlePaymentMethodChange}
              value={method.id}
              name="paymentMethod"
            />
          }
          label={
            method.type === 'card' ? 
              `Card - ${method.details.cardNumber?.slice(-4)}` : 
              method.type
          }
        />
      ))}
    </Box>
  );
}
