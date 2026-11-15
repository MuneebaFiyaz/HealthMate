
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
    } catch (error) {
      console.error('Error loading health records:', error);
      showMessage('Error', 'Could not load health records.', 'error');
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

  // Filter records using the date entered by the user.
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
      await loadRecords();

      showMessage(
        'Record Updated!',
        'Your health record has been updated successfully.',
        'success'
      );
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

          await loadRecords();

          showMessage(
            'Record Deleted!',
            'The health record has been deleted successfully.',
            'success'
          );
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
        {/* Screen header */}
        <Text style={styles.brand}>HEALTHMATE</Text>

        <Text style={styles.title}>Health History</Text>

        <Text style={styles.subtitle}>
          View and manage your previous health records.
        </Text>

        {/* Search records by date */}
        <View style={styles.searchCard}>
          <View style={styles.searchHeader}>
            <View style={styles.searchIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={theme.primary}
              />
            </View>

            <View>
              <Text style={styles.searchTitle}>Search by Date</Text>
              <Text style={styles.searchDescription}>
                Find records using a specific date.
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
              <Ionicons name="search-outline" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={theme.text} />
              <Text style={styles.clearButtonText}>Show All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Records heading */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultText}>
            {isSearching ? 'Search Results' : 'All Health Records'}
          </Text>

          <Text style={styles.recordCount}>
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </Text>
        </View>

        {filteredRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="folder-open-outline"
                size={35}
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
                    name="calendar"
                    size={19}
                    color={theme.primary}
                  />
                </View>

                <Text style={styles.date}>{record.date}</Text>

                {editingId === record.id && (
                  <Text style={styles.editingLabel}>EDITING</Text>
                )}
              </View>

              {editingId === record.id ? (
                <View>
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
                        size={18}
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
                  {/* Record information */}
                  <View style={styles.recordRow}>
                    <View style={styles.metricInfo}>
                      <Ionicons
                        name="footsteps-outline"
                        size={19}
                        color={theme.primary}
                      />
                      <Text style={styles.label}>Steps</Text>
                    </View>
                    <Text style={styles.value}>{record.steps}</Text>
                  </View>

                  <View style={styles.recordRow}>
                    <View style={styles.metricInfo}>
                      <Ionicons
                        name="flame-outline"
                        size={19}
                        color="#D94D56"
                      />
                      <Text style={styles.label}>Calories Burned</Text>
                    </View>
                    <Text style={styles.value}>{record.calories} kcal</Text>
                  </View>

                  <View style={styles.recordRow}>
                    <View style={styles.metricInfo}>
                      <Ionicons
                        name="water-outline"
                        size={19}
                        color="#278BCB"
                      />
                      <Text style={styles.label}>Water Intake</Text>
                    </View>
                    <Text style={styles.value}>{record.water} ml</Text>
                  </View>

                  {/* Record actions */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(record)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.buttonText}>Edit Record</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(record.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
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

// Styles use the colours from the selected theme.
const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
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
      marginBottom: 22,
    },

    searchCard: {
      backgroundColor: theme.card,
      padding: 17,
      borderRadius: 17,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 2,
    },

    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    searchIcon: {
      width: 45,
      height: 45,
      borderRadius: 13,
      backgroundColor: isDarkMode ? '#303030' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    searchTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },

    searchDescription: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 4,
    },

    searchInput: {
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 11,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      color: theme.text,
    },

    buttonRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },

    searchButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 7,
      backgroundColor: theme.primary,
      padding: 13,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    clearButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 7,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 13,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 'bold',
    },

    clearButtonText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: 'bold',
    },

    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },

    resultText: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.text,
    },

    recordCount: {
      fontSize: 12,
      color: theme.secondaryText,
    },

    emptyCard: {
      backgroundColor: theme.card,
      padding: 28,
      borderRadius: 17,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },

    emptyIcon: {
      width: 65,
      height: 65,
      borderRadius: 33,
      backgroundColor: isDarkMode ? '#303030' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.text,
    },

    emptyText: {
      fontSize: 14,
      color: theme.secondaryText,
      textAlign: 'center',
      lineHeight: 21,
      marginTop: 8,
    },

    recordCard: {
      backgroundColor: theme.card,
      padding: 17,
      borderRadius: 17,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: isDarkMode ? 0 : 2,
    },

    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 17,
      paddingBottom: 13,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    recordDateIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#303030' : '#E8F0E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    date: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
    },

    editingLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.primary,
      letterSpacing: 1,
    },

    recordRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    metricInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    label: {
      fontSize: 14,
      color: theme.secondaryText,
    },

    value: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },

    input: {
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 13,
      marginTop: 7,
      marginBottom: 15,
      fontSize: 15,
      color: theme.text,
    },

    editButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 7,
      backgroundColor: theme.primary,
      padding: 13,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 7,
      backgroundColor: '#D9534F',
      padding: 13,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveButton: {
      flex: 1,
      flexDirection: 'row',
      gap: 7,
      backgroundColor: theme.primary,
      padding: 13,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButton: {
      flex: 1,
      backgroundColor: '#718096',
      padding: 13,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
