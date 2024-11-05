import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        py: 2, 
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()}{' '}
        <Link color="inherit" href="https://kejaksaan.go.id/" underline="hover">
         Tindak Pidana Khusus
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer;