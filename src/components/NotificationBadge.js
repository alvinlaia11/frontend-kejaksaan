import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

function NotificationIcon() {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Periksa notifikasi setiap kali komponen di-mount atau di-update
    checkNotifications();
    // Set interval untuk memeriksa notifikasi setiap menit
    const intervalId = setInterval(checkNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const checkNotifications = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allCategories = ['penyelidikan', 'penyidikan', 'penuntutan', 'esekusi'];
    let newNotifications = [];

    allCategories.forEach(category => {
      const cases = JSON.parse(localStorage.getItem(`cases_${category}`)) || [];
      const categoryNotifications = cases.filter(caseItem => {
        const caseDate = new Date(caseItem.date);
        return caseDate.toDateString() === tomorrow.toDateString();
      });
      newNotifications = [...newNotifications, ...categoryNotifications];
    });

    setNotifications(newNotifications);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <Typography variant="body2">
                Jadwal untuk "{notification.title}" ({notification.type}) pada tanggal {notification.date}. Jangan sampai terlewat!
              </Typography>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>
            <Typography variant="body2">Tidak ada notifikasi</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default NotificationIcon;