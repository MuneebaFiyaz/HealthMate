
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';

import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { initializeDatabase } from './src/database/database';

export default function App() {
  return (
    <SQLiteProvider
      databaseName="healthmate.db"
      onInit={initializeDatabase}
    >
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SQLiteProvider>
  );
}
