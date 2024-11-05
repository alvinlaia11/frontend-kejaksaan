import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelpers } from './api';
import {
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useUser } from '../contexts/UserContext';

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: '0 auto',
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Input = styled('input')({
  display: 'none',
});

function UserProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { updateAvatar } = useUser();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log('userData updated:', userData);
  }, [userData]);

  useEffect(() => {
    console.log('editedData updated:', editedData);
  }, [editedData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiHelpers.profile.get();
      
      console.log('Profile response:', response);
      
      if (response.data) {
        setUserData(response.data);
        setEditedData(response.data);
        setAvatarUrl(response.data.avatar_url);
        updateAvatar(response.data.avatar_url);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiHelpers.profile.update(editedData);
      
      if (response.data) {
        setUserData(response.data);
        setIsEditing(false);
        showSnackbar('Profil berhasil diperbarui', 'success');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar('Gagal memperbarui profil', 'error');
    } finally {
      setLoading(false);
    } 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Ukuran file terlalu besar (maksimal 5MB)', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showSnackbar('File harus berupa gambar', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        setLoading(true);
        const response = await apiHelpers.profile.uploadAvatar(formData);
        
        if (response.data.success) {
          const newAvatarUrl = response.data.avatar_url;
          setAvatarUrl(newAvatarUrl);
          updateAvatar(newAvatarUrl);
          showSnackbar('Avatar berhasil diperbarui', 'success');
        } else {
          throw new Error(response.data.error || 'Gagal mengupload avatar');
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
        const errorMessage = err.response?.data?.error || 'Gagal mengunggah avatar';
        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogoutClick = () => setLogoutDialogOpen(true);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await apiHelpers.auth.logout();
      
      localStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      showSnackbar('Gagal melakukan logout', 'error');
    } finally {
      setLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>Data profil tidak tersedia</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <ProfilePaper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} container direction="column" alignItems="center">
            <Box position="relative">
              <ProfileAvatar 
                src={avatarUrl || '/default-avatar.png'} 
                alt="Profile"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';  // Fallback jika gambar gagal dimuat
                }}
              />
              <label htmlFor="icon-button-file">
                <Input accept="image/*" id="icon-button-file" type="file" onChange={handleAvatarChange} />
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                    '&:hover': { backgroundColor: 'background.default' },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
            <Box mt={2} sx={{ textAlign: 'center', width: '100%' }}>  
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ 
                  textAlign: 'center',
                  mb: 1  // Tambahkan margin bottom
                }}
              >
                {userData?.username}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="textSecondary"
                sx={{ textAlign: 'center' }}
              >
                {userData?.position || 'Posisi tidak tersedia'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Informasi Profil</Typography>
              {!isEditing ? (
                <IconButton onClick={handleEdit} size="small">
                  <EditIcon />
                </IconButton>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                  >
                    Simpan
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Batal
                  </Button>
                </Box>
              )}
            </Box>
            {isEditing ? (
              <Grid container spacing={2}>
                {['username', 'email', 'position', 'phone', 'office'].map((key) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      name={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={editedData[key] || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <>
                {['email', 'position', 'phone', 'office'].map((key) => (
                  <InfoItem key={key}>
                    <Typography variant="body2" color="textSecondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="body1">
                      {userData[key] ? userData[key] : 'Tidak tersedia'}
                    </Typography>
                  </InfoItem>
                ))}
              </>
            )}
          </Grid>
        </Grid>
        {!isEditing && (
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LogoutIcon />}
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          </Box>
        )}
      </ProfilePaper>
      
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Konfirmasi Logout"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin keluar dari akun Anda?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary" disabled={loggingOut}>
            Batal
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus disabled={loggingOut}>
            {loggingOut ? <CircularProgress size={24} /> : "Ya, Logout"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserProfile;
