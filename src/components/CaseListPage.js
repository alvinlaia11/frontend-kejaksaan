import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, IconButton, Box, 
  Breadcrumbs, Link, Snackbar, Alert, CircularProgress, Grid, Card, CardContent
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from './api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jakarta' // Tambahkan timezone Indonesia
  };
  return date.toLocaleDateString('id-ID', options);
};

function CaseListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', date: '', description: '', parties: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        // Perbaiki URL dan parameter
        const response = await api.get('/api/cases', {
          params: { 
            type: category // pastikan category tidak mengandung karakter khusus
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response data:', response.data);
        setCases(response.data || []);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Gagal mengambil data kasus');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [navigate, category]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCase({ title: '', date: '', description: '', parties: '' });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCase(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewCase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/cases', 
        {
          ...newCase,
          type: category
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Refresh data setelah menambah kasus baru
      const updatedResponse = await api.get(`/api/cases?type=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCases(updatedResponse.data);
      
      handleCloseDialog();
      setSnackbarMessage(`Kasus baru "${response.data.title}" telah ditambahkan`);
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error adding new case:', error);
      setSnackbarMessage('Gagal menambahkan kasus baru');
      setOpenSnackbar(true);
    }
  };

  const handleBackToCategory = () => {
    navigate('/category');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleViewDetail = (caseId) => {
    navigate(`/case/${caseId}`, { state: { from: location.pathname } });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBackToCategory} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/category" underline="hover" color="inherit">
              Kategori
            </Link>
            <Typography color="text.primary">{category}</Typography>
          </Breadcrumbs>
        </Box>
        <Typography variant="h5" gutterBottom>Daftar Kasus {category}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ mb: 2 }}
        >
          Tambah Kasus Baru
        </Button>
        <Grid container spacing={2}>
          {cases.map((caseItem) => (
            <Grid item xs={12} key={caseItem.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{caseItem.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tanggal: {formatDate(caseItem.date)}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => handleViewDetail(caseItem.id)}
                  >
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Tambah Kasus Baru</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Judul Kasus"
            type="text"
            fullWidth
            variant="standard"
            value={newCase.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="date"
            label="Tanggal"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={newCase.date}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Deskripsi"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={newCase.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="parties"
            label="Pihak Terkait"
            type="text"
            fullWidth
            variant="standard"
            value={newCase.parties}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button onClick={handleSaveNewCase}>Simpan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CaseListPage;
