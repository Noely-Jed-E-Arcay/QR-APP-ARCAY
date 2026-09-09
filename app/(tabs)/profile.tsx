// ============================================================================
// IMPORTS
// ============================================================================
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import {
  clearSession,
  getAttendanceCount,
  getCurrentStudentId,
  getStudent,
  updateStudentName,
  type Student,
} from '@/lib/database';

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Header Styles
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Name Styles
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pencil: {
    marginLeft: 8,
  },
  studentId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Edit Form Styles
  editBox: {
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Stats Styles
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});

// ============================================================================
// COMPONENT
// ============================================================================
export default function ProfileScreen() {
  // ---------- State
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // ---------- Effects & Callbacks
  const loadProfile = useCallback(() => {
    getCurrentStudentId().then((id) => {
      if (!id) {
        setStudent(null);
        setAttendanceCount(0);
        return;
      }
      getStudent(id).then((currentStudent) => {
        setStudent(currentStudent);
        setNameInput(currentStudent?.name ?? '');
      });
      getAttendanceCount(id).then(setAttendanceCount);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // ---------- Event Handlers
  const handleSaveName = () => {
    const name = nameInput.trim();
    if (!student || !name) {
      setMessage('Name cannot be empty.');
      return;
    }
    setMessage(null);
    updateStudentName(student.studentId, name).then(() => {
      setStudent({ ...student, name });
      setEditing(false);
    });
  };

  const handleLogout = () => {
    clearSession().then(() => {
      router.replace('/login');
    });
  };

  // ---------- Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      {student ? (
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {student.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>

          {editing ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={COLORS.textSecondary}
              />
              <AppButton
                theme="primary"
                title="Save Name"
                icon="checkmark"
                onPress={handleSaveName}
              />
              {message && <Text style={styles.message}>{message}</Text>}
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setMessage(null);
                setEditing(true);
              }}
            >
              <Text style={styles.name}>{student.name}</Text>
              <Ionicons
                name="pencil"
                size={16}
                color={COLORS.primary}
                style={styles.pencil}
              />
            </Pressable>
          )}

          <Text style={styles.studentId}>{student.studentId}</Text>

          <View style={styles.statRow}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.statText}>
              {attendanceCount} event{attendanceCount === 1 ? '' : 's'} attended
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.subtitle}>No student signed in.</Text>
      )}

      <AppButton
        title="Switch Account / Log Out"
        icon="log-out-outline"
        onPress={handleLogout}
      />
    </View>
  );
}