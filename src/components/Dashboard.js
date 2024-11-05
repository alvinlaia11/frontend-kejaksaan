import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarToday, 
  Close as CloseIcon, 
  Celebration as CelebrationIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import io from 'socket.io-client';
import api from './api';  // Sesuaikan dengan path yang benar ke file api

function Dashboard() {
  const navigate = useNavigate();
  const [openWelcomeDialog, setOpenWelcomeDialog] = useState(false);
  const [username, setUsername] = useState('');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    const storedUsername = localStorage.getItem('username');
    
    if (!hasShownWelcome && storedUsername) {
      setUsername(storedUsername);
      setOpenWelcomeDialog(true);
      localStorage.setItem('hasShownWelcome', 'true');
    }

    return () => {
      if (!localStorage.getItem('token')) {
        localStorage.removeItem('hasShownWelcome');
      }
    };
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      // Handle notifikasi di sini (tampilkan toast/alert)
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleViewDetail = () => {
    navigate('/category');
  };

  const handleCloseWelcomeDialog = () => {
    setOpenWelcomeDialog(false);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        setSnackbarMessage('File berhasil diupload');
        setSnackbarSeverity('success');
      } else {
        throw new Error(response.data.error || 'Gagal mengupload file');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setSnackbarMessage(error.response?.data?.error || 'Gagal mengupload file');
      setSnackbarSeverity('error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Dashboard Penjadwalan Tindak Pidana Khusus
        </Typography>
      </Box>
      
      <Grid container spacing={4} justifyContent="center">
        {/* Card Jadwal */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Card sx={{ bgcolor: '#3f51b5', color: 'white', height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CalendarToday sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Jenis Jadwal
                </Typography>
                <Typography variant="body1" align="center">
                  Kelola dan pantau proses penyelidikan kasus tindak pidana khusus
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={handleViewDetail}
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#3f51b5',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: '#303f9f'
                    } 
                  }}
                >
                  Lihat Semua Kategori
                </Button>
              </CardActions>
            </Card>
          </Paper>
        </Grid>

        {/* Card Upload File */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Card sx={{ bgcolor: '#2e7d32', color: 'white', height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CloudUploadIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Upload Berkas
                </Typography>
                <Typography variant="body1" align="center">
                  Upload dan kelola berkas-berkas terkait kasus tindak pidana khusus
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
                <Button 
                  variant="contained" 
                  onClick={() => fileInputRef.current.click()}
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#2e7d32',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: '#1b5e20'
                    } 
                  }}
                  disabled={uploading}
                >
                  Upload Berkas
                </Button>
              </CardActions>
              {uploading && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Card>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openWelcomeDialog}
        onClose={handleCloseWelcomeDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pt: 3,
          pb: 2 
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Selamat Datang! 👋
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          pt: 2 
        }}>
          <CelebrationIcon sx={{ 
            fontSize: 80, 
            color: 'primary.main', 
            mb: 3,
            animation: 'bounce 1s infinite'
          }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Halo, {username}!
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Selamat datang di Dashboard Penjadwalan Tindak Pidana Khusus. 
            Kami siap membantu Anda mengelola kasus-kasus dengan efisien.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: 4,
          pt: 2
        }}>
          <Button 
            onClick={() => setOpenWelcomeDialog(false)}
            variant="contained"
            size="large"
            sx={{ 
              px: 6,
              py: 1,
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            Mulai
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <div>
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </div>
      </Snackbar>
    </Container>
  );
}

const styles = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Dashboard;
