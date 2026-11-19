
import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

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

// Display a date in a readable format.
function formatDisplayDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Load dashboard records whenever Home is opened.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadDashboardData() {
        try {
          const healthRecords = await getHealthRecords(database);

          if (isActive) {
            setRecords(healthRecords);
            setLoadError(null);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);

          if (isActive) {
            setLoadError(
              'Your dashboard data could not be loaded. Reopen this screen to try again.'
            );
          }
        }
      }

      loadDashboardData();

      return () => {
        isActive = false;
      };
    }, [database])
  );

  // Handle date selection from the calendar.
  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }

    setShowDatePicker(false);
  };

  const selectedDateKey = getDateKey(selectedDate);
  const todayKey = getDateKey(new Date());
  const isToday = selectedDateKey === todayKey;

  // Calculate totals for the selected date.
  const selectedRecords = records.filter(
    record => record.date === selectedDateKey
  );

  const selectedData = selectedRecords.reduce(
    (result, record) => ({
      steps: result.steps + record.steps,
      calories: result.calories + record.calories,
      water: result.water + record.water,
    }),
    { steps: 0, calories: 0, water: 0 }
  );

  // Prepare the seven days ending on the selected date.
  const weeklyData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - i
    );

    const dateKey = getDateKey(date);

    const daySteps = records
      .filter(record => record.date === dateKey)
      .reduce((total, record) => total + record.steps, 0);

    weeklyData.push({
      date: dateKey,
      label: date.toLocaleDateString('en', {
        weekday: 'short',
      }),
      steps: daySteps,
      isSelected: dateKey === selectedDateKey,
    });
  }

  // Calculate progress towards daily goals.
  const stepPercentage = Math.min(
    (selectedData.steps / STEP_GOAL) * 100,
    100
  );

  const waterPercentage = Math.min(
    (selectedData.water / WATER_GOAL) * 100,
    100
  );

  const caloriePercentage = Math.min(
    (selectedData.calories / CALORIE_GOAL) * 100,
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
    STEP_GOAL - selectedData.steps,
    0
  );

  // Choose an encouragement message based on the selected day's activity.
  let encouragementMessage;

  if (selectedData.steps >= STEP_GOAL) {
    encouragementMessage = "You've reached your daily step goal. Great work!";
  } else if (selectedRecords.length === 0) {
    encouragementMessage = 'No activity has been recorded for this date yet.';
  } else if (selectedData.steps === 0) {
    encouragementMessage = 'Record your first activity to track your progress.';
  } else {
    encouragementMessage = `Just ${remainingSteps.toLocaleString()} steps to your daily goal.`;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.screenScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dashboard header */}
        <View style={styles.header}>
          <Text style={styles.brand}>HEALTHMATE</Text>
          <Text style={styles.title}>Your daily balance</Text>
          <Text style={styles.subtitle}>
            A clear view of your activity and progress.
          </Text>
        </View>

        {loadError && (
          <View style={styles.errorCard} accessibilityRole="alert">
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.danger}
            />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        )}

        {/* Select dashboard date */}
        <Pressable
          style={styles.dateRow}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Select date. Currently showing ${formatDisplayDate(selectedDate)}`}
        >
          <View>
            <Text style={styles.dateText}>
              {isToday ? 'Today' : 'Selected date'}, {formatDisplayDate(selectedDate)}
            </Text>
            {!isToday && (
              <Text style={styles.dateHint}>
                Viewing records for this date
              </Text>
            )}
          </View>

          <Ionicons
            name="calendar-outline"
            size={22}
            color={theme.primary}
          />
        </Pressable>

        {/* Calendar picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onValueChange={(event, date) => {
              handleDateChange(event, date);
            }}
            onDismiss={() => setShowDatePicker(false)}
          />
        )}

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
              {selectedData.steps.toLocaleString()}
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
                color={theme.water}
              />

              <Text style={styles.waterTitle}>Water intake</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.activityValue}>
                {selectedData.water.toLocaleString()}
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
                color={theme.calories}
              />

              <Text style={styles.calorieTitle}>
                Calories burned
              </Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.activityValue}>
                {selectedData.calories.toLocaleString()}
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
                Daily steps · 7 days ending {selectedDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
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
                        backgroundColor: day.isSelected
                          ? theme.primary
                          : theme.primarySoft,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.chartLabel,
                      day.isSelected && styles.todayChartLabel,
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
              color={theme.primary}
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
    </SafeAreaView>
  );
}

// Styles use the selected app theme.
const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  screenScrollView: {
    flex: 1,
  },

  scrollContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  header: {
    paddingTop: 16,
  },

  brand: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: theme.primary,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 7,
  },

  subtitle: {
    fontSize: 14,
    color: theme.secondaryText,
    lineHeight: 20,
    marginTop: 6,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
    paddingVertical: 4,
  },

  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.secondaryText,
  },

  dateHint: {
    fontSize: 11,
    color: theme.primary,
    marginTop: 4,
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.dangerSoft,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: theme.danger,
  },

  stepsCard: {
    backgroundColor: theme.primaryButton,
    padding: 20,
    borderRadius: 22,
    minHeight: 140,
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
    fontSize: 36,
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
    marginTop: 14,
    gap: 12,
  },

  waterCard: {
    flex: 1,
    backgroundColor: theme.waterSoft,
    padding: 14,
    borderRadius: 18,
  },

  calorieCard: {
    flex: 1,
    backgroundColor: theme.caloriesSoft,
    padding: 14,
    borderRadius: 18,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  waterTitle: {
    fontSize: 11,
    color: theme.water,
    fontWeight: '500',
  },

  calorieTitle: {
    fontSize: 11,
    color: theme.calories,
    fontWeight: '500',
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },

  activityValue: {
    fontSize: 23,
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
    backgroundColor: theme.water,
    borderRadius: 5,
  },

  calorieProgressFill: {
    height: '100%',
    backgroundColor: theme.calories,
    borderRadius: 5,
  },

  weekCard: {
    backgroundColor: theme.card,
    marginTop: 14,
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },

  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },

  weekSubtitle: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },

  weekAverage: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.primary,
  },

  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
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
    width: 18,
    borderRadius: 8,
  },

  chartLabel: {
    fontSize: 11,
    color: theme.secondaryText,
    marginTop: 7,
  },

  todayChartLabel: {
    color: theme.primary,
    fontWeight: 'bold',
  },

  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },

  messageIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  messageContent: {
    flex: 1,
  },

  messageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
  },

  messageDescription: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 3,
  },

  messageHint: {
    fontSize: 11,
    color: theme.secondaryText,
    marginTop: 1,
  },
});
