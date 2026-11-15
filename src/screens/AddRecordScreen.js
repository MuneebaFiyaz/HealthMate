
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

  // Controls the custom message box.
  const [message, setMessage] = useState(null);

  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Displays a message with the selected type.
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

    // Check that all values are valid whole numbers.
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

  // Set the icon and colour based on the message type.
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
        {/* Screen header */}
        <Text style={styles.brand}>HEALTHMATE</Text>

        <Text style={styles.title}>Add your record</Text>

        <Text style={styles.subtitle}>
          A little progress every day makes a difference.
        </Text>

        {/* Date information */}
        <View style={styles.dateCard}>
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color={theme.primary}
            />
          </View>

          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>RECORD DATE</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily activities</Text>

        {/* Steps input card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.stepsIcon}>
              <Ionicons
                name="footsteps-outline"
                size={23}
                color={theme.primary}
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Steps walked</Text>
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

        {/* Calories input card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.calorieIcon}>
              <Ionicons
                name="flame-outline"
                size={23}
                color="#D94D56"
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Calories burned</Text>
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

        {/* Water input card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={styles.waterIcon}>
              <Ionicons
                name="water-outline"
                size={23}
                color="#278BCB"
              />
            </View>

            <View style={styles.inputInfo}>
              <Text style={styles.inputTitle}>Water intake</Text>
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

        {/* Save button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={23}
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
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 30,
  },

  brand: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: theme.primary,
  },

  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 9,
  },

  subtitle: {
    fontSize: 15,
    color: theme.secondaryText,
    lineHeight: 22,
    marginTop: 7,
  },

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 16,
    marginTop: 25,
    borderWidth: 1,
    borderColor: theme.border,
  },

  dateIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#303030' : '#E8F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateInfo: {
    flex: 1,
    marginLeft: 13,
  },

  dateLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: theme.secondaryText,
  },

  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 26,
    marginBottom: 13,
  },

  inputCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },

  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  stepsIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#303030' : '#E8F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calorieIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#382629' : '#FCEBED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  waterIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: isDarkMode ? '#23323D' : '#E8F4FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputInfo: {
    flex: 1,
    marginLeft: 13,
  },

  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },

  inputDescription: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 4,
  },

  input: {
    backgroundColor: theme.input,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },

  saveButton: {
    backgroundColor: isDarkMode ? '#287D70' : '#21664F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    paddingVertical: 16,
    marginTop: 8,
    gap: 9,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  footerText: {
    fontSize: 12,
    color: theme.secondaryText,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 18,
  },

  // Background behind the message box.
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  // Main message box.
  messageCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: theme.card,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },

  messageIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 19,
  },

  messageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },

  messageText: {
    fontSize: 15,
    color: theme.secondaryText,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 24,
  },

  messageButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
