import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  styled
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import api from './api';

// Styled components
const InfoBoard = styled(Box)(({ theme }) => ({
  backgroundColor: '#1a237e',
  minHeight: '100vh',
  padding: theme.spacing(3),
  color: 'white'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(2),
  overflow: 'hidden'
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  textAlign: 'center'
}));

const CurrentTime = styled(Typography)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(3),
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2)
}));

const StyledTableContainer = styled(TableContainer)({
  maxHeight: 'calc(100vh - 250px)',
  '& .MuiTableCell-root': {
    fontSize: '1.1rem',
    padding: '16px'
  }
});

function CaseSchedule() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchCases();
    // Auto refresh setiap 5 menit
    const intervalId = setInterval(fetchCases, 300000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Update waktu setiap detik
    const timeId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeId);
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases');
      if (response.data) {
        // Urutkan kasus berdasarkan tanggal
        const sortedCases = response.data.sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        setCases(sortedCases);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Gagal memuat data jadwal kasus');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (date) => {
    const today = new Date();
    const caseDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    caseDate.setHours(0, 0, 0, 0);

    if (caseDate < today) return 'error';
    if (caseDate.getTime() === today.getTime()) return 'warning';
    return 'success';
  };

  const getStatusText = (date) => {
    const today = new Date();
    const caseDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    caseDate.setHours(0, 0, 0, 0);

    if (caseDate < today) return 'Selesai';
    if (caseDate.getTime() === today.getTime()) return 'Hari Ini';
    return 'Mendatang';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <InfoBoard>
      <CurrentTime variant="h6">
        <ClockIcon />
        {currentTime.toLocaleTimeString('id-ID')}
      </CurrentTime>

      <HeaderSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <CalendarIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Jadwal Sidang Tindak Pidana Khusus
          </Typography>
        </Box>
        <Typography variant="h6">
          {currentTime.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </HeaderSection>

      <StyledPaper elevation={3}>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Judul Kasus</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Tipe</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((caseItem, index) => (
                <TableRow 
                  key={caseItem.id}
                  sx={{
                    backgroundColor: getStatusText(caseItem.date) === 'Hari Ini' ? 'rgba(255, 244, 229, 0.9)' : 'white'
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{formatDate(caseItem.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {caseItem.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={caseItem.type}
                      color="primary"
                      variant="outlined"
                      size="medium"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(caseItem.date)}
                      color={getStatusColor(caseItem.date)}
                      size="medium"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledPaper>

      <Typography 
        variant="body2" 
        align="center" 
        sx={{ 
          mt: 2, 
          color: 'rgba(255, 255, 255, 0.7)',
          position: 'fixed',
          bottom: 16,
          left: 0,
          right: 0
        }}
      >
        © 2024 Kejaksaan Negeri - Sistem Informasi Jadwal Sidang
      </Typography>
    </InfoBoard>
  );
}

export default CaseSchedule;