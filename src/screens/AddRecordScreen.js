
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { addHealthRecord } from '../database/database';

export default function AddRecordScreen() {
  const database = useSQLiteContext();

  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const handleSave = async () => {
    if (!steps.trim() || !calories.trim() || !water.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const record = {
      steps: Number(steps),
      calories: Number(calories),
      water: Number(water),
      date: [
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, '0'),
        String(new Date().getDate()).padStart(2, '0'),
      ].join('-'),
    };

    const values = [record.steps, record.calories, record.water];

    if (values.some(value => !Number.isInteger(value) || value < 0)) {
      Alert.alert(
        'Invalid Information',
        'Please enter valid whole numbers greater than or equal to zero.'
      );
      return;
    }

    try {
      await addHealthRecord(database, record);

      Alert.alert('Success', 'Your health record has been saved.');

      setSteps('');
      setCalories('');
      setWater('');
    } catch (error) {
      console.error('Error saving health record:', error);
      Alert.alert('Error', 'Could not save your health record.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Health Record</Text>
      <Text style={styles.subtitle}>
        Enter your daily health information below.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Steps</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of steps"
          keyboardType="numeric"
          value={steps}
          onChangeText={setSteps}
        />

        <Text style={styles.label}>Calories Burned (kcal)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter calories"
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />

        <Text style={styles.label}>Water Intake (ml)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter water intake"
          keyboardType="numeric"
          value={water}
          onChangeText={setWater}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Record</Text>
        </TouchableOpacity>
      </View>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#183B65',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#DCE8F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#2878D0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
