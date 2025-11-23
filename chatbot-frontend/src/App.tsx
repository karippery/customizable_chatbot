import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ChatBot } from './components/ChatBot';
import './App.css'; // Import the CSS file

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#98c5f3ff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        },
        '#root': {
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatBot />
    </ThemeProvider>
  );
}

export default App;