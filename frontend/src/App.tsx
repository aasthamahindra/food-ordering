import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';

// Pages
// Using a simple div for now since we don't have the actual NotFoundPage component
const NotFoundPage = () => <div>Page Not Found</div>;
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RestaurantListPage from './pages/restaurants/RestaurantListPage';
import RestaurantDetailPage from './pages/restaurants/RestaurantDetailPage';
import RestaurantMenuPage from './pages/restaurants/RestaurantMenuPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderHistoryPage from './pages/orders/OrderHistoryPage';
import OrderConfirmationPage from './pages/order-confirmation/OrderConfirmationPage';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentMethodsPage from './pages/payments/PaymentMethodsPage';
import PaymentHistoryPage from './pages/payments/PaymentHistoryPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }>
                  <Route index element={<HomePage />} />
                  <Route path="restaurants" element={<RestaurantListPage />} />
                  <Route path="restaurants/:id" element={<RestaurantDetailPage />}>
                    <Route index element={<Navigate to="menu" replace />} />
                    <Route path="menu" element={<RestaurantMenuPage />} />
                  </Route>
                  <Route path="cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/orders/confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/orders/:orderId" element={<div>Order Details</div>} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/payments">
                    <Route index element={<Navigate to="history" replace />} />
                    <Route path="methods" element={<PaymentMethodsPage />}>
                      <Route path="add" element={<div />} />
                    </Route>
                    <Route path="history" element={<PaymentHistoryPage />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={
                  <ProtectedRoute roles={['admin', 'manager']}>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }>
                  <Route path="admin/users" element={<div>Admin Users</div>} />
                  <Route path="admin/restaurants" element={<div>Admin Restaurants</div>} />
                  <Route path="admin/menu-items" element={<div>Admin Menu Items</div>} />
                  <Route path="admin/orders" element={<div>Admin Orders</div>} />
                </Route>
                
                {/* 404 Not Found - This should be the last route */}
                <Route path="*" element={
                  <MainLayout>
                    <NotFoundPage />
                  </MainLayout>
                } />
              </Routes>
            </Router>
            <div style={{ display: 'none' }}>
              <ReactQueryDevtools initialIsOpen={false} />
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
