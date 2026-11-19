
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
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
  preview = null,
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
    success: theme.success,
    error: theme.danger,
    warning: theme.warning,
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
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
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

            <Text
              style={[
                styles.message,
                preview && styles.messageWithPreview,
              ]}
            >
              {message}
            </Text>

            {preview && (
              <View style={styles.previewCard}>
                <Text style={styles.previewDate}>{preview.date}</Text>

                {preview.previous && (
                  <View style={styles.previewComparisonHeader}>
                    <View style={styles.previewHeaderSpacer} />
                    <Text style={styles.previewColumnHeader}>Before</Text>
                    <Text style={styles.previewColumnHeader}>After</Text>
                  </View>
                )}

                {[
                  {
                    icon: 'footsteps-outline',
                    label: 'Steps',
                    value: preview.steps.toLocaleString(),
                    previousValue: preview.previous
                      ? preview.previous.steps.toLocaleString()
                      : null,
                    color: theme.primary,
                  },
                  {
                    icon: 'flame-outline',
                    label: 'Calories',
                    value: `${preview.calories.toLocaleString()} kcal`,
                    previousValue: preview.previous
                      ? `${preview.previous.calories.toLocaleString()} kcal`
                      : null,
                    color: theme.calories,
                  },
                  {
                    icon: 'water-outline',
                    label: 'Water',
                    value: `${preview.water.toLocaleString()} ml`,
                    previousValue: preview.previous
                      ? `${preview.previous.water.toLocaleString()} ml`
                      : null,
                    color: theme.water,
                  },
                ].map((item) => (
                  <View key={item.label} style={styles.previewRow}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.color}
                    />
                    <Text style={styles.previewLabel}>{item.label}</Text>
                    {preview.previous ? (
                      <>
                        <Text style={styles.previewColumnValue}>
                          {item.previousValue}
                        </Text>
                        <Text style={styles.previewColumnValue}>
                          {item.value}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.previewValue}>{item.value}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {type === 'confirm' ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.okButton}
                onPress={onClose}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      paddingHorizontal: 20,
    },

    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },

    modalScrollView: {
      flex: 1,
    },

    modalCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 22,
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

    messageWithPreview: {
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

    previewComparisonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },

    previewHeaderSpacer: {
      flex: 1,
      marginLeft: 27,
    },

    previewColumnHeader: {
      width: 65,
      fontSize: 11,
      fontWeight: '600',
      color: theme.secondaryText,
      textAlign: 'right',
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

    previewColumnValue: {
      width: 65,
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'right',
    },

    previewValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.text,
    },

    okButton: {
      width: '100%',
      backgroundColor: theme.primaryButton,
      minHeight: 48,
      paddingVertical: 13,
      borderRadius: 13,
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
      backgroundColor: theme.dangerButton,
      minHeight: 48,
      paddingVertical: 13,
      borderRadius: 13,
      alignItems: 'center',
    },

    confirmText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
