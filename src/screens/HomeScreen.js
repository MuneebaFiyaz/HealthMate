
import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

import { getHealthRecords } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const STEP_GOAL = 10000;
const WATER_GOAL = 2500;

export default function HomeScreen() {
  const database = useSQLiteContext();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [todayData, setTodayData] = useState({
    steps: 0,
    calories: 0,
    water: 0,
  });

  // Load today's records whenever the Home screen is opened.
  useFocusEffect(
    useCallback(() => {
      async function loadTodayData() {
        try {
          const records = await getHealthRecords(database);

          const today = new Date();
          const todayDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0'),
          ].join('-');

          const todaysRecords = records.filter(
            record => record.date === todayDate
          );

          // Add together all records saved for today.
          const totals = todaysRecords.reduce(
            (result, record) => ({
              steps: result.steps + record.steps,
              calories: result.calories + record.calories,
              water: result.water + record.water,
            }),
            { steps: 0, calories: 0, water: 0 }
          );

          setTodayData(totals);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      }

      loadTodayData();
    }, [database])
  );

  // Calculate progress towards the daily goals.
  const stepPercentage = Math.min(
    (todayData.steps / STEP_GOAL) * 100,
    100
  );

  const waterPercentage = Math.min(
    (todayData.water / WATER_GOAL) * 100,
    100
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
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
            <Ionicons
              name="footsteps"
              size={25}
              color="#2878D0"
              style={styles.cardIcon}
            />
            <Text style={styles.cardValue}>
              {todayData.steps.toLocaleString()}
            </Text>
            <Text style={styles.cardLabel}>Steps</Text>
            <Text style={styles.cardGoal}>Goal: 10,000</Text>
          </View>

          <View style={styles.card}>
            <Ionicons
              name="flame"
              size={25}
              color="#E58A45"
              style={styles.cardIcon}
            />
            <Text style={styles.cardValue}>
              {todayData.calories.toLocaleString()}
            </Text>
            <Text style={styles.cardLabel}>Calories</Text>
            <Text style={styles.cardGoal}>kcal burned</Text>
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.waterCard}>
          <View>
            <Text style={styles.waterTitle}>
              <Ionicons name="water" size={17} color="#2878D0" /> Water Intake
            </Text>

            <Text style={styles.waterValue}>
              {todayData.water.toLocaleString()} ml
            </Text>

            <Text style={styles.cardGoal}>
              Daily goal: 2,500 ml
            </Text>
          </View>

          <View style={styles.waterProgress}>
            <View
              style={[
                styles.waterProgressFill,
                { width: `${waterPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Daily Goals */}
        <Text style={styles.sectionTitle}>Daily Goals</Text>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalName}>Step Goal</Text>
            <Text style={styles.goalPercentage}>
              {stepPercentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${stepPercentage}%` },
              ]}
            />
          </View>

          <View style={styles.goalHeader}>
            <Text style={styles.goalName}>Water Goal</Text>
            <Text style={styles.goalPercentage}>
              {waterPercentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${waterPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>
            Keep track of your day
          </Text>

          <Text style={styles.quickDescription}>
            Add your daily health records and monitor your progress.
          </Text>

          <Text style={styles.quickAction}>
            + Add Health Record
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Colours are taken from the selected theme.
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.secondaryText,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 4,
  },

  subtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    marginHorizontal: 22,
    marginTop: 12,
    marginBottom: 25,
  },

  profile: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: theme.input,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme.primary,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme.text,
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
    backgroundColor: theme.card,
    padding: 17,
    borderRadius: 18,
    elevation: 2,
  },

  cardIcon: {
    marginBottom: 12,
  },

  cardValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: theme.text,
  },

  cardLabel: {
    fontSize: 14,
    color: theme.secondaryText,
    marginTop: 4,
  },

  cardGoal: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 7,
  },

  waterCard: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginBottom: 25,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },

  waterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },

  waterValue: {
    fontSize: 25,
    fontWeight: 'bold',
    color: theme.primary,
    marginTop: 10,
  },

  waterProgress: {
    height: 9,
    backgroundColor: theme.border,
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },

  waterProgressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 10,
  },

  goalCard: {
    backgroundColor: theme.card,
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
    color: theme.secondaryText,
  },

  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
  },

  progressBackground: {
    height: 9,
    backgroundColor: theme.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 17,
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 10,
  },

  quickCard: {
    backgroundColor: theme.input,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  quickTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.text,
  },

  quickDescription: {
    fontSize: 13,
    color: theme.secondaryText,
    lineHeight: 20,
    marginTop: 8,
  },

  quickAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    marginTop: 15,
  },
});
