
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

import { getHealthRecords } from '../database/database';

export default function HistoryScreen() {
  const database = useSQLiteContext();
  const [records, setRecords] = useState([]);

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={loadRecords} />
      }
    >
      <Text style={styles.title}>Health History</Text>
      <Text style={styles.subtitle}>
        View your previously saved health records.
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
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#183B65',
  },
});
