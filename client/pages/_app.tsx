import '../styles/globals.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import { CssBaseline } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3c8c30',
    },
    secondary: {
      main: '#e2395e',
    },
    background: {
      default: '#fafafa'
    }
  }
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3c8c30',
    },
    secondary: {
      main: '#e2395e',
    },
  }
})

function App({ Component, pageProps }: AppProps) {
  const [activeTheme, setActiveTheme] = useState(lightTheme);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');

  function getActiveTheme(themeMode: 'light' | 'dark') {
    return themeMode === 'light' ? lightTheme : darkTheme;
  }

  const toggleTheme: React.MouseEventHandler<HTMLButtonElement> = () => {
    const desiredTheme = selectedTheme === 'light' ? 'dark' : 'light';

    setSelectedTheme(desiredTheme);
  };

  useEffect(() => {
    setActiveTheme(getActiveTheme(selectedTheme))
  }, [selectedTheme]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Component {...pageProps} toggleTheme={toggleTheme} />
    </ThemeProvider>
  )
}

export default App;