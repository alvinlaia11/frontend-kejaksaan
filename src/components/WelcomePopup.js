import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CelebrationIcon from '@mui/icons-material/Celebration';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: theme.spacing(3),
    maxWidth: 400,
  },
}));

const WelcomePopup = ({ open, onClose, username }) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <CelebrationIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Selamat Datang, {username}!
          </Typography>
          <Typography variant="body1" paragraph>
            Kami senang Anda bergabung dengan kami. Siap untuk mengelola jadwal kasus Anda?
          </Typography>
          <Button variant="contained" color="primary" onClick={onClose} sx={{ mt: 2 }}>
            Mulai Sekarang
          </Button>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default WelcomePopup;