import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useUser } from '../contexts/UserContext';

function LoginPage({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateAvatar } = useUser();
  const [welcomeDialog, setWelcomeDialog] = useState({
    open: false,
    username: ''
  });

  useEffect(() => {
    localStorage.clear();
    sessionStorage.removeItem('sessionActive');
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Silakan isi email dan password');
      return;
    }

    setIsLoading(true);
    try {
      const loginResponse = await api.post('/api/auth/login', { email, password });
      
      if (!loginResponse.data || !loginResponse.data.token) {
        throw new Error('Invalid login response');
      }

      const { token, user } = loginResponse.data;
      
      sessionStorage.setItem('sessionActive', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('username', user.username);

      setIsLoggedIn(user.role);
      
      setWelcomeDialog({
        open: true,
        username: user.username
      });

      try {
        const profileResponse = await api.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (profileResponse.data?.avatar_url) {
          updateAvatar(profileResponse.data.avatar_url);
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
      }

    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Email atau password salah');
      }
      localStorage.clear();
      sessionStorage.removeItem('sessionActive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWelcome = () => {
    console.log('Closing welcome dialog');
    setWelcomeDialog({ open: false, username: '' });
    
    setTimeout(() => {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }, 300);
  };

  useEffect(() => {
    if (welcomeDialog.open) {
      console.log('Welcome dialog should be visible now:', welcomeDialog);
    }
  }, [welcomeDialog]);

  return (
    <>
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mt: 8 
          }}
        >
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                width: '100%',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate 
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Alamat Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              error={Boolean(error)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Kata Sandi"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              error={Boolean(error)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Masuk'
              )}
            </Button>
          </Box>
        </Paper>
        
        <Box mt={2}>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
          >
            Gunakan akun yang telah didaftarkan atau hubungi admin untuk membuat akun baru.
          </Typography>
        </Box>
      </Container>

      <Dialog
        open={welcomeDialog.open}
        onClose={handleCloseWelcome}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '16px',
            minWidth: '300px'
          }
        }}
        TransitionProps={{
          onEntered: () => {
            console.log('Dialog fully opened');
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pt: 4,
          pb: 2
        }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              mb: 1
            }}
          >
            Selamat Datang! 👋
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Halo, {welcomeDialog.username}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Senang bertemu dengan Anda kembali di sistem kami.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: 4,
          px: 3 
        }}>
          <Button 
            onClick={handleCloseWelcome}
            variant="contained"
            size="large"
            sx={{ 
              px: 6,
              py: 1,
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
            autoFocus
          >
            Mulai
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LoginPage;
