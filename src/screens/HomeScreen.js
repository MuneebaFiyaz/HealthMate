
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

// Daily goals used on the dashboard.
const STEP_GOAL = 2500;
const WATER_GOAL = 2500;
const CALORIE_GOAL = 500;

// Convert a date into YYYY-MM-DD format.
function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

// Display large step counts in a shorter format.
function formatSteps(steps) {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`;
  }

  return steps.toString();
}

export default function HomeScreen() {
  const database = useSQLiteContext();
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const [todayData, setTodayData] = useState({
    steps: 0,
    calories: 0,
    water: 0,
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [todayDate, setTodayDate] = useState('');

  // Load dashboard records whenever Home is opened.
  useFocusEffect(
    useCallback(() => {
      async function loadDashboardData() {
        try {
          const records = await getHealthRecords(database);

          const today = new Date();
          const todayKey = getDateKey(today);

          setTodayDate(
            today.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          );

          // Calculate today's totals.
          const todaysRecords = records.filter(
            record => record.date === todayKey
          );

          const totals = todaysRecords.reduce(
            (result, record) => ({
              steps: result.steps + record.steps,
              calories: result.calories + record.calories,
              water: result.water + record.water,
            }),
            { steps: 0, calories: 0, water: 0 }
          );

          setTodayData(totals);

          // Prepare the last seven days for the chart.
          const lastSevenDays = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - i
            );

            const dateKey = getDateKey(date);

            const daySteps = records
              .filter(record => record.date === dateKey)
              .reduce((total, record) => total + record.steps, 0);

            lastSevenDays.push({
              date: dateKey,
              label: date.toLocaleDateString('en', {
                weekday: 'short',
              }),
              steps: daySteps,
              isToday: dateKey === todayKey,
            });
          }

          setWeeklyData(lastSevenDays);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      }

      loadDashboardData();
    }, [database])
  );

  // Calculate progress towards daily goals.
  const stepPercentage = Math.min(
    (todayData.steps / STEP_GOAL) * 100,
    100
  );

  const waterPercentage = Math.min(
    (todayData.water / WATER_GOAL) * 100,
    100
  );

  const caloriePercentage = Math.min(
    (todayData.calories / CALORIE_GOAL) * 100,
    100
  );

  const weeklyTotal = weeklyData.reduce(
    (total, day) => total + day.steps,
    0
  );

  const weeklyAverage = Math.round(weeklyTotal / 7);

  const highestDay = Math.max(
    ...weeklyData.map(day => day.steps),
    1
  );

  const remainingSteps = Math.max(
    STEP_GOAL - todayData.steps,
    0
  );

  // Choose an encouragement message based on today's activity.
  let encouragementMessage;

  if (remainingSteps === 0) {
    encouragementMessage = "You've reached your daily step goal. Great work!";
  } else if (todayData.steps === 0) {
    encouragementMessage = 'Record your first activity and start your day.';
  } else {
    encouragementMessage = `Just ${remainingSteps.toLocaleString()} steps to your daily goal.`;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dashboard header */}
        <View style={styles.header}>
          <Text style={styles.brand}>HEALTHMATE</Text>
          <Text style={styles.title}>Your daily balance</Text>
          <Text style={styles.subtitle}>
            Keep track of your daily activity.
          </Text>
        </View>

        {/* Today's date */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Today, {todayDate}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.secondaryText}
          />
        </View>

        {/* Main steps card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsInfo}>
            <View style={styles.stepsLabelRow}>
              <Ionicons
                name="footsteps-outline"
                size={21}
                color="#D8E9B5"
              />

              <Text style={styles.stepsLabel}>Steps walked</Text>
            </View>

            <Text style={styles.stepsValue}>
              {todayData.steps.toLocaleString()}
            </Text>

            <Text style={styles.stepsGoal}>
              of {STEP_GOAL.toLocaleString()} daily steps
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.circlePercentage}>
              {stepPercentage.toFixed(0)}%
            </Text>

            <Text style={styles.circleLabel}>of goal</Text>
          </View>
        </View>

        {/* Water and calories cards */}
        <View style={styles.activityRow}>
          <View style={styles.waterCard}>
            <View style={styles.activityTitleRow}>
              <Ionicons
                name="water-outline"
                size={19}
                color="#278BCB"
              />

              <Text style={styles.waterTitle}>Water intake</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.activityValue}>
                {todayData.water.toLocaleString()}
              </Text>

              <Text style={styles.unit}>ml</Text>
            </View>

            <Text style={styles.activityGoal}>
              of {WATER_GOAL.toLocaleString()} ml
            </Text>

            <View style={styles.smallProgressBackground}>
              <View
                style={[
                  styles.waterProgressFill,
                  { width: `${waterPercentage}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.calorieCard}>
            <View style={styles.activityTitleRow}>
              <Ionicons
                name="flame-outline"
                size={19}
                color="#D94D56"
              />

              <Text style={styles.calorieTitle}>
                Calories burned
              </Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.activityValue}>
                {todayData.calories.toLocaleString()}
              </Text>

              <Text style={styles.unit}>kcal</Text>
            </View>

            <Text style={styles.activityGoal}>
              of {CALORIE_GOAL} kcal
            </Text>

            <View style={styles.smallProgressBackground}>
              <View
                style={[
                  styles.calorieProgressFill,
                  { width: `${caloriePercentage}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Weekly progress chart */}
        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekTitle}>
                A week of progress
              </Text>

              <Text style={styles.weekSubtitle}>
                Daily steps · Last 7 days
              </Text>
            </View>

            <Text style={styles.weekAverage}>
              {weeklyAverage.toLocaleString()} avg
            </Text>
          </View>

          <View style={styles.chart}>
            {weeklyData.map(day => {
              const barHeight = day.steps > 0
                ? Math.max((day.steps / highestDay) * 55, 5)
                : 2;

              return (
                <View key={day.date} style={styles.chartColumn}>
                  <Text style={styles.chartValue}>
                    {formatSteps(day.steps)}
                  </Text>

                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: day.isToday
                          ? '#21664F'
                          : isDarkMode
                            ? '#555555'
                            : '#DCE9DE',
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.chartLabel,
                      day.isToday && styles.todayChartLabel,
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Daily encouragement */}
        <View style={styles.messageCard}>
          <View style={styles.messageIcon}>
            <Ionicons
              name="checkmark"
              size={19}
              color="#21664F"
            />
          </View>

          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>
              Every step adds up
            </Text>

            <Text style={styles.messageDescription}>
              {encouragementMessage}
            </Text>

            <Text style={styles.messageHint}>
              A short walk is a great next step.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles use the selected app theme.
const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  scrollContent: {
    paddingBottom: 25,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 35,
  },

  brand: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: isDarkMode ? '#8DC9AE' : '#21664F',
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 7,
  },

  subtitle: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 5,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 17,
    marginBottom: 15,
  },

  dateText: {
    fontSize: 14,
    color: theme.secondaryText,
  },

  stepsCard: {
    backgroundColor: '#21664F',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 19,
    minHeight: 125,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  stepsInfo: {
    flex: 1,
  },

  stepsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  stepsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  stepsValue: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },

  stepsGoal: {
    fontSize: 12,
    color: '#D6E7DC',
    marginTop: 3,
  },

  progressCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 5,
    borderColor: '#C8E3A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  circlePercentage: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  circleLabel: {
    fontSize: 10,
    color: '#D6E7DC',
  },

  activityRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 13,
    gap: 10,
  },

  waterCard: {
    flex: 1,
    backgroundColor: isDarkMode ? theme.card : '#E8F2FA',
    padding: 13,
    borderRadius: 17,
  },

  calorieCard: {
    flex: 1,
    backgroundColor: isDarkMode ? theme.card : '#FBECEE',
    padding: 13,
    borderRadius: 17,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  waterTitle: {
    fontSize: 11,
    color: isDarkMode ? theme.text : '#2878B2',
    fontWeight: '500',
  },

  calorieTitle: {
    fontSize: 11,
    color: isDarkMode ? theme.text : '#B94A50',
    fontWeight: '500',
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },

  activityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },

  unit: {
    fontSize: 11,
    color: theme.secondaryText,
    marginLeft: 4,
  },

  activityGoal: {
    fontSize: 11,
    color: theme.secondaryText,
    marginTop: 3,
  },

  smallProgressBackground: {
    height: 4,
    backgroundColor: isDarkMode ? theme.border : '#FFFFFF',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 11,
  },

  waterProgressFill: {
    height: '100%',
    backgroundColor: '#278BCB',
    borderRadius: 5,
  },

  calorieProgressFill: {
    height: '100%',
    backgroundColor: '#D94D56',
    borderRadius: 5,
  },

  weekCard: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 13,
    padding: 15,
    borderRadius: 19,
  },

  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weekTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },

  weekSubtitle: {
    fontSize: 11,
    color: theme.secondaryText,
    marginTop: 4,
  },

  weekAverage: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDarkMode ? '#8DC9AE' : '#21664F',
  },

  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingHorizontal: 3,
  },

  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  chartValue: {
    fontSize: 9,
    color: theme.secondaryText,
    marginBottom: 5,
  },

  chartBar: {
    width: 17,
    borderRadius: 6,
  },

  chartLabel: {
    fontSize: 10,
    color: theme.secondaryText,
    marginTop: 7,
  },

  todayChartLabel: {
    color: isDarkMode ? '#8DC9AE' : '#21664F',
    fontWeight: 'bold',
  },

 
messageCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: isDarkMode ? theme.card : '#EAF0DF',
  marginHorizontal: 16,
  marginTop: 10,
  paddingHorizontal: 12,
  paddingVertical: 9,
  borderRadius: 13,
},

messageIcon: {
  width: 22,
  height: 22,
  borderRadius: 7,
  backgroundColor: '#D5EBAA',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 9,
},

messageContent: {
  flex: 1,
},

messageTitle: {
  fontSize: 12,
  fontWeight: 'bold',
  color: theme.text,
},

messageDescription: {
  fontSize: 11,
  color: theme.secondaryText,
  marginTop: 3,
},

messageHint: {
  fontSize: 10,
  color: theme.secondaryText,
  marginTop: 1,
},
});
