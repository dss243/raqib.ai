import React from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const redditTheme = createTheme({
  palette: {
    primary: {
      main: '#FF4500', // Reddit orange
    },
    secondary: {
      main: '#FFFFFF', // White for contrast
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    body2: {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#333',
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 0',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 69, 0, 0.1)', // Light orange on hover
          },
        },
      },
    },
  },
});

const UserProfileMenu = ({ user ,onLogout}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleLogout = () => {
  //   // Clear token and user data from localStorage
  //   localStorage.removeItem('reddit_token');
  //   localStorage.removeItem('reddit_user');
  
  //   // Redirect to the login page
  //   window.location.href = '/login';
  // };

  return (
    <ThemeProvider theme={redditTheme}>
      <IconButton
        onClick={handleClick}
        sx={{
          p: 0,
          '&:hover': {
            backgroundColor: 'transparent', 
          },
        }}
      >
        {/* User Avatar */}
        <Avatar
          alt={user.name}
          src={user.avatar}
          sx={{
            width: 70,
            height: 70,
            border: '2px solid #3b2969', // Reddit orange border
            transition: 'border-color 0.3s ease',
            '&:hover': {
              borderColor: '#E63900', // Darker orange on hover
            },
          }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.12))', // Subtle shadow
            mt: 1.5,
            borderRadius: '12px', // Rounded corners
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Signed-in User Info */}
        <MenuItem
          sx={{
            pointerEvents: 'none', // Disable interaction
            cursor: 'default',
            borderRadius: '8px',
          }}
        >
          <Typography variant="body2" color="text.primary">
            Signed in as{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: '#FF4500' }}
            >
              {user.name}
            </Typography>
          </Typography>
        </MenuItem>
        <Divider sx={{ borderColor: '#eee', my: 1 }} />

        {/* Logout Option */}
        <MenuItem onClick={onLogout}>
          <Logout fontSize="small" sx={{ mr: 1, color: '#FF4500' }} />
          <Typography variant="body2" color="text.primary">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </ThemeProvider>
  );
};

export default UserProfileMenu;