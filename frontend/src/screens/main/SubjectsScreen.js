import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import ScreenHeader from '../../components/ui/ScreenHeader';
import CircularProgress from '../../components/ui/CircularProgress';
import { SUBJECTS } from '../../constants/config';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function SubjectsScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const subjectStats = useAnalyticsStore((state) => state.subjectStats);

  // Derive target items list map loops matching onboarding targets
  const items = Object.values(SUBJECTS).filter((sub) => {
    if (user?.target_exam === 'NEET' && sub.id === 'maths') return false;
    if (user?.target_exam === 'JEE' && sub.id === 'biology') return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Syllabus Vault" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Select a domain to map chapter distribution loops.
        </Text>

        <View style={styles.listCol}>
          {items.map((sub) => {
            const stat = subjectStats?.find((s) => s.subjectId === sub.id) || {
              accuracy: 0,
              chaptersDone: 0,
              chaptersTotal: 15,
            };

            return (
              <TouchableOpacity
                key={sub.id}
                style={[styles.card, SHADOWS.sm]}
                onPress={() => navigation.navigate('Chapters', { subjectId: sub.id, subjectName: sub.label })}
                activeOpacity={0.8}
              >
                <View style={styles.leftCol}>
                  <View style={[styles.emojiBox, { backgroundColor: sub.color + '15' }]}>
                    <Text style={styles.emoji}>{sub.emoji}</Text>
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.name}>{sub.label}</Text>
                    <Text style={styles.chaptersHint}>
                      {stat.chaptersDone} / {stat.chaptersTotal} Chapters unlocked
                    </Text>
                  </View>
                </View>

                <CircularProgress
                  value={stat.accuracy}
                  size={54}
                  strokeWidth={5}
                  color={sub.color}
                  label={`${stat.accuracy}%`}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING[5],
    gap: SPACING[5],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
  },
  listCol: {
    gap: SPACING[4],
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    flex: 1,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  chaptersHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    marginTop: SPACING[1],
  },
});
