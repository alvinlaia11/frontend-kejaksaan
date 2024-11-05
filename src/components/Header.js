import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Badge,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Description as FileIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from './api';
import io from 'socket.io-client';
import { useUser } from '../contexts/UserContext';

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a237e',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  height: '70px'
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 320,
    marginTop: '8px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
  }
}));

function Header({ userRole, handleLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const { userAvatar, clearAvatar, updateAvatar } = useUser();
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (userRole !== 'admin') {
      fetchNotifications();

      const socket = io('http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socket.on('notification', (newNotification) => {
        setNotifications(prev => {
          const exists = prev.some(n => n.id === newNotification.id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userRole, fetchNotifications]);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const response = await api.get('/api/profile');
        if (response.data && response.data.avatar_url) {
          updateAvatar(response.data.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    if (!userAvatar) {
      loadAvatar();
    }
  }, [userAvatar, updateAvatar]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    clearAvatar();
    handleLogout();
    navigate('/login');
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      handleNotificationClose();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  const handleViewAllNotifications = () => {
    handleNotificationClose();
    setNotificationDialogOpen(true);
  };

  return (
    <>
      <StyledAppBar position="static">
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ fontSize: 28, marginRight: 1 }} />
            <Typography variant="h6" component="div">
              {userRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userRole === 'admin' ? (
              <Button 
                color="inherit" 
                onClick={() => handleNavigate('/admin')}
                startIcon={<DashboardIcon />}
                sx={{ 
                  borderRadius: '8px',
                  padding: '6px 16px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigate('/dashboard')}
                  startIcon={<DashboardIcon />}
                  sx={{ 
                    borderRadius: '8px',
                    padding: '6px 16px',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Dashboard
                </Button>
                <IconButton
                  color="inherit"
                  onClick={() => handleNavigate('/files')}
                >
                  <FileIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={handleNotificationMenu}
                >
                  <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </>
            )}

            <IconButton 
              onClick={handleMenu}
              size="small"
              sx={{ padding: 0 }}
            >
              <Avatar 
                src={userAvatar || '/default-avatar.png'}
                alt="Profile"
                sx={{ 
                  width: 40, 
                  height: 40,
                  cursor: 'pointer',
                  border: '2px solid white'
                }}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </IconButton>
          </Box>

          {/* Profile Menu */}
          <StyledMenu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userRole === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleNavigate(userRole === 'admin' ? "/admin/profile" : "/profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/files')}>
              <ListItemIcon>
                <FileIcon fontSize="small" />
              </ListItemIcon>
              Files
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/case-schedule')}>
              <ListItemIcon>
                <CalendarTodayIcon fontSize="small" />
              </ListItemIcon>
              Jadwal Kasus
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </StyledMenu>

          {/* Notifications Menu */}
          <StyledMenu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Notifications
              </Typography>
            </Box>
            <Divider />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: notification.is_read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)'
                    },
                    whiteSpace: 'normal', // Mengizinkan text wrap
                    padding: '12px 16px' // Menambah padding
                  }}
                >
                  <Box sx={{ width: '100%' }}> {/* Memastikan box mengambil full width */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: notification.is_read ? 'normal' : 'bold',
                        wordBreak: 'break-word', // Memastikan text bisa wrap
                        mb: 0.5 // Margin bottom untuk spacing
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block' }} // Memastikan timestamp di baris baru
                    >
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            ) : (
              <MenuItem onClick={handleNotificationClose}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', width: '100%' }}>
                  Tidak ada notifikasi
                </Typography>
              </MenuItem>
            )}
            {notifications.length > 0 && (
              <>
                <Divider />
                <MenuItem 
                  onClick={handleViewAllNotifications}
                  sx={{ justifyContent: 'center' }}
                >
                  <Typography 
                    color="primary" 
                    sx={{ 
                      width: '100%', 
                      textAlign: 'center',
                      py: 1
                    }}
                  >
                    Lihat Semua
                  </Typography>
                </MenuItem>
              </>
            )}
          </StyledMenu>
        </StyledToolbar>
      </StyledAppBar>

      {/* Dialog untuk Lihat Semua Notifikasi */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Semua Notifikasi
            </Typography>
            <IconButton onClick={() => setNotificationDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List sx={{ width: '100%' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      '&:hover': {
                        backgroundColor: notification.is_read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            mb: 1
                          }}
                        >
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      }
                    />
                    {!notification.is_read && (
                      <Button
                        size="small"
                        onClick={() => handleNotificationClick(notification.id)}
                        sx={{ ml: 2 }}
                      >
                        Tandai Dibaca
                      </Button>
                    )}
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 3 }}
              >
                Tidak ada notifikasi
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;
