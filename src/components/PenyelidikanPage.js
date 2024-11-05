import React from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function PenyelidikanPage() {
  const categories = [
    { title: 'Penyelidikan', path: '/cases/penyelidikan' },
    { title: 'Penyidikan', path: '/cases/penyidikan' },
    { title: 'Penuntutan', path: '/cases/penuntutan' },
    { title: 'Eksekusi', path: '/cases/eksekusi' }
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Kategori Kasus</Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.title}>
            <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
              <Typography variant="h6" gutterBottom>{category.title}</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to={category.path}
              >
                Lihat Kasus
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default PenyelidikanPage;