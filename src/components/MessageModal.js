
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function MessageModal({
  visible,
  title,
  message,
  type = 'success',
  onClose,
  onConfirm,
  confirmText = 'Confirm',
}) {
  const { theme, isDarkMode } = useTheme();

  const styles = createStyles(theme, isDarkMode);

  const icons = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    warning: 'alert-circle',
    confirm: 'help-circle',
  };

  const iconColors = {
    success: '#26966D',
    error: '#D9534F',
    warning: '#E5A12B',
    confirm: theme.primary,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${iconColors[type]}20` },
            ]}
          >
            <Ionicons
              name={icons[type]}
              size={38}
              color={iconColors[type]}
            />
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          {type === 'confirm' ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.okButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
    },

    modalCard: {
      width: '100%',
      maxWidth: 350,
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 25,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 10,
    },

    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 17,
    },

    title: {
      fontSize: 21,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
    },

    message: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.secondaryText,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 23,
    },

    okButton: {
      width: '100%',
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },

    okText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
    },

    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 10,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: theme.input,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },

    cancelText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },

    confirmButton: {
      flex: 1,
      backgroundColor: '#D9534F',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },

    confirmText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
