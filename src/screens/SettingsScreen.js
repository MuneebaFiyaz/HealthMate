
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

      {/* Dark mode setting */}
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

      {/* About HealthMate */}
      <View style={styles.infoCard}>
        <View style={styles.aboutHeader}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>H</Text>
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.infoTitle}>About HealthMate</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        <Text style={styles.infoDescription}>
          HealthMate is a personal health and wellness tracker
          designed to help you record your daily activities,
          monitor your progress and manage your health records
          in one place.
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
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appInfo: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.text,
  },
  version: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: theme.secondaryText,
    lineHeight: 21,
  },
});
