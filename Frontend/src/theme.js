import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b2969', // Updated main color
    },
    secondary: {
      main: '#5F99CF', // Reddit blue
    },
    background: {
      // Reddit light gray
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
});

export default theme;