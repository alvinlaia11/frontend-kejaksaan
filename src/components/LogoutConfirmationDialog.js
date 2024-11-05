import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';

function LogoutConfirmationDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Konfirmasi Logout"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Apakah Anda yakin ingin keluar dari akun Anda?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Batal
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Ya, Keluar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LogoutConfirmationDialog;