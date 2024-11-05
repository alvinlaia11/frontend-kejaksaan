import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  IconButton,
  Button,
  TextField,
  Breadcrumbs,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  Tooltip,
  LinearProgress,
  styled,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  CloudUpload as UploadIcon,
  CreateNewFolder as CreateFolderIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import api from './api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
}));

const ItemPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid #e0e0e0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }
}));

// Perbaiki fungsi truncateFileName
const truncateFileName = (fileName) => {
  if (!fileName) return '';
  
  const maxLength = 10;
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
  
  if (nameWithoutExt.length <= maxLength) {
    return fileName;
  }
  
  return `${nameWithoutExt.slice(0, maxLength)}...${extension}`;
};

// Perbaiki fungsi getValidImageUrl
const getValidImageUrl = (url) => {
  if (!url) return null;
  
  // Jika URL sudah lengkap, gunakan langsung
  if (url.startsWith('http')) {
    return url;
  }

  // Jika tidak, gabungkan dengan URL Supabase dan bucket
  const supabaseUrl = 'https://emkbntymauejuvergprx.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/files/${url}`;
};

// Tambahkan fungsi untuk mendapatkan URL preview Google Docs
const getGoogleDocsViewerUrl = (fileUrl) => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
};

// Perbaiki komponen FileMenu
const FileMenu = ({ anchorEl, onClose, item, onDownload, onDelete }) => {
  const isFolder = item?.type === 'folder';
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      {/* Menu Download khusus untuk file */}
      {!isFolder && (
        <MenuItem onClick={() => {
          onDownload(item);
          onClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Unduh
        </MenuItem>
      )}

      {/* Menu Hapus untuk folder dan file */}
      <MenuItem onClick={() => {
        onDelete();
        onClose();
      }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        Hapus
      </MenuItem>
    </Menu>
  );
};

// Fungsi helper untuk mendapatkan icon dan preview berdasarkan file type
const getFileTypeInfo = (fileType) => {
  if (fileType?.startsWith('image/')) {
    return {
      icon: <ImageIcon sx={{ color: '#2196F3' }} />,
      previewType: 'image'
    };
  } else if (fileType === 'application/pdf') {
    return {
      icon: <PictureAsPdfIcon sx={{ color: '#f44336' }} />,
      previewType: 'pdf'
    };
  } else if (
    fileType === 'application/msword' || 
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return {
      icon: <DescriptionIcon sx={{ color: '#4CAF50' }} />,
      previewType: 'word'
    };
  }
  return {
    icon: <InsertDriveFileIcon sx={{ color: '#757575' }} />,
    previewType: 'other'
  };
};

function Files() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchFilesAndFolders();
  }, [currentPath]);

  const fetchFilesAndFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const pathQuery = currentPath.join('/');
      console.log('Fetching path:', pathQuery);
      
      const response = await api.get('/api/files', {
        params: { path: pathQuery }
      });

      if (response.data.success) {
        // Transform data jika diperlukan
        const files = response.data.data.files.map(file => ({
          ...file,
          type: 'file'
        }));
        
        const folders = response.data.data.folders.map(folder => ({
          ...folder,
          type: 'folder'
        }));

        setFiles(files);
        setFolders(folders);
      } else {
        throw new Error(response.data.error || 'Gagal mengambil data');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Tambahkan path jika berada dalam folder
      if (currentPath.length > 0) {
        formData.append('path', currentPath.join('/'));
      }

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        path: currentPath.join('/')
      });

      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        setSuccessMessage('File berhasil diupload');
        await fetchFilesAndFolders();
      } else {
        throw new Error(response.data.error || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Gagal mengupload file');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Nama folder tidak boleh kosong');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/files/folders', {
        name: newFolderName.trim(),
        path: currentPath.join('/')
      });

      if (response.data.success) {
        setNewFolderName('');
        setOpenNewFolderDialog(false);
        setSuccessMessage('Folder berhasil dibuat');
        await fetchFilesAndFolders();
      } else {
        throw new Error(response.data.error || 'Gagal membuat folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Modifikasi fungsi handleItemClick
  const handleItemClick = (item, isFolder) => {
    if (isFolder) {
      setCurrentPath([...currentPath, item.name]);
    } else {
      const fileInfo = getFileTypeInfo(item.file_type);
      
      if (fileInfo.previewType === 'image') {
        // Untuk gambar tetap gunakan preview dialog
        setPreviewFile({
          ...item,
          url: item.url,
          type: 'image'
        });
        setPreviewOpen(true);
      } else if (fileInfo.previewType === 'pdf' || fileInfo.previewType === 'word') {
        // Untuk PDF dan Word, buka di tab baru menggunakan Google Docs Viewer
        const viewerUrl = fileInfo.previewType === 'pdf' 
          ? `https://docs.google.com/viewer?url=${encodeURIComponent(item.url)}&embedded=false` 
          : `https://docs.google.com/viewer?url=${encodeURIComponent(item.url)}&embedded=false`;
        
        window.open(viewerUrl, '_blank');
      } else {
        handleDownload(item);
      }
    }
  };

  const handleBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const handleMenuOpen = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDeleteClick = () => {
    setAnchorEl(null); // Tutup menu
    setItemToDelete(selectedItem);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedItem) {
        throw new Error('Item tidak ditemukan');
      }

      const endpoint = selectedItem.type === 'folder' ? 'folders' : 'files';
      console.log('Menghapus:', { 
        type: selectedItem.type,
        id: selectedItem.id,
        name: selectedItem.name 
      });
      
      const response = await api.delete(`/api/files/${endpoint}/${selectedItem.id}`);
      
      if (response.data.success) {
        setDeleteConfirmOpen(false);
        setSuccessMessage(`${selectedItem.type === 'folder' ? 'Folder' : 'File'} berhasil dihapus`);
        setSelectedItem(null);
        await fetchFilesAndFolders();
      } else {
        throw new Error(response.data.error || 'Gagal menghapus item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.error || error.message || 'Gagal menghapus item');
    } finally {
      setDeleteConfirmOpen(false);
      setAnchorEl(null);
    }
  };

  // Perbaiki fungsi handleDownload
  const handleDownload = async (file) => {
    try {
      if (!file?.url) {
        throw new Error('URL file tidak ditemukan');
      }

      // Log untuk debugging
      console.log('Downloading file:', file);
      console.log('File URL:', file.url);

      window.open(file.url, '_blank');
      
    } catch (error) {
      console.error('Download error:', error);
      setError('Gagal mengunduh file');
    }
  };

  const filteredItems = [...folders, ...files].filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          My Files
        </Typography>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Button
            startIcon={<FolderIcon />}
            onClick={() => setCurrentPath([])}
            sx={{ textTransform: 'none' }}
          >
            Root
          </Button>
          {currentPath.map((folder, index) => (
            <Button
              key={folder}
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
              sx={{ textTransform: 'none' }}
            >
              {folder}
            </Button>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Actions */}
      <StyledPaper sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<CreateFolderIcon />}
                onClick={() => setOpenNewFolderDialog(true)}
              >
                New Folder
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                component="label"
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Grid>
        </Grid>
        {uploadProgress > 0 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </StyledPaper>

      {/* Content */}
      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={2}>
          {filteredItems.map((item) => {
            const isFolder = 'type' in item && item.type === 'folder';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <ItemPaper>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => handleItemClick(item, isFolder)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {isFolder ? (
                        <FolderIcon sx={{ color: '#FFC107' }} />
                      ) : (
                        <FileIcon sx={{ color: '#2196F3' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}
                        title={item.name} // untuk tooltip nama lengkap
                      >
                        {isFolder ? item.name : truncateFileName(item.name)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, item);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ItemPaper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Context Menu */}
      <FileMenu
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        item={selectedItem}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      {/* New Folder Dialog */}
      <Dialog
        open={openNewFolderDialog}
        onClose={() => setOpenNewFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {previewFile?.name}
            </Typography>
            <Box>
              <IconButton 
                onClick={() => handleDownload(previewFile)}
                title="Download"
              >
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={() => setPreviewOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            {previewFile?.url && previewFile?.type === 'image' && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
            {previewFile?.url && (previewFile?.type === 'pdf' || previewFile?.type === 'word') && (
              <iframe
                src={previewFile.type === 'pdf' ? 
                  getGoogleDocsViewerUrl(previewFile.url) : 
                  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`
                }
                width="100%"
                height="600px"
                frameBorder="0"
                style={{ border: 'none' }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi delete */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Anda yakin ingin menghapus file ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="primary"
          >
            Batal
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk notifikasi sukses */}
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={2000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          File {itemToDelete?.name} telah dihapus
        </Alert>
      </Snackbar>

      {/* Snackbar untuk success message */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Snackbar untuk error (yang sudah ada) */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={2000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Files;
