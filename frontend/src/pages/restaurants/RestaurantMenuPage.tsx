import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { getRestaurantById } from '../../services/restaurantService';
import { getMenuItems } from '../../services/menuService';
import { useQuery } from '@tanstack/react-query';

const RestaurantMenuPage: React.FC = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const { addItem } = useCart();

  // Fetch restaurant details
  const { data: restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurantById(restaurantId!),
    enabled: !!restaurantId,
  });

  // Fetch menu items
  const { data: menuData, isLoading: isLoadingMenu, error: menuError } = useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: () => getMenuItems(restaurantId!),
    enabled: !!restaurantId,
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const isLoading = isLoadingRestaurant || isLoadingMenu;
  const error = restaurantError || menuError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">
          {error instanceof Error ? error.message : 'Failed to load data. Please try again later.'}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Restaurant not found</Typography>
        <Button variant="contained" onClick={() => navigate('/restaurants')} sx={{ mt: 2 }}>
          Back to Restaurants
        </Button>
      </Container>
    );
  }

  // Get unique categories for tabs
  const categories = Array.from(
    new Set(menuData?.menuItems?.map((item) => item.category) || [])
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="menu categories"
        >
          <Tab label="All" />
          {categories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
        <Divider />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mt: 3 }}>
        {menuData?.menuItems
          ?.filter((item) => value === 0 || item.category === categories[value - 1])
          .map((item) => (
            <Card key={item._id} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.imageUrl}
                      alt={item.name}
                      sx={{ width: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={item.category} 
                      size="small" 
                      sx={{ mb: 1, textTransform: 'capitalize', alignSelf: 'flex-start' }} 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="small"
                        onClick={() => restaurantId && addItem(item, restaurantId)}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
          ))}
      </Box>
    </Container>
  );
};

export default RestaurantMenuPage;
