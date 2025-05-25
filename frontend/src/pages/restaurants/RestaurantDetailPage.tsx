import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  CardMedia, 
  Button,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantById } from '../../services/restaurantService';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisineType: string;
  address: string;
  imageUrl?: string;
}

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch restaurant details
  const { data: restaurant, isLoading, error } = useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id || ''),
    enabled: !!id,
  });

  // Redirect to menu tab by default
  useEffect(() => {
    if (id) {
      navigate(`/restaurants/${id}/menu`, { replace: true });
    }
  }, [id, navigate]);

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
          {error instanceof Error ? error.message : 'Failed to load restaurant details'}
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)} 
            startIcon={<span>&larr;</span>}
            sx={{ alignSelf: 'flex-start', mb: 2 }}
          >
            Back to Restaurants
          </Button>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: '40%' } }}>
              <CardMedia
                component="img"
                height="300"
                image={restaurant.imageUrl || 'https://source.unsplash.com/random?restaurant'}
                alt={restaurant.name}
                sx={{ width: '100%', borderRadius: 1, objectFit: 'cover' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {restaurant.name}
              </Typography>
              <Chip 
                label={restaurant.cuisineType} 
                color="primary" 
                size="small"
                sx={{ mb: 2, textTransform: 'capitalize' }}
              />
              <Typography variant="body1" paragraph>
                {restaurant.description}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {restaurant.address}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Nested routes will be rendered here */}
        <Outlet context={{ restaurant }} />
      </Paper>
    </Container>
  );
};

export default RestaurantDetailPage;
