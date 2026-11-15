
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage your app preferences here.
      </Text>

      <View style={styles.settingCard}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Text style={styles.settingDescription}>
            Change the appearance of HealthMate.
          </Text>
        </View>

        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{
            false: '#CBD5E1',
            true: theme.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About HealthMate</Text>
        <Text style={styles.infoDescription}>
          HealthMate helps you record and manage your daily
          steps, calories burned and water intake.
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
    paddingTop: 55,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    marginTop: 8,
    marginBottom: 25,
  },
  settingCard: {
    backgroundColor: theme.card,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: theme.card,
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: theme.secondaryText,
    lineHeight: 21,
  },
});
