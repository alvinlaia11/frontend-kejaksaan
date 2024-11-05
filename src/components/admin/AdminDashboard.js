import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  People as PeopleIcon, 
  BarChart as BarChartIcon, 
  Settings as SettingsIcon,
  Add as AddIcon
} from '@mui/icons-material';

function AdminDashboard() {
  const navigate = useNavigate();
  const dashboardItems = [
    { title: 'Manajemen Pengguna', icon: <PeopleIcon fontSize="large" />, description: 'Kelola akun pengguna sistem', link: '/admin/users' },
    { title: 'Statistik Sistem', icon: <BarChartIcon fontSize="large" />, description: 'Lihat statistik penggunaan sistem', link: '/admin/stats' },
    { title: 'Pengaturan Sistem', icon: <SettingsIcon fontSize="large" />, description: 'Konfigurasi pengaturan sistem', link: '/admin/settings' },
  ];

  const handleAddUser = () => {
    navigate('/admin/users', { state: { openAddDialog: true } });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" sx={{ mb: 4 }}>Dashboard Admin</Typography>
        <Grid container spacing={4}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="div" align="center">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button variant="contained" component={RouterLink} to={item.link}>
                    Akses
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box mt={4}>
        <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Aksi Cepat</Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{ mr: 2 }}
          >
            Tambah Pengguna Baru
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDashboard;