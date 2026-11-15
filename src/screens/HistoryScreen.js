
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  getHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
} from '../database/database';
import { useTheme } from '../context/ThemeContext';
import MessageModal from '../components/MessageModal';

export default function HistoryScreen() {
  const database = useSQLiteContext();
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const [records, setRecords] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: null,
  });

  // Show a custom message box.
  const showMessage = (title, message, type = 'success', onConfirm = null) => {
    setModal({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeMessage = () => {
    setModal({
      visible: false,
      title: '',
      message: '',
      type: 'success',
      onConfirm: null,
    });
  };

  // Load all records from the database.
  const loadRecords = async () => {
    try {
      const savedRecords = await getHealthRecords(database);
      setRecords(savedRecords);
      return true;
    } catch (error) {
      console.error('Error loading health records:', error);
      showMessage('Error', 'Could not load health records.', 'error');
      return false;
    }
  };

  // Refresh the records when the screen is opened.
  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [database])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecords();
    setIsRefreshing(false);
  };

  // Filter records using the selected date.
  const filteredRecords = isSearching
    ? records.filter(record => record.date === searchDate.trim())
    : records;

  const handleSearch = () => {
    const date = searchDate.trim();

    if (!date) {
      showMessage(
        'Missing Date',
        'Please enter a date to search.',
        'warning'
      );
      return;
    }

    // Check that the date follows YYYY-MM-DD format.
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      showMessage(
        'Invalid Date',
        'Please enter the date in YYYY-MM-DD format.',
        'warning'
      );
      return;
    }

    // Check that the entered date is a real calendar date.
    const parsedDate = new Date(`${date}T00:00:00`);

    if (
      parsedDate.getFullYear() !== Number(date.slice(0, 4)) ||
      parsedDate.getMonth() + 1 !== Number(date.slice(5, 7)) ||
      parsedDate.getDate() !== Number(date.slice(8, 10))
    ) {
      showMessage(
        'Invalid Date',
        'Please enter a valid calendar date.',
        'warning'
      );
      return;
    }

    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchDate('');
    setIsSearching(false);
  };

  const handleEdit = record => {
    setEditingId(record.id);
    setSteps(String(record.steps));
    setCalories(String(record.calories));
    setWater(String(record.water));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSteps('');
    setCalories('');
    setWater('');
  };

  const handleUpdate = async () => {
    if (!steps.trim() || !calories.trim() || !water.trim()) {
      showMessage(
        'Missing Information',
        'Please fill in all fields before saving.',
        'warning'
      );
      return;
    }

    const updatedRecord = {
      steps: Number(steps),
      calories: Number(calories),
      water: Number(water),
    };

    const values = [
      updatedRecord.steps,
      updatedRecord.calories,
      updatedRecord.water,
    ];

    if (values.some(value => !Number.isInteger(value) || value < 0)) {
      showMessage(
        'Invalid Information',
        'Please enter valid whole numbers greater than or equal to zero.',
        'warning'
      );
      return;
    }

    try {
      const originalRecord = records.find(
        record => record.id === editingId
      );

      if (!originalRecord) {
        showMessage(
          'Record Not Found',
          'The selected record could not be found.',
          'error'
        );
        return;
      }

      await updateHealthRecord(database, editingId, {
        ...updatedRecord,
        date: originalRecord.date,
      });

      cancelEdit();

      const loaded = await loadRecords();

      if (loaded) {
        showMessage(
          'Record Updated!',
          'Your health record has been updated successfully.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating health record:', error);

      showMessage(
        'Update Failed',
        'Could not update the health record. Please try again.',
        'error'
      );
    }
  };

  // Delete a record after the user confirms.
  const handleDelete = id => {
    showMessage(
      'Delete Record?',
      'Are you sure you want to delete this health record? This action cannot be undone.',
      'confirm',
      async () => {
        closeMessage();

        try {
          await deleteHealthRecord(database, id);

          if (editingId === id) {
            cancelEdit();
          }

          const loaded = await loadRecords();

          if (loaded) {
            showMessage(
              'Record Deleted!',
              'The health record has been deleted successfully.',
              'success'
            );
          }
        } catch (error) {
          console.error('Error deleting health record:', error);

          showMessage(
            'Delete Failed',
            'Could not delete the health record. Please try again.',
            'error'
          );
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>HEALTHMATE</Text>
          <Text style={styles.title}>Health History</Text>
          <Text style={styles.subtitle}>
            Your activity records in one place.
          </Text>
        </View>

        {/* Date search */}
        <View style={styles.searchCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.headingIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.primary}
              />
            </View>

            <View style={styles.headingText}>
              <Text style={styles.searchTitle}>Find a Record</Text>
              <Text style={styles.searchDescription}>
                Search using a specific date.
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.secondaryText}
            value={searchDate}
            onChangeText={setSearchDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={17} color="#FFFFFF" />
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={theme.text}
              />
              <Text style={styles.clearButtonText}>Show All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Records heading */}
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultTitle}>
              {isSearching ? 'Search Results' : 'Saved Records'}
            </Text>
            <Text style={styles.resultSubtitle}>
              Your previously recorded activities
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {filteredRecords.length}
            </Text>
          </View>
        </View>

        {/* Empty state */}
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="folder-open-outline"
                size={30}
                color={theme.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No Records Found</Text>

            <Text style={styles.emptyText}>
              {isSearching
                ? 'There are no health records for this date.'
                : 'Your saved health records will appear here.'}
            </Text>
          </View>
        ) : (
          filteredRecords.map(record => (
            <View style={styles.recordCard} key={record.id}>
              {/* Record date */}
              <View style={styles.recordHeader}>
                <View style={styles.recordDateIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>RECORD DATE</Text>
                  <Text style={styles.date}>{record.date}</Text>
                </View>

                {editingId === record.id && (
                  <View style={styles.editingBadge}>
                    <Text style={styles.editingText}>EDITING</Text>
                  </View>
                )}
              </View>

              {editingId === record.id ? (
                <View style={styles.editForm}>
                  <Text style={styles.label}>Steps</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={steps}
                    onChangeText={setSteps}
                    placeholder="Enter steps"
                    placeholderTextColor={theme.secondaryText}
                  />

                  <Text style={styles.label}>Calories Burned (kcal)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                    placeholder="Enter calories"
                    placeholderTextColor={theme.secondaryText}
                  />

                  <Text style={styles.label}>Water Intake (ml)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={water}
                    onChangeText={setWater}
                    placeholder="Enter water intake"
                    placeholderTextColor={theme.secondaryText}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleUpdate}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelEdit}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {/* Steps */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIconSteps}>
                      <Ionicons
                        name="footsteps-outline"
                        size={19}
                        color={theme.primary}
                      />
                    </View>

                    <Text style={styles.metricLabel}>Steps</Text>
                    <Text style={styles.metricValue}>
                      {record.steps.toLocaleString()}
                    </Text>
                  </View>

                  {/* Calories */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIconCalories}>
                      <Ionicons
                        name="flame-outline"
                        size={19}
                        color="#D94D56"
                      />
                    </View>

                    <Text style={styles.metricLabel}>Calories</Text>
                    <Text style={styles.metricValue}>
                      {record.calories.toLocaleString()} kcal
                    </Text>
                  </View>

                  {/* Water */}
                  <View style={styles.metricRow}>
                    <View style={styles.metricIconWater}>
                      <Ionicons
                        name="water-outline"
                        size={19}
                        color="#278BCB"
                      />
                    </View>

                    <Text style={styles.metricLabel}>Water intake</Text>
                    <Text style={styles.metricValue}>
                      {record.water.toLocaleString()} ml
                    </Text>
                  </View>

                  {/* Record actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(record)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(record.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Custom message box */}
      <MessageModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeMessage}
        onConfirm={modal.onConfirm}
        confirmText="Delete"
      />
    </View>
  );
}

// Styles use the selected app theme.
const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 30,
      paddingBottom: 25,
    },

    header: {
      marginBottom: 20,
    },

    brand: {
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: isDarkMode ? '#8DC9AE' : '#21664F',
    },

    title: {
      fontSize: 27,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 7,
    },

    subtitle: {
      fontSize: 13,
      color: theme.secondaryText,
      marginTop: 5,
    },

    searchCard: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 18,
      marginBottom: 23,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 2,
    },

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    headingIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#303A34' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    headingText: {
      flex: 1,
    },

    searchTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.text,
    },

    searchDescription: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },

    searchInput: {
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 11,
      paddingHorizontal: 13,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.text,
    },

    buttonRow: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 12,
    },

    searchButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    clearButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },

    clearButtonText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: 'bold',
    },

    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
    },

    resultTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.text,
    },

    resultSubtitle: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },

    countBadge: {
      minWidth: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#303A34' : '#E4EDE2',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },

    countText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.primary,
    },

    emptyCard: {
      backgroundColor: theme.card,
      padding: 24,
      borderRadius: 17,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: isDarkMode ? '#303A34' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },

    emptyText: {
      fontSize: 12,
      color: theme.secondaryText,
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 7,
    },

    recordCard: {
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 17,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 2,
    },

    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 13,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    recordDateIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: isDarkMode ? '#303A34' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    dateContent: {
      flex: 1,
    },

    dateLabel: {
      fontSize: 9,
      letterSpacing: 1,
      color: theme.secondaryText,
      fontWeight: 'bold',
    },

    date: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 3,
    },

    editingBadge: {
      backgroundColor: isDarkMode ? '#303A34' : '#E4EDE2',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 7,
    },

    editingText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.primary,
      letterSpacing: 1,
    },

    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    metricIconSteps: {
      width: 33,
      height: 33,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#303A34' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    metricIconCalories: {
      width: 33,
      height: 33,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#382C2E' : '#FBECEE',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    metricIconWater: {
      width: 33,
      height: 33,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#293641' : '#E8F2FA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    metricLabel: {
      flex: 1,
      fontSize: 13,
      color: theme.secondaryText,
    },

    metricValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.text,
    },

    actionRow: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 5,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    editButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: theme.primary,
      paddingVertical: 11,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: '#D9534F',
      paddingVertical: 11,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    editForm: {
      paddingTop: 3,
    },

    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },

    input: {
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginTop: 5,
      marginBottom: 13,
      fontSize: 14,
      color: theme.text,
    },

    saveButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButton: {
      flex: 1,
      backgroundColor: '#718096',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
