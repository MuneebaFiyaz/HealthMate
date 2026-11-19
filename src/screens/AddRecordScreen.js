
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addHealthRecord } from '../database/database';
import { useTheme } from '../context/ThemeContext';
import { parseNonNegativeInteger } from '../utils/healthRecordValidation';

export default function AddRecordScreen() {
  const database = useSQLiteContext();
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Display a message after saving or when an error occurs.
  const showMessage = (type, title, text, preview = null) => {
    setMessage({ type, title, text, preview });
  };

  // Save the health record to SQLite.
  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    Keyboard.dismiss();

    if (!steps.trim() || !calories.trim() || !water.trim()) {
      showMessage(
        'warning',
        'Missing Information',
        'Please fill in all three fields before saving your record.'
      );
      return;
    }

    const recordValues = {
      steps: parseNonNegativeInteger(steps),
      calories: parseNonNegativeInteger(calories),
      water: parseNonNegativeInteger(water),
    };

    if (Object.values(recordValues).some((value) => value === null)) {
      showMessage(
        'warning',
        'Invalid Information',
        'Enter whole numbers using digits only. Values must be zero or greater.'
      );
      return;
    }

    const record = {
      ...recordValues,
      date: [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-'),
    };

    setIsSaving(true);

    try {
      // Save the record and get its automatically generated ID.
      const recordId = await addHealthRecord(database, record);

      setSteps('');
      setCalories('');
      setWater('');

      showMessage(
        'success',
        'Record Saved!',
        'Your daily health record has been saved successfully.',
        { ...record, id: recordId }
      );
    } catch (error) {
      console.error('Error saving health record:', error);

      showMessage(
        'error',
        'Something Went Wrong',
        'Your health record could not be saved. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Choose the message icon and colours based on its type.
  const messageDetails = {
    success: {
      icon: 'checkmark-circle',
      color: theme.success,
      background: theme.successSoft,
      button: theme.primaryButton,
    },
    warning: {
      icon: 'alert-circle',
      color: theme.warning,
      background: theme.warningSoft,
      button: theme.warningButton,
    },
    error: {
      icon: 'close-circle',
      color: theme.danger,
      background: theme.dangerSoft,
      button: theme.dangerButton,
    },
  };

  const currentMessage = message
    ? messageDetails[message.type]
    : null;

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.brand}>HEALTHMATE</Text>

          {/* Screen heading */}
          <Text style={styles.title}>Add record</Text>

          <Text style={styles.subtitle}>
            Record your daily activities and keep track of your progress.
          </Text>

          {/* Current date */}
          <View style={styles.dateCard}>
            <View style={styles.dateIcon}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={theme.primary}
              />
            </View>

            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>RECORD DATE</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
          </View>

          {/* Activity section */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Daily activities</Text>
            <Text style={styles.requiredHint}>All fields required</Text>
          </View>

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

            <View style={styles.inputField}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                maxLength={16}
                accessibilityLabel="Steps walked"
                value={steps}
                onChangeText={setSteps}
              />
              <Text style={styles.inputUnit}>steps</Text>
            </View>
          </View>

          {/* Calories */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <View style={styles.calorieIcon}>
                <Ionicons
                  name="flame-outline"
                  size={22}
                  color={theme.calories}
                />
              </View>

              <View style={styles.inputInfo}>
                <Text style={styles.inputTitle}>Calories Burned</Text>
                <Text style={styles.inputDescription}>
                  Energy used during activities
                </Text>
              </View>
            </View>

            <View style={styles.inputField}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                maxLength={16}
                accessibilityLabel="Calories burned"
                value={calories}
                onChangeText={setCalories}
              />
              <Text style={styles.inputUnit}>kcal</Text>
            </View>
          </View>

          {/* Water */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <View style={styles.waterIcon}>
                <Ionicons
                  name="water-outline"
                  size={22}
                  color={theme.water}
                />
              </View>

              <View style={styles.inputInfo}>
                <Text style={styles.inputTitle}>Water Intake</Text>
                <Text style={styles.inputDescription}>
                  Total water consumed today
                </Text>
              </View>
            </View>

            <View style={styles.inputField}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                maxLength={16}
                accessibilityLabel="Water intake"
                value={water}
                onChangeText={setWater}
              />
              <Text style={styles.inputUnit}>ml</Text>
            </View>
          </View>

          {/* Save record */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save health record"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save health record'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Your health information is saved securely on your device.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom message box */}
      <Modal
        visible={message !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.messageScrollView}
            contentContainerStyle={styles.messageScrollContent}
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.messageCard}>
            {message && (
              <>
                <View
                  style={[
                    styles.messageIcon,
                    {
                      backgroundColor: currentMessage.background,
                    },
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

                {message.preview && (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewDate}>
                      {formattedDate}
                    </Text>

                    {/* Display the generated record ID */}
                    <View style={styles.previewIdRow}>
                      <Text style={styles.previewIdLabel}>
                        Record ID
                      </Text>
                      <Text style={styles.previewIdValue}>
                        #{message.preview.id}
                      </Text>
                    </View>

                    {[
                      {
                        icon: 'footsteps-outline',
                        label: 'Steps',
                        value: message.preview.steps.toLocaleString(),
                        color: theme.primary,
                      },
                      {
                        icon: 'flame-outline',
                        label: 'Calories',
                        value: `${message.preview.calories.toLocaleString()} kcal`,
                        color: theme.calories,
                      },
                      {
                        icon: 'water-outline',
                        label: 'Water',
                        value: `${message.preview.water.toLocaleString()} ml`,
                        color: theme.water,
                      },
                    ].map((item) => (
                      <View key={item.label} style={styles.previewRow}>
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={item.color}
                        />
                        <Text style={styles.previewLabel}>
                          {item.label}
                        </Text>
                        <Text style={styles.previewValue}>
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  style={[
                    styles.messageButton,
                    {
                      backgroundColor: currentMessage.button,
                    },
                  ]}
                  onPress={() => setMessage(null)}
                >
                  <Text style={styles.messageButtonText}>
                    Got it
                  </Text>
                </Pressable>
              </>
            )}
          </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    keyboardAvoidingView: {
      flex: 1,
    },

    formScrollView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },

    brand: {
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1.8,
      color: theme.primary,
      marginBottom: 8,
    },

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
    },

    subtitle: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 21,
      marginTop: 6,
      marginBottom: 20,
    },

    dateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 1,
    },

    dateIcon: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: theme.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

    dateInfo: {
      flex: 1,
      marginLeft: 11,
    },

    dateLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      color: theme.secondaryText,
    },

    dateValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginTop: 4,
    },

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.text,
    },

    requiredHint: {
      fontSize: 11,
      color: theme.secondaryText,
    },

    inputCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 1,
    },

    inputHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 9,
    },

    stepsIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

    calorieIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.caloriesSoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

    waterIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.waterSoft,
      justifyContent: 'center',
      alignItems: 'center',
    },

    inputInfo: {
      flex: 1,
      marginLeft: 11,
    },

    inputTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.text,
    },

    inputDescription: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },

    inputField: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },

    input: {
      flex: 1,
      paddingVertical: 13,
      fontSize: 16,
      color: theme.text,
    },

    inputUnit: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.secondaryText,
      marginLeft: 10,
    },

    saveButton: {
      backgroundColor: theme.primaryButton,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      minHeight: 52,
      paddingVertical: 14,
      marginTop: 8,
      gap: 8,
    },

    saveButtonDisabled: {
      opacity: 0.7,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },

    footerText: {
      fontSize: 12,
      color: theme.secondaryText,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 18,
    },

    // Message modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      paddingHorizontal: 20,
    },

    messageScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },

    messageScrollView: {
      flex: 1,
    },

    messageCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 22,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },

    messageIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },

    messageTitle: {
      fontSize: 20,
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
      marginBottom: 14,
    },

    previewCard: {
      width: '100%',
      backgroundColor: theme.input,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },

    previewDate: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.secondaryText,
      marginBottom: 9,
    },

    // Record ID styles
    previewIdRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 9,
      marginBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    previewIdLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },

    previewIdValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary,
    },

    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
    },

    previewLabel: {
      flex: 1,
      fontSize: 13,
      color: theme.text,
      marginLeft: 9,
    },

    previewValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.text,
    },

    messageButton: {
      width: '100%',
      minHeight: 48,
      paddingVertical: 13,
      borderRadius: 13,
      alignItems: 'center',
    },

    messageButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },
  });
