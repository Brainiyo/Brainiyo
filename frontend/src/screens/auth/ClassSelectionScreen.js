import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { THEME } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export default function ClassSelectionScreen({ navigation }) {
  const setStudentClass = useAppStore(state => state.setStudentClass);

  const handleSelectClass = (studentClass) => {
    setStudentClass(studentClass);
    navigation.navigate('Login');
  };

  const classes = [
    { id: 11, label: 'Class 11' },
    { id: 12, label: 'Class 12' },
    { id: 'Dropper', label: 'Dropper / Repeater' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.question}>Select your class</Text>
        <Text style={styles.subtitle}>We'll personalize your curriculum</Text>
        
        <View style={styles.optionsContainer}>
          {classes.map((cls) => (
            <TouchableOpacity 
              key={cls.id}
              style={styles.button}
              onPress={() => handleSelectClass(cls.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{cls.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.background,
  },
  header: {
    padding: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: THEME.SIZES.font,
    color: THEME.COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  question: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: THEME.SIZES.font,
    color: THEME.COLORS.textSecondary,
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  button: {
    height: 64,
    borderRadius: THEME.SIZES.radius,
    backgroundColor: THEME.COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.COLORS.border,
  },
  buttonText: {
    color: THEME.COLORS.text,
    fontSize: THEME.SIZES.medium,
    fontWeight: '600',
  },
});
