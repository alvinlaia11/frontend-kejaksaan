import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, IconButton, Box, 
  Breadcrumbs, Link, Snackbar, Alert, CircularProgress, Grid, Card, CardContent, Chip
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
  const [newCase, setNewCase] = useState({ 
    title: '', 
    date: '', 
    description: '', 
    parties: '',
    witnesses: '',
    prosecutor: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/api/cases', {
        params: { 
          type: category
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response data:', response.data);
      setCases(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error details:', err);
      setError('Gagal mengambil data kasus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [category]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCase({ 
      title: '', 
      date: '', 
      description: '', 
      parties: '',
      witnesses: '',
      prosecutor: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCase(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewCase = async () => {
    try {
      if (!newCase.title || !newCase.date) {
        showSnackbar('Judul dan tanggal harus diisi', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      
      const dataToSend = {
        title: newCase.title,
        date: newCase.date,
        description: newCase.description || '',
        type: category,
        parties: newCase.parties || '',
        witnesses: newCase.witnesses || '',
        prosecutor: newCase.prosecutor || '',
      };

      console.log('Data yang akan dikirim:', JSON.stringify(dataToSend, null, 2));

      const response = await api.post('/api/cases', dataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response dari server:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        await fetchCases();
        handleCloseDialog();
        showSnackbar('Kasus baru berhasil ditambahkan', 'success');
      }
    } catch (error) {
      console.error('Error adding new case:', error);
      showSnackbar(error.response?.data?.error || 'Gagal menambahkan kasus baru', 'error');
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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
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
          {cases.length > 0 ? (
            cases.map((caseItem) => (
              <Grid item xs={12} key={caseItem.id}>
                <Card>
                  <CardContent sx={{ position: 'relative' }}>
                    <Chip 
                      label={caseItem.status || 'Menunggu'}
                      color={
                        caseItem.status === 'Selesai' ? 'success' :
                        caseItem.status === 'Sedang Proses' ? 'info' :
                        'warning'
                      }
                      size="medium"
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16
                      }}
                    />

                    <Typography variant="h6" sx={{ pr: 12 }}>
                      {caseItem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal: {formatDate(caseItem.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saksi: {caseItem.witnesses || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jaksa: {caseItem.prosecutor || '-'}
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
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center" color="text.secondary">
                Belum ada kasus untuk kategori ini
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Tambah Kasus Baru</DialogTitle>
        <DialogContent>
          <TextField
            required
            error={!newCase.title}
            helperText={!newCase.title ? "Judul harus diisi" : ""}
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
            required
            error={!newCase.date}
            helperText={!newCase.date ? "Tanggal harus diisi" : ""}
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
          <TextField
            margin="dense"
            name="witnesses"
            label="Saksi"
            type="text"
            fullWidth
            variant="standard"
            value={newCase.witnesses}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="prosecutor"
            label="Jaksa"
            type="text"
            fullWidth
            variant="standard"
            value={newCase.prosecutor}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button 
            onClick={handleSaveNewCase}
            disabled={!newCase.title || !newCase.date}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CaseListPage;
