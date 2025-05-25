import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/order.service';
import type { Order } from '../../types';
// Remove unused import

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ page: 1, limit: 10 })
  });
  
  // The response has the structure { orders: Order[], pagination: { ... } }
  const orders = Array.isArray(ordersResponse?.orders) 
    ? ordersResponse.orders 
    : [];
    
  console.log('Orders:', orders);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">Error loading orders</Typography>
      </Container>
    );
  }



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Restaurant</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.restaurantId}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: order.status === 'delivered' ? 'success.main' : 'warning.main',
                      color: 'white',
                    }}
                  >
                    {order.status}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => navigate(`/orders/${order._id}`)}
                    size="small"
                  >
                    Details
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderHistoryPage;
