
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

export default function AddRecordScreen() {
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  const handleSave = () => {
    if (!steps || !calories || !water) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const record = {
      steps: Number(steps),
      calories: Number(calories),
      water: Number(water),
      date: new Date().toISOString().split('T')[0],
    };

    Alert.alert(
      'Record Created',
      `Steps: ${record.steps}\nCalories: ${record.calories} kcal\nWater: ${record.water} ml`
    );

    setSteps('');
    setCalories('');
    setWater('');
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
