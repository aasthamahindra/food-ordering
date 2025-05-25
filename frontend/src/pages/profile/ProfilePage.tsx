import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/auth.service';
import PasswordChangeForm from '../../components/PasswordChangeForm';

interface ProfileFormData {
  email: string;
  country: 'india' | 'america';
  role: 'admin' | 'manager' | 'team_member';
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    email: user?.email || '',
    country: user?.country || 'india',
    role: user?.role || 'team_member',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        country: user.country || 'india',
        role: user.role || 'team_member'
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ProfileFormData) => ({
      ...prev,
      [name]: value as ProfileFormData[keyof ProfileFormData],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        // Convert email to lowercase and filter out empty fields
        const updatedFormData = Object.entries(formData)
          .filter(([_, value]) => value !== '')
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: key === 'email' ? value.toLowerCase() : value
          }), {});

        await updateProfile(updatedFormData);
        updateUser(updatedFormData);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled={!editing}
          />
          <TextField
            fullWidth
            label="Country"
            name="country"
            select
            value={formData.country}
            onChange={handleChange}
            margin="normal"
            disabled={!editing}
          >
            <MenuItem value="india">India</MenuItem>
            <MenuItem value="america">America</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Role"
            name="role"
            select
            value={formData.role}
            onChange={handleChange}
            margin="normal"
            disabled={!editing}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="team_member">Team Member</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {!editing ? (
              <>
                <IconButton onClick={() => setEditing(true)}>
                  <EditIcon />
                </IconButton>
                <Button variant="contained" color="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>
        </form>

        {/* Password Change Section */}
        <Paper sx={{ mt: 4, p: 3 }}>
          <PasswordChangeForm
            email={formData.email}
            onSuccess={() => {
              // Reset password form after successful change
              // setPasswordData({
              //   currentPassword: '',
              //   newPassword: '',
              //   confirmPassword: '',
              // });
            }}
          />
        </Paper>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
