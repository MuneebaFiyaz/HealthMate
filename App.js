
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.title}>HealthMate</Text>
          </View>

          <View style={styles.profile}>
            <Text style={styles.profileText}>M</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Here's your daily health overview.
        </Text>

        {/* Daily Summary */}
        <Text style={styles.sectionTitle}>Today's Activity</Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>👟</Text>
            <Text style={styles.cardValue}>7,850</Text>
            <Text style={styles.cardLabel}>Steps</Text>
            <Text style={styles.cardGoal}>Goal: 10,000</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.cardValue}>420</Text>
            <Text style={styles.cardLabel}>Calories</Text>
            <Text style={styles.cardGoal}>kcal burned</Text>
          </View>
        </View>

        <View style={styles.waterCard}>
          <View>
            <Text style={styles.waterTitle}>💧 Water Intake</Text>
            <Text style={styles.waterValue}>2,000 ml</Text>
            <Text style={styles.cardGoal}>Daily goal: 2,500 ml</Text>
          </View>

          <View style={styles.waterProgress}>
            <View style={styles.waterProgressFill} />
          </View>
        </View>

        {/* Progress */}
        <Text style={styles.sectionTitle}>Daily Goals</Text>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalName}>Step Goal</Text>
            <Text style={styles.goalPercentage}>78.5%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: '78.5%' }]} />
          </View>

          <View style={styles.goalHeader}>
            <Text style={styles.goalName}>Water Goal</Text>
            <Text style={styles.goalPercentage}>80%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
        </View>

        {/* Quick Action */}
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Keep track of your day</Text>
          <Text style={styles.quickDescription}>
            Add your daily health records and monitor your progress.
          </Text>
          <Text style={styles.quickAction}>+ Add Health Record</Text>
        </View>

      </ScrollView>

      {/* Bottom Navigation Preview */}
      <View style={styles.bottomNav}>
        <Text style={styles.activeNav}>⌂{"\n"}Home</Text>
        <Text style={styles.navItem}>＋{"\n"}Add</Text>
        <Text style={styles.navItem}>▤{"\n"}History</Text>
        <Text style={styles.navItem}>⚙{"\n"}Settings</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 55,
  },

  greeting: {
    fontSize: 15,
    color: '#718096',
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183B65',
    marginTop: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginHorizontal: 22,
    marginTop: 12,
    marginBottom: 25,
  },

  profile: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#2878D0',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#183B65',
    marginHorizontal: 22,
    marginBottom: 14,
  },

  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 15,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    elevation: 2,
  },

  cardIcon: {
    fontSize: 25,
    marginBottom: 12,
  },

  cardValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#183B65',
  },

  cardLabel: {
    fontSize: 14,
    color: '#52677F',
    marginTop: 4,
  },

  cardGoal: {
    fontSize: 12,
    color: '#8A9AAF',
    marginTop: 7,
  },

  waterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 25,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },

  waterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#183B65',
  },

  waterValue: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2878D0',
    marginTop: 10,
  },

  waterProgress: {
    height: 9,
    backgroundColor: '#E5EFFB',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },

  waterProgressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#3998E8',
    borderRadius: 10,
  },

  goalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    marginBottom: 25,
    elevation: 2,
  },

  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 5,
  },

  goalName: {
    fontSize: 14,
    color: '#52677F',
  },

  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2878D0',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#E5EFFB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 17,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#3998E8',
    borderRadius: 10,
  },

  quickCard: {
    backgroundColor: '#E5F1FF',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  quickTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#183B65',
  },

  quickDescription: {
    fontSize: 13,
    color: '#52677F',
    lineHeight: 20,
    marginTop: 8,
  },

  quickAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2878D0',
    marginTop: 15,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF6',
  },

  activeNav: {
    textAlign: 'center',
    color: '#2878D0',
    fontSize: 13,
    fontWeight: 'bold',
  },

  navItem: {
    textAlign: 'center',
    color: '#8A9AAF',
    fontSize: 13,
  },
});
