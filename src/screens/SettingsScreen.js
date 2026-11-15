
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Screen heading */}
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage your HealthMate preferences.
      </Text>

      {/* Appearance section */}
      <Text style={styles.sectionTitle}>Appearance</Text>

      <View style={styles.settingCard}>
        <View style={styles.settingInfo}>
          <View style={styles.settingIcon}>
            <Ionicons
              name="moon-outline"
              size={21}
              color={theme.primary}
            />
          </View>

          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Change the appearance of HealthMate.
            </Text>
          </View>
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

      {/* About section */}
      <Text style={styles.sectionTitle}>About</Text>

      <View style={styles.infoCard}>
        <View style={styles.aboutHeader}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>H</Text>
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.infoTitle}>HealthMate</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.infoDescription}>
          HealthMate is a personal health and wellness tracker
          designed to help you record your daily activities,
          monitor your progress and manage your health records
          in one place.
        </Text>
      </View>

      {/* App information */}
      <View style={styles.footer}>
        <Ionicons
          name="heart-outline"
          size={15}
          color={theme.secondaryText}
        />
        <Text style={styles.footerText}>
          HealthMate - Your daily wellness companion
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 35,
    paddingBottom: 30,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 6,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: isDarkMode ? 0 : 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#293B36' : '#E8F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: theme.card,
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: isDarkMode ? 0 : 2,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  appIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appInfo: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  version: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 16,
  },
  infoDescription: {
    fontSize: 13,
    color: theme.secondaryText,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 11,
    color: theme.secondaryText,
    marginLeft: 6,
  },
});
