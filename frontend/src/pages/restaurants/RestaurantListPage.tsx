import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '../../services/restaurantService';

const RestaurantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['restaurants', { searchTerm, cuisineType, page, limit }],
    queryFn: () => getRestaurants({ search: searchTerm, cuisineType, page, limit }),
  });

  const restaurants = data?.restaurants || [];
  const pagination = data?.pagination || { page: 1, limit, totalCount: 0, totalPages: 1 };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleCuisineChange = (e: SelectChangeEvent) => {
    setCuisineType(e.target.value);
    setPage(1);
  };

  const handleViewMenu = (restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}/menu`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">
          Error loading restaurants: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Restaurants
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          <TextField
            placeholder="Search restaurants..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Cuisine</InputLabel>
            <Select
              value={cuisineType}
              onChange={handleCuisineChange}
              label="Cuisine"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Indian">Indian</MenuItem>
              <MenuItem value="American">American</MenuItem>
              <MenuItem value="Italian">Italian</MenuItem>
              <MenuItem value="Chinese">Chinese</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Restaurant Grid */}
        {restaurants.length > 0 ? (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            width: '100%'
          }}>
            {restaurants.map((restaurant) => (
              <Box key={restaurant._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      pt: '56.25%', // 16:9
                    }}
                    image={restaurant.imageUrl || 'https://source.unsplash.com/random?restaurant'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {restaurant.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {restaurant.cuisineType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.address}, {restaurant.country}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewMenu(restaurant._id)}
                    >
                      View Menu
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No restaurants found. Try adjusting your search filters.
          </Typography>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Typography variant="body1" sx={{ mx: 2, alignSelf: 'center' }}>
              Page {page} of {pagination.totalPages}
            </Typography>
            <Button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              sx={{ ml: 1 }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RestaurantListPage;
