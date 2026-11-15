
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

import { addHealthRecord } from '../database/database';
import { useTheme } from '../context/ThemeContext';

export default function AddRecordScreen() {
  const database = useSQLiteContext();
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [message, setMessage] = useState(null);

  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Show a message after saving or when an error occurs.
  const showMessage = (type, title, text) => {
    setMessage({ type, title, text });
  };

  const handleSave = async () => {
    if (!steps.trim() || !calories.trim() || !water.trim()) {
      showMessage(
        'warning',
        'Missing Information',
        'Please fill in all three fields before saving your record.'
      );
      return;
    }

    const record = {
      steps: Number(steps),
      calories: Number(calories),
      water: Number(water),
      date: [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-'),
    };

    const values = [record.steps, record.calories, record.water];

    // Only allow whole numbers that are zero or above.
    if (values.some(value => !Number.isInteger(value) || value < 0)) {
      showMessage(
        'warning',
        'Invalid Information',
        'Please enter whole numbers greater than or equal to zero.'
      );
      return;
    }

    try {
      await addHealthRecord(database, record);

      setSteps('');
      setCalories('');
      setWater('');

      showMessage(
        'success',
        'Record Saved!',
        'Your daily health record has been saved successfully.'
      );
    } catch (error) {
      console.error('Error saving health record:', error);

      showMessage(
        'error',
        'Something Went Wrong',
        'Your health record could not be saved. Please try again.'
      );
    }
  };

  // Choose the message icon and colours based on its type.
  const messageDetails = {
    success: {
      icon: 'checkmark-circle',
      color: '#26966B',
      background: isDarkMode ? '#203B31' : '#E5F5EC',
      button: '#26966B',
    },
    warning: {
      icon: 'alert-circle',
      color: '#D99A35',
      background: isDarkMode ? '#403522' : '#FFF4DD',
      button: '#C58A2B',
    },
    error: {
      icon: 'close-circle',
      color: '#D94D56',
      background: isDarkMode ? '#402629' : '#FCEBED',
      button: '#D94D56',
    },
  };

  const currentMessage = message
    ? messageDetails[message.type]
    : null;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Screen heading */}
        <Text style={styles.title}>Add Record</Text>
        <Text style={styles.subtitle}>
          Record your daily activities and keep track of your progress.
        </Text>

        {/* Current date */}
        <View style={styles.dateCard}>
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={theme.primary}
            />
          </View>

          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>RECORD DATE</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily Activities</Text>

        {/* Steps */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.stepsIcon}>
              <Ionicons
                name="footsteps-outline"
                size={22}
                color={theme.primary}
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Steps Walked</Text>
              <Text style={styles.inputDescription}>
                Total steps taken today
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter your steps"
            placeholderTextColor={theme.secondaryText}
            keyboardType="numeric"
            value={steps}
            onChangeText={setSteps}
          />
        </View>

        {/* Calories */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.calorieIcon}>
              <Ionicons
                name="flame-outline"
                size={22}
                color="#D94D56"
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Calories Burned</Text>
              <Text style={styles.inputDescription}>
                Energy used during activities
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter calories burned"
            placeholderTextColor={theme.secondaryText}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
        </View>

        {/* Water */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.waterIcon}>
              <Ionicons
                name="water-outline"
                size={22}
                color="#278BCB"
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Water Intake</Text>
              <Text style={styles.inputDescription}>
                Total water consumed today
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter water intake (ml)"
            placeholderTextColor={theme.secondaryText}
            keyboardType="numeric"
            value={water}
            onChangeText={setWater}
          />
        </View>

        {/* Save record */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="#FFFFFF"
          />
          <Text style={styles.saveButtonText}>Save Health Record</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your health information is saved securely on your device.
        </Text>
      </ScrollView>

      {/* Custom message box */}
      <Modal
        visible={message !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messageCard}>
            {message && (
              <>
                <View
                  style={[
                    styles.messageIcon,
                    { backgroundColor: currentMessage.background },
                  ]}
                >
                  <Ionicons
                    name={currentMessage.icon}
                    size={38}
                    color={currentMessage.color}
                  />
                </View>

                <Text style={styles.messageTitle}>
                  {message.title}
                </Text>

                <Text style={styles.messageText}>
                  {message.text}
                </Text>

                <Pressable
                  style={[
                    styles.messageButton,
                    { backgroundColor: currentMessage.button },
                  ]}
                  onPress={() => setMessage(null)}
                >
                  <Text style={styles.messageButtonText}>Got it</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
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
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 23,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: isDarkMode ? 0 : 2,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#293B36' : '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: theme.secondaryText,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 25,
    marginBottom: 13,
  },
  inputCard: {
    backgroundColor: theme.card,
    borderRadius: 17,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: isDarkMode ? 0 : 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepsIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#293B36' : '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#382629' : '#FCEBED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#23323D' : '#E8F4FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputInfo: {
    flex: 1,
    marginLeft: 12,
  },
  inputTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  inputDescription: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 4,
  },
  input: {
    backgroundColor: theme.input,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 15,
    color: theme.text,
  },
  saveButton: {
    backgroundColor: isDarkMode ? '#287D70' : '#21664F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingVertical: 15,
    marginTop: 7,
    gap: 9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 11,
    color: theme.secondaryText,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  messageCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: theme.card,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
  },
  messageTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: theme.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
  },
  messageButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
