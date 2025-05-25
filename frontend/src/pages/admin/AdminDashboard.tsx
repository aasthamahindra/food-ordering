// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  LocalMall as OrderIcon,
  People as UserIcon,
  AttachMoney as PaymentIcon
} from '@mui/icons-material';
import api from '../../services/api';

interface Stats {
  totalRestaurants: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/orders?limit=5&sort=-createdAt')
        ]);
        
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data.items || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <RestaurantIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Restaurants</Typography>
                  <Typography variant="h5">{stats?.totalRestaurants || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <OrderIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Total Orders</Typography>
                  <Typography variant="h5">{stats?.totalOrders || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <UserIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Users</Typography>
                  <Typography variant="h5">{stats?.totalUsers || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PaymentIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>Revenue</Typography>
                  <Typography variant="h5">
                    ${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Recent Orders"
              action={
                <Button 
                  color="primary" 
                  size="small"
                  onClick={() => navigate('/admin/orders')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <List>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <ListItem 
                    key={order._id} 
                    onClick={() => navigate(`/orders/${order._id}`)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <ListItemText
                      primary={`Order #${order.orderNumber}`}
                      secondary={`${order.items.length} items • ${new Date(order.createdAt).toLocaleDateString()}`}
                    />
                    <Typography 
                      variant="body2" 
                      color={order.status === 'completed' ? 'success.main' : 'text.secondary'}
                    >
                      {order.status}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent orders" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <List>
              <ListItem 
                onClick={() => navigate('/admin/restaurants/new')}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <ListItemIcon>
                  <RestaurantIcon />
                </ListItemIcon>
                <ListItemText primary="Add New Restaurant" />
              </ListItem>
              <ListItem 
                onClick={() => navigate('/admin/users')}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <ListItemIcon>
                  <UserIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}