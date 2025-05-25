import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
} from '@mui/material';

interface ReviewStepProps {
  items: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  handlePlaceOrder: () => void;
  error: string;
}

export default function ReviewStep({ items, totalAmount, shippingInfo, handlePlaceOrder, error }: ReviewStepProps) {
  return (
    <Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <List>
        {items.map((item) => (
          <ListItem key={item._id}>
            <ListItemAvatar>
              <Avatar>
                <Typography>{item.name[0]}</Typography>
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${item.quantity} × ${item.name}`}
              secondary={`₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}`}
            />
          </ListItem>
        ))}
        <ListItem>
          <ListItemText
            primary="Total"
            secondary={`₹${totalAmount}`}
          />
        </ListItem>
      </List>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Shipping Information
      </Typography>
      <Typography>{`${shippingInfo.firstName} ${shippingInfo.lastName}`}</Typography>
      <Typography>{shippingInfo.address}</Typography>
      <Typography>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`}</Typography>
      <Typography>{shippingInfo.country}</Typography>
      <Typography>{shippingInfo.phone}</Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handlePlaceOrder}
          fullWidth
        >
          Place Order
        </Button>
      </Box>
    </Box>
  );
}
