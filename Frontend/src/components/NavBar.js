import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container
} from '@mui/material';
import { Link } from 'react-router-dom';

const colors = {
  primary: '#3b2969',
  secondary: '#6d5b98',
  accent: '#ff6b6b',
  text: '#2E2E48',
  lightText: '#6B7280'
};

function NavBar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        py: 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <img
              src="/logiya.png"
              alt="شعار"
              style={{
                width: '90px',
                height: '80px',
                marginRight: '12px',
                borderRadius: '50%'
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: colors.text,
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                display: { xs: 'none', md: 'block' },
                fontFamily: 'Tajawal'
              }}
            >
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Button
              component={Link}
              to="/analyze"
              sx={{
                color: colors.text,
                fontWeight: 500,
                fontSize: '0.9rem',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '24px',
                fontFamily: 'Tajawal',
                '&:hover': {
                  color: colors.primary,
                  backgroundColor: 'rgba(59, 41, 105, 0.05)'
                }
              }}
            >
              المحلل
            </Button>
            
            <Button
              component={Link}
              to="/dashboard"
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: '0.9rem',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '24px',
                backgroundColor: colors.primary,
                fontFamily: 'Tajawal',
                '&:hover': {
                  backgroundColor: '#2a1d4f',
                  boxShadow: '0 4px 12px rgba(59, 41, 105, 0.2)'
                }
              }}
            >
              لوحة التحكم
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;