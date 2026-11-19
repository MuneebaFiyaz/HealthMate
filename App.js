
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { initializeDatabase } from './src/database/database';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppNavigation() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SQLiteProvider
      databaseName="healthmate.db"
      onInit={initializeDatabase}
    >
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
