// ============================================================================
// IMPORTS
// ============================================================================
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import {
  createStudent,
  getAllStudents,
  setCurrentStudent,
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
  },

  // Header Styles
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  // List Styles
  list: {
    flexGrow: 0,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  studentRowPressed: {
    backgroundColor: COLORS.surface,
  },
  studentText: {
    flex: 1,
    marginHorizontal: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  studentId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Form Styles
  newStudentBox: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
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
});

// ============================================================================
// COMPONENT
// ============================================================================
export default function LoginScreen() {
  // ---------- State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // ---------- Effects & Callbacks
  const loadStudents = useCallback(() => {
    setLoading(true);
    getAllStudents().then((rows) => {
      setStudents(rows);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  // ---------- Event Handlers
  const continueAs = (student: Student) => {
    setCurrentStudent(student.studentId).then(() => {
      router.replace('/');
    });
  };

  const handleAddStudent = () => {
    const name = newName.trim();
    if (!name) {
      setMessage('Enter your name to continue.');
      return;
    }
    setMessage(null);
    createStudent(name).then((student) => continueAs(student));
  };

  // ---------- Render
  return (
    <SafeAreaView style={styles.container}>
      <Header title="QR Attendance" />
      <Text style={styles.title}>Who&apos;s attending?</Text>
      <Text style={styles.subtitle}>
        Pick your name, or add a new student to get started.
      </Text>

      {loading ? (
        <Text style={styles.subtitle}>Loading...</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.studentId}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.studentRow,
                pressed && styles.studentRowPressed,
              ]}
              onPress={() => continueAs(item)}
            >
              <Ionicons
                name="person-circle-outline"
                size={28}
                color={COLORS.primary}
              />
              <View style={styles.studentText}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentId}>{item.studentId}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSecondary}
              />
            </Pressable>
          )}
        />
      )}

      <View style={styles.newStudentBox}>
        <Text style={styles.label}>New student?</Text>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.textSecondary}
          returnKeyType="done"
          onSubmitEditing={handleAddStudent}
        />
        {message && <Text style={styles.message}>{message}</Text>}
        <AppButton
          theme="primary"
          title="Continue as New Student"
          icon="person-add-outline"
          onPress={handleAddStudent}
        />
      </View>
    </SafeAreaView>
  );
}