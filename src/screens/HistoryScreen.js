
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

const dateFilters = [
  { label: 'All dates', value: 'all' },
  { label: 'Last 7 days', value: 'week' },
  { label: 'This month', value: 'month' },
];

// Convert YYYY-MM-DD into a local Date.
const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Format a date for the record card.
const formatRecordDate = (dateString) => {
  const date = parseDate(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  if (isSameDay(date, today)) {
    return 'Today';
  }

  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
  });
};

// Display the date below the day label.
const formatShortDate = (dateString) => {
  return parseDate(dateString).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const formatMonth = (dateString) => {
  return parseDate(dateString).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
};

export default function HistoryScreen() {
  const database = useSQLiteContext();
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const [records, setRecords] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onConfirm: null,
  });

  const showMessage = (
    title,
    message,
    type = 'success',
    onConfirm = null
  ) => {
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

  // Load saved records from SQLite.
  const loadRecords = async () => {
    try {
      const savedRecords = await getHealthRecords(database);
      setRecords(savedRecords);
      return true;
    } catch (error) {
      console.error('Error loading health records:', error);

      showMessage(
        'Error',
        'Could not load health records.',
        'error'
      );

      return false;
    }
  };

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

  // Search for a record using YYYY-MM-DD.
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

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      showMessage(
        'Invalid Date',
        'Please enter the date in YYYY-MM-DD format.',
        'warning'
      );
      return;
    }

    const parsedDate = parseDate(date);

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
    setActiveFilter('all');
    setExpandedRecordId(null);
  };

  const clearSearch = () => {
    setSearchDate('');
    setIsSearching(false);
    setActiveFilter('all');
    setExpandedRecordId(null);
  };

  // Select a date filter.
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setIsSearching(false);
    setSearchDate('');
    setExpandedRecordId(null);
  };

  // Filter records based on the selected option.
  const filteredRecords = records.filter((record) => {
    if (isSearching) {
      return record.date === searchDate.trim();
    }

    if (activeFilter === 'week') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const recordDate = parseDate(record.date);

      return recordDate >= sevenDaysAgo && recordDate <= today;
    }

    if (activeFilter === 'month') {
      const today = new Date();
      const recordDate = parseDate(record.date);

      return (
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getFullYear() === today.getFullYear()
      );
    }

    return true;
  });

  // Expand a record to display its edit and delete options.
  const handleRecordPress = (record) => {
    if (editingId !== null) {
      return;
    }

    setExpandedRecordId(
      expandedRecordId === record.id ? null : record.id
    );
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setExpandedRecordId(record.id);

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

  // Update an existing record.
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

    if (
      values.some(
        (value) => !Number.isInteger(value) || value < 0
      )
    ) {
      showMessage(
        'Invalid Information',
        'Please enter valid whole numbers greater than or equal to zero.',
        'warning'
      );
      return;
    }

    try {
      const originalRecord = records.find(
        (record) => record.id === editingId
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

  // Delete a record after confirmation.
  const handleDelete = (id) => {
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

          setExpandedRecordId(null);

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

  // Determine the month heading from the latest displayed record.
  const monthHeading =
    filteredRecords.length > 0
      ? formatMonth(filteredRecords[0].date)
      : 'Your records';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Page heading */}
        <View style={styles.header}>
          <Text style={styles.brand}>
            YOUR WELLNESS JOURNEY
          </Text>

          <Text style={styles.title}>
            Health records
          </Text>
        </View>

        {/* Date search bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={21}
            color={theme.secondaryText}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by date"
            placeholderTextColor={theme.secondaryText}
            value={searchDate}
            onChangeText={setSearchDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          <TouchableOpacity
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        </View>

        {/* Date filters */}
        <View style={styles.filterRow}>
          {dateFilters.map((filter) => {
            const isActive =
              !isSearching && activeFilter === filter.value;

            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  isActive && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(filter.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Records heading */}
        <View style={styles.resultHeader}>
          <Text style={styles.monthTitle}>
            {isSearching ? 'Search results' : monthHeading}
          </Text>

          <Text style={styles.recordCount}>
            {filteredRecords.length} of {records.length} records
          </Text>
        </View>

        {/* Empty state */}
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="folder-open-outline"
              size={35}
              color={theme.primary}
            />

            <Text style={styles.emptyTitle}>
              No records found
            </Text>

            <Text style={styles.emptyText}>
              {isSearching
                ? 'There are no health records for this date.'
                : 'Your saved health records will appear here.'}
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded =
              expandedRecordId === record.id;

            const isEditing =
              editingId === record.id;

            return (
              <View
                key={record.id}
                style={styles.recordCard}
              >
                {/* Record header */}
                <TouchableOpacity
                  style={styles.recordHeader}
                  onPress={() => handleRecordPress(record)}
                  activeOpacity={0.8}
                  disabled={isEditing}
                >
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>
                      {formatRecordDate(record.date)}
                    </Text>

                    <Text style={styles.dateText}>
                      {formatShortDate(record.date)}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      isExpanded
                        ? 'chevron-up'
                        : 'chevron-forward'
                    }
                    size={23}
                    color={theme.secondaryText}
                  />
                </TouchableOpacity>

                {/* Updated Edit form */}
                {isEditing ? (
                  <View style={styles.editForm}>
                    <View style={styles.editHeading}>
                      <View style={styles.editIconContainer}>
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color="#21664F"
                        />
                      </View>

                      <View style={styles.editHeadingText}>
                        <Text style={styles.editTitle}>
                          Edit health record
                        </Text>

                        <Text style={styles.editSubtitle}>
                          Update your daily activity details
                        </Text>
                      </View>
                    </View>

                    {/* Steps input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Steps
                      </Text>

                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="footsteps-outline"
                          size={20}
                          color={isDarkMode ? '#8DC9AE' : '#267A58'}
                        />

                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={steps}
                          onChangeText={setSteps}
                          placeholder="Enter steps"
                          placeholderTextColor={theme.secondaryText}
                        />
                      </View>
                    </View>

                    {/* Calories input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Calories burned
                      </Text>

                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="flame-outline"
                          size={20}
                          color="#D96A58"
                        />

                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={calories}
                          onChangeText={setCalories}
                          placeholder="Enter calories"
                          placeholderTextColor={theme.secondaryText}
                        />

                        <Text style={styles.inputUnit}>
                          kcal
                        </Text>
                      </View>
                    </View>

                    {/* Water input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        Water intake
                      </Text>

                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="water-outline"
                          size={20}
                          color="#278BCB"
                        />

                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={water}
                          onChangeText={setWater}
                          placeholder="Enter water intake"
                          placeholderTextColor={theme.secondaryText}
                        />

                        <Text style={styles.inputUnit}>
                          ml
                        </Text>
                      </View>
                    </View>

                    {/* Form buttons */}
                    <View style={styles.editActionRow}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleUpdate}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="checkmark-outline"
                          size={19}
                          color="#FFFFFF"
                        />

                        <Text style={styles.actionText}>
                          Save changes
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEdit}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cancelText}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* Health metrics */}
                    <View style={styles.metricsRow}>
                      <View style={styles.metric}>
                        <Ionicons
                          name="footsteps-outline"
                          size={20}
                          color="#267A58"
                        />

                        <Text style={styles.metricValue}>
                          {record.steps.toLocaleString()}
                        </Text>

                        <Text style={styles.metricLabel}>
                          steps
                        </Text>
                      </View>

                      <View style={styles.metric}>
                        <Ionicons
                          name="flame-outline"
                          size={20}
                          color="#D94D56"
                        />

                        <Text style={styles.metricValue}>
                          {record.calories.toLocaleString()}
                        </Text>

                        <Text style={styles.metricLabel}>
                          kcal
                        </Text>
                      </View>

                      <View style={styles.metric}>
                        <Ionicons
                          name="water-outline"
                          size={20}
                          color="#278BCB"
                        />

                        <Text style={styles.metricValue}>
                          {record.water.toLocaleString()}
                        </Text>

                        <Text style={styles.metricLabel}>
                          ml
                        </Text>
                      </View>
                    </View>

                    {/* Expandable actions */}
                    {isExpanded && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEdit(record)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={17}
                            color="#FFFFFF"
                          />

                          <Text style={styles.actionText}>
                            Edit record
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(record.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={17}
                            color="#FFFFFF"
                          />

                          <Text style={styles.actionText}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Existing custom message modal */}
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

// Screen styles
const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 52,
      paddingBottom: 25,
    },

    header: {
      marginBottom: 22,
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
      marginTop: 9,
    },

    searchBar: {
      height: 51,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 15,
      paddingHorizontal: 15,
      marginBottom: 16,
      gap: 12,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      paddingVertical: 8,
    },

    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 23,
    },

    filterButton: {
      flex: 1,
      height: 47,
      borderRadius: 17,
      backgroundColor: isDarkMode ? '#303A34' : '#E8EDE5',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
    },

    activeFilterButton: {
      backgroundColor: theme.primary,
    },

    filterText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.secondaryText,
    },

    activeFilterText: {
      color: '#FFFFFF',
    },

    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 17,
    },

    monthTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flexShrink: 1,
    },

    recordCount: {
      fontSize: 10,
      color: theme.secondaryText,
      marginLeft: 8,
    },

    recordCard: {
      backgroundColor: theme.card,
      borderRadius: 19,
      paddingHorizontal: 16,
      paddingVertical: 13,
      marginBottom: 12,
      elevation: isDarkMode ? 0 : 1,
    },

    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 13,
    },

    dateContent: {
      flex: 1,
    },

    dateLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },

    dateText: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },

    metricsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    metric: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 6,
    },

    metricValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text,
    },

    metricLabel: {
      width: '100%',
      fontSize: 10,
      color: theme.secondaryText,
      marginLeft: 25,
      marginTop: -1,
    },

    actionRow: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 13,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    editButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.primary,
      paddingVertical: 11,
      borderRadius: 10,
    },

    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#D9534F',
      paddingVertical: 11,
      borderRadius: 10,
    },

    actionText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },

    // Updated Edit Record form styles
    editForm: {
      backgroundColor: isDarkMode ? theme.card : '#F5F7F2',
      borderRadius: 17,
      borderWidth: 1,
      borderColor: isDarkMode ? theme.border : '#DCE5D9',
      padding: 16,
      marginTop: 4,
    },

    editHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },

    editIconContainer: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: isDarkMode ? '#34483C' : '#E2EBDF',
      justifyContent: 'center',
      alignItems: 'center',
    },

    editHeadingText: {
      flex: 1,
      marginLeft: 12,
    },

    editTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.text,
    },

    editSubtitle: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 4,
    },

    inputGroup: {
      marginBottom: 15,
    },

    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 7,
    },

    inputContainer: {
      minHeight: 49,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 11,
      paddingHorizontal: 13,
      gap: 10,
    },

    input: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      paddingVertical: 11,
    },

    inputUnit: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.secondaryText,
    },

    editActionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 5,
    },

    saveButton: {
      flex: 1.4,
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor: theme.primary,
      borderRadius: 11,
      paddingHorizontal: 8,
    },

    cancelButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#424B45' : '#E3E8E0',
      borderRadius: 11,
      paddingHorizontal: 8,
    },

    cancelText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.text,
    },

    emptyCard: {
      backgroundColor: theme.card,
      padding: 30,
      borderRadius: 18,
      alignItems: 'center',
      marginTop: 5,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 12,
    },

    emptyText: {
      fontSize: 12,
      color: theme.secondaryText,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 19,
    },
  });
