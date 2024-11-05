import React, { useState } from 'react';
import {
  Container, 
  Typography, 
  Paper, 
  Button, 
  Box,
  Divider,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

function AdminProfile() {
  const [adminName, setAdminName] = useState(localStorage.getItem('username') || 'Admin');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(adminName);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setAdminName(editedName);
    localStorage.setItem('username', editedName);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedName(adminName);
    setIsEditing(false);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profil Admin
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          {isEditing ? (
            <TextField
              fullWidth
              label="Nama"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="h6">Nama: {adminName}</Typography>
          )}
          <Typography variant="body1">Peran: Admin</Typography>
        </Box>
        {isEditing ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              sx={{ mr: 1 }}
            >
              Simpan
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={handleCancelClick}
            >
              Batal
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Profil
          </Button>
        )}
      </Paper>
    </Container>
  );
}

export default AdminProfile;