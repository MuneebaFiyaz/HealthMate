
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

import {
  getHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
} from '../database/database';

export default function HistoryScreen() {
  const database = useSQLiteContext();

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const loadRecords = async () => {
    try {
      const savedRecords = await getHealthRecords(database);
      setRecords(savedRecords);
    } catch (error) {
      console.error('Error loading health records:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [database])
  );

  const handleEdit = (record) => {
    setEditingId(record.id);
    setSteps(String(record.steps));
    setCalories(String(record.calories));
    setWater(String(record.water));
  };

  const handleUpdate = async () => {
    if (!steps.trim() || !calories.trim() || !water.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
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
      Alert.alert(
        'Invalid Information',
        'Please enter valid whole numbers greater than or equal to zero.'
      );
      return;
    }

    try {
      const originalRecord = records.find(
        record => record.id === editingId
      );

      if (!originalRecord) {
        Alert.alert('Error', 'The selected record could not be found.');
        return;
      }

      await updateHealthRecord(database, editingId, {
        ...updatedRecord,
        date: originalRecord.date,
      });

      setEditingId(null);
      setSteps('');
      setCalories('');
      setWater('');

      await loadRecords();

      Alert.alert('Success', 'Health record updated successfully.');
    } catch (error) {
      console.error('Error updating health record:', error);
      Alert.alert('Error', 'Could not update the health record.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSteps('');
    setCalories('');
    setWater('');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this health record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHealthRecord(database, id);

              if (editingId === id) {
                cancelEdit();
              }

              await loadRecords();

              Alert.alert(
                'Success',
                'Health record deleted successfully.'
              );
            } catch (error) {
              console.error('Error deleting health record:', error);
              Alert.alert('Error', 'Could not delete the health record.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={loadRecords} />
      }
    >
      <Text style={styles.title}>Health History</Text>
      <Text style={styles.subtitle}>
        View and manage your previous health records.
      </Text>

      {records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No health records found.
          </Text>
        </View>
      ) : (
        records.map(record => (
          <View style={styles.recordCard} key={record.id}>
            <Text style={styles.date}>{record.date}</Text>

            {editingId === record.id ? (
              <View>
                <Text style={styles.label}>Steps</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={steps}
                  onChangeText={setSteps}
                />

                <Text style={styles.label}>Calories Burned (kcal)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />

                <Text style={styles.label}>Water Intake (ml)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={water}
                  onChangeText={setWater}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdate}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={cancelEdit}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.recordRow}>
                  <Text style={styles.label}>Steps</Text>
                  <Text style={styles.value}>{record.steps}</Text>
                </View>

                <View style={styles.recordRow}>
                  <Text style={styles.label}>Calories Burned</Text>
                  <Text style={styles.value}>{record.calories} kcal</Text>
                </View>

                <View style={styles.recordRow}>
                  <Text style={styles.label}>Water Intake</Text>
                  <Text style={styles.value}>{record.water} ml</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(record)}
                  >
                    <Text style={styles.buttonText}>Edit Record</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(record.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#183B65',
    marginTop: 35,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    marginBottom: 25,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#718096',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    elevation: 2,
  },
  date: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2878D0',
    marginBottom: 15,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#183B65',
  },
  input: {
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#DCE8F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2878D0',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D9534F',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2878D0',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#718096',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
