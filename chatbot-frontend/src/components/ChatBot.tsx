import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';

const DRAWER_WIDTH = 320;

export const ChatBot: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    messages,
    session,
    sessions,
    loading,
    error,
    initializeSession,
    sendMessage,
    loadSession,
    clearError,
    deleteSession,
  } = useChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleNewChat = async () => {
    await initializeSession();
    if (isMobile) {
      setMobileOpen(false);
    }
    showSnackbar('New chat started');
  };

  const handleSelectSession = async (sessionId: number) => {
    await loadSession(sessionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDeleteClick = (sessionId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await deleteSession(sessionToDelete);
        showSnackbar('Chat deleted successfully');
        
        // If the deleted session was the current one, create a new session
        if (session?.id === sessionToDelete) {
          await initializeSession();
        }
      } catch (error) {
        showSnackbar('Failed to delete chat');
      }
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (session: any) => {
    const firstUserMessage = session.messages?.find((m: any) => m.message_type === 'user');
    return firstUserMessage?.content || 'New Chat';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="sidebar">
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }} className="sidebar-header">
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          disabled={loading}
          sx={{ mb: 1 }}
          className="new-chat-button"
        >
          New Chat
        </Button>
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'white' }}>
          Conversation History
        </Typography>
      </Box>

      {/* Sessions List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ p: 1 }}>
          {sessions.map((sess) => (
            <ListItem key={sess.id} disablePadding sx={{ mb: 0.5 }} className="session-item">
              <ListItemButton
                selected={session?.id === sess.id}
                onClick={() => handleSelectSession(sess.id)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
                className={session?.id === sess.id ? 'selected' : ''}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ChatIcon 
                    fontSize="small" 
                    sx={{ 
                      color: session?.id === sess.id ? 'white' : 'inherit' 
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap className="session-preview">
                      {getSessionPreview(sess)}
                    </Typography>
                  }
                  secondary={formatDate(sess.updated_at)}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    className: 'session-date',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDeleteClick(sess.id, e)}
                    className="delete-button"
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }} className="chatbot-root">
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isMobile ? mobileOpen : desktopOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        className="sidebar"
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isMobile ? 0 : desktopOpen ? 0 : `-${DRAWER_WIDTH}px`,
        }}
        className="main-content"
      >
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={1}
          className="app-bar"
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              className="menu-button"
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} className="app-title">
              Adaptive AI Assistant
            </Typography>
            
            {session && (
              <Chip 
                label={`Active Chat`} 
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
                className="active-session-chip"
              />
            )}
            
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleNewChat}
              disabled={loading}
              className="new-chat-button"
            >
              New Chat
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            py: 2,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              onClose={clearError} 
              sx={{ mb: 2 }} 
              className="error-alert"
            >
              {error}
            </Alert>
          )}

          {/* Messages Area */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              p: 2,
              mb: 2,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 200px)',
              minHeight: '400px',
            }}
            className="messages-container"
          >
            {messages.length === 0 && !loading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2,
                }}
                className="empty-state"
              >
                <ChatIcon sx={{ fontSize: 64, opacity: 0.5 }} className="empty-state-icon" />
                <Typography variant="h6" align="center">
                  Welcome to your AI Assistant!
                </Typography>
                <Typography variant="body2" align="center">
                  Start a new conversation or select one from your history.
                </Typography>
              </Box>
            ) : (
              messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))
            )}
            {loading && messages.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                  }}
                  className="loading-bubble"
                >
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Paper>

          {/* Input Area */}
          <Paper
            component="form"
            onSubmit={handleSendMessage}
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'flex-end',
              borderRadius: 2,
            }}
            className="input-container"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={loading || !session}
              multiline
              maxRows={4}
              className="message-input"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!inputMessage.trim() || loading || !session}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ 
                minWidth: '100px', 
                height: '56px',
              }}
              className="send-button"
            >
              {loading ? 'Sending' : 'Send'}
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Chat?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this chat? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};