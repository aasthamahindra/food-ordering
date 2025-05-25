import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  Box,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  History as HistoryIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle as ProfileIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm')); // Used for responsive behavior
  const location = useLocation();
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
    },
    {
      text: 'Restaurants',
      icon: <RestaurantIcon />,
      path: '/restaurants',
    },
    {
      text: 'My Orders',
      icon: <HistoryIcon />,
      path: '/orders',
      roles: ['user', 'admin', 'manager', 'team_member'],
    },
    {
      text: 'Profile',
      icon: <ProfileIcon />,
      path: '/profile',
      roles: ['user', 'admin', 'manager', 'team_member'],
    },
    {
      text: 'Payment Methods',
      icon: <PaymentIcon />,
      path: '/payments/methods',
      roles: ['user', 'admin', 'manager', 'team_member'],
    },
  ];

  const allMenuItems = [...menuItems];

  const handleSubmenuToggle = (text: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const isMenuItemActive = (item: MenuItem, currentPath: string): boolean => {
    if (item.path === currentPath) return true;
    if (item.children) {
      return item.children.some((child) => isMenuItemActive(child, currentPath));
    }
    return false;
  };

  const renderMenuItems = (items: MenuItem[], depth = 0) => {
    return items
      .filter((item) => {
        // Filter based on user role
        if (!item.roles || !user) return true;
        return item.roles.includes(user.role);
      })
      .map((item) => {
        const isActive = isMenuItemActive(item, location.pathname);
        const hasChildren = item.children && item.children.length > 0;
        const isSubmenuOpen = openSubmenus[item.text] || false;

        return (
          <React.Fragment key={item.path}>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => {
                  if (hasChildren) {
                    handleSubmenuToggle(item.text);
                  }
                }}
                selected={isActive}
                sx={{
                  pl: 2 + depth * 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {hasChildren && (isSubmenuOpen ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {hasChildren && (
              <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItems(item.children || [], depth + 1)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      });
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          FoodOrder App
        </Typography>
      </Toolbar>
      <Divider />
      <List>{renderMenuItems(allMenuItems)}</List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
