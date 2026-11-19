
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

// Light theme
const lightTheme = {
  background: '#F5F7F2',
  card: '#FFFFFF',
  text: '#20483D',
  secondaryText: '#718078',
  primary: '#21664F',
  primaryButton: '#21664F',
  primarySoft: '#E8F0E5',
  water: '#278BCB',
  waterSoft: '#E8F4FA',
  calories: '#D94D56',
  caloriesSoft: '#FCEBED',
  success: '#26966D',
  successSoft: '#E5F5EC',
  warning: '#B7791F',
  warningButton: '#8A5707',
  warningSoft: '#FFF4DD',
  danger: '#D9534F',
  dangerButton: '#B73331',
  dangerSoft: '#FCEBED',
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
  primaryButton: '#287D70',
  primarySoft: '#293B36',
  water: '#65B5E5',
  waterSoft: '#23323D',
  calories: '#F08B91',
  caloriesSoft: '#382629',
  success: '#71CC9D',
  successSoft: '#203B31',
  warning: '#F0BC65',
  warningButton: '#7A570F',
  warningSoft: '#403522',
  danger: '#F17A75',
  dangerButton: '#A82F35',
  dangerSoft: '#402629',
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
