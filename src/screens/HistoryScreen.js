
import { View, Text, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health History</Text>
      <Text style={styles.subtitle}>
        Your previous health records will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#183B65',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 10,
    textAlign: 'center',
  },
});
