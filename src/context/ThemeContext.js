
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

// Light theme
const lightTheme = {
  background: '#F5F7F2',
  card: '#FFFFFF',
  text: '#20483D',
  secondaryText: '#718078',
  primary: '#21664F',
  border: '#E2E9DF',
  input: '#EDF2E9',
  tabBar: '#FFFFFF',
};

// Dark theme
const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  secondaryText: '#B0B0B0',
  primary: '#80CBC4',
  border: '#333333',
  input: '#292929',
  tabBar: '#1E1E1E',
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
