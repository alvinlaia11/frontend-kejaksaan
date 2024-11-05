import React from 'react';
import { Container, Typography, Grid, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search, Assessment, Gavel, Balance } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function CategoryPage() {
  const navigate = useNavigate();

  const categories = [
    { 
      title: 'Penyelidikan', 
      path: '/cases/penyelidikan', // pastikan sesuai dengan route di AppContent
      icon: <Search />, 
      bgColor: '#4caf50' 
    },
    { 
      title: 'Penyidikan', 
      path: '/cases/penyidikan',    // tambah forward slash
      icon: <Assessment />, 
      bgColor: '#2196f3' 
    },
    { 
      title: 'Penuntutan', 
      path: '/cases/penuntutan',    // tambah forward slash
      icon: <Gavel />, 
      bgColor: '#ff9800' 
    },
    { 
      title: 'Eksekusi', 
      path: '/cases/eksekusi',      // tambah forward slash
      icon: <Balance />, 
      bgColor: '#f44336' 
    }
  ];

  const handleViewDetail = (path) => {
    console.log('Navigating to:', path);
    // Tambah validasi path
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    navigate(path);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="lg">
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBackToDashboard}
        style={{ marginBottom: '20px', marginTop: '20px' }}
      >
        Kembali ke Dashboard
      </Button>
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Semua Kategori Kasus
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={3} 
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: category.bgColor,
                color: 'white',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {React.cloneElement(category.icon, { sx: { fontSize: 60 } })}
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                {category.title}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => handleViewDetail(category.path)}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                Lihat Detail
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CategoryPage;
