import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { 
  Container, Typography, Paper, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  IconButton, Box, Breadcrumbs, Link, Snackbar, Alert,
  CircularProgress, Grid, Card, CardContent
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

function ScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const fetchCaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get(`/api/cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Case data received:', response.data);
      
      if (!response.data) {
        throw new Error('Data kasus tidak ditemukan');
      }
      
      const caseData = {
        ...response.data,
        witnesses: response.data.witnesses || '',
        prosecutor: response.data.prosecutor || ''
      };
      
      setCaseData(caseData);
      setEditedCase(caseData);
    } catch (error) {
      console.error('Error fetching case data:', error);
      setError(error.response?.data?.error || 'Gagal mengambil data kasus');
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!id) {
      console.error('No case ID provided');
      navigate('/dashboard');
      return;
    }
    
    console.log('Initializing ScheduleDetailPage with ID:', id);
    fetchCaseData();
  }, [id, navigate, fetchCaseData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const dataToUpdate = {
        title: editedCase.title,
        date: editedCase.date,
        description: editedCase.description || '',
        parties: editedCase.parties || '',
        type: editedCase.type,
        witnesses: editedCase.witnesses || '',
        prosecutor: editedCase.prosecutor || ''
      };

      console.log('Data yang akan diupdate:', dataToUpdate);

      const response = await api.put(`/api/cases/${id}`, dataToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response update:', response.data);

      if (response.data) {
        setCaseData(response.data);
        setEditedCase(response.data);
        setIsEditing(false);
        showSnackbar('Perubahan berhasil disimpan', 'success');
        
        await fetchCaseData();
      }
    } catch (error) {
      console.error('Error updating case:', error);
      showSnackbar('Gagal menyimpan perubahan', 'error');
    }
  };

  const handleCancel = () => {
    setEditedCase(caseData);
    setIsEditing(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedCase(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setOpenDeleteDialog(false);
      showSnackbar('Jadwal berhasil dihapus', 'success');
      setTimeout(() => {
        navigate(`/cases/${caseData.type}`);
      }, 1000);
    } catch (error) {
      console.error('Error deleting case:', error);
      setOpenDeleteDialog(false);
      showSnackbar(error.response?.data?.error || 'Gagal menghapus jadwal', 'error');
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleBack = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate(`/cases/${caseData.type}`);
    }
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
        <Box my={4}>
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/category" underline="hover" color="inherit">
              Kategori
            </Link>
            <Link component={RouterLink} to={`/cases/${caseData?.type}`} underline="hover" color="inherit">
              {caseData?.type}
            </Link>
            <Typography color="text.primary">Detail Kasus</Typography>
          </Breadcrumbs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              {caseData?.title}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Tanggal:</strong> {formatDate(caseData?.date)}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Deskripsi:</strong> {caseData?.description || '-'}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Pihak Terkait:</strong> {caseData?.parties || '-'}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Saksi:</strong> {caseData?.witnesses || '-'}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Jaksa:</strong> {caseData?.prosecutor || '-'}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Kategori:</strong> {caseData?.type}
              </Typography>
            </Box>

            <Grid item xs={12}>
              <Box 
                mt={2} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  position: 'relative',
                  bottom: 0,
                  right: 0
                }}
              >
                <Button 
                  startIcon={<EditIcon />} 
                  variant="contained" 
                  color="primary" 
                  onClick={handleEdit} 
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  startIcon={<DeleteIcon />} 
                  variant="contained" 
                  color="error" 
                  onClick={handleDelete}
                >
                  Hapus
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Konfirmasi Penghapusan"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus kasus ini? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={isEditing} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Kasus</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Judul Kasus"
            type="text"
            fullWidth
            value={editedCase.title || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="date"
            label="Tanggal"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={formatDateForInput(editedCase.date) || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Deskripsi"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editedCase.description || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="parties"
            label="Pihak Terkait"
            type="text"
            fullWidth
            value={editedCase.parties || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="witnesses"
            label="Saksi"
            type="text"
            fullWidth
            value={editedCase.witnesses || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="prosecutor"
            label="Jaksa"
            type="text"
            fullWidth
            value={editedCase.prosecutor || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            Batal
          </Button>
          <Button onClick={handleSave} color="primary" startIcon={<SaveIcon />}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ScheduleDetailPage;
