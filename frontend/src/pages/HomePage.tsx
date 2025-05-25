import React from 'react';
import { Typography, Container, Box } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to FoodOrder App
        </Typography>
        <Typography variant="body1">
          Discover the best restaurants and order your favorite food online.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
