import React from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Container, 
  CssBaseline, 
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Slide
} from '@mui/material';
import RedditIcon from '@mui/icons-material/Reddit';
import { styled, keyframes } from '@mui/system';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  borderRadius: '20px',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  backgroundColor: '#3b2969', // Updated to deep purple
  color: 'white',
  '&:hover': {
    backgroundColor: '#2a1d4d', // Darker shade for hover
    animation: `${pulse} 1s ease infinite`
  },
  transition: 'all 0.3s ease',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  width: theme.spacing(7),
  height: theme.spacing(7),
  backgroundColor: '#3b2969', // Updated to deep purple
  boxShadow: theme.shadows[4],
}));

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleRedditLogin = (e) => {

    localStorage.removeItem('logout');
    localStorage.setItem('logout', 'false');
    e.preventDefault();
    const authWindow = window.open('http://localhost:8000/login/reddit', '_self');
    if (!authWindow) {
      console.log('Popup blocked');
      alert('Popup blocked! Please allow popups for this site.');
    }
    
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Slide in={true} direction="up" timeout={500}>
        <Box>
          <Fade in={true} timeout={800}>
            <StyledPaper elevation={6}>
              <StyledAvatar>
                <RedditIcon fontSize="large" />
              </StyledAvatar>
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  mt: 2, 
                  mb: 1,
                  fontWeight: 'bold',
                  color: theme.palette.text.primary
                }}
              >
                Welcome to Reddit App
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                align="center" 
                sx={{ mb: 3 }}
              >
                Sign in with your Reddit account to access all features
              </Typography>
              <StyledButton
                fullWidth
                onClick={handleRedditLogin}
                startIcon={<RedditIcon />}
                size={isMobile ? 'medium' : 'large'}
              >
                Continue with Reddit
              </StyledButton>
              <Typography 
                variant="caption" 
                color="textSecondary" 
                align="center" 
                sx={{ mt: 3 }}
              >
                By continuing, you agree to our Terms and Privacy Policy
              </Typography>
            </StyledPaper>
          </Fade>
        </Box>
      </Slide>
    </Container>
  );
};

export default Login;