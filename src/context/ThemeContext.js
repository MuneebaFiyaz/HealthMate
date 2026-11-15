
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

// Colours used by the light and dark themes.
const lightTheme = {
  background: '#F5F9FF',
  card: '#FFFFFF',
  text: '#183B65',
  secondaryText: '#718096',
  primary: '#2878D0',
  border: '#E5EFFB',
  input: '#F5F9FF',
  tabBar: '#FFFFFF',
};

const darkTheme = {
  background: '#101C2D',
  card: '#1B2B40',
  text: '#F1F5F9',
  secondaryText: '#A5B4C7',
  primary: '#55A5F5',
  border: '#30445D',
  input: '#24364D',
  tabBar: '#1B2B40',
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, setIsDarkMode, theme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// This hook lets other screens access the selected theme.
export function useTheme() {
  return useContext(ThemeContext);
}
