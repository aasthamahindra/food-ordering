import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

export interface ShippingStepProps {
  shippingInfo: {
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
  };
  handleShippingInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  error: string;
}

export default function ShippingStep({ shippingInfo, handleShippingInfoChange, handleCheckboxChange, error }: ShippingStepProps) {
  return (
    <Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={shippingInfo.firstName}
          onChange={handleShippingInfoChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={shippingInfo.lastName}
          onChange={handleShippingInfoChange}
          required
          margin="normal"
        />
      </Box>
      <TextField
        fullWidth
        label="Address"
        name="address"
        value={shippingInfo.address}
        onChange={handleShippingInfoChange}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Apartment, suite, etc. (optional)"
        name="address2"
        value={shippingInfo.address2 || ''}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="City"
        name="city"
        value={shippingInfo.city}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="State"
        name="state"
        value={shippingInfo.state}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Zip Code"
        name="zipCode"
        value={shippingInfo.zipCode}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Country"
        name="country"
        value={shippingInfo.country}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Phone"
        name="phone"
        value={shippingInfo.phone}
        onChange={handleShippingInfoChange}
        margin="normal"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={shippingInfo.saveInfo}
            onChange={(e) => handleCheckboxChange('saveInfo', e.target.checked)}
          />
        }
        label="Save this information for future use"
      />
    </Box>
  );
}
