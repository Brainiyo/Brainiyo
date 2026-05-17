import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import MathJax from 'react-native-mathjax';
import { usePracticeStore } from '../../store/usePracticeStore';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function BookmarksScreen({ navigation }) {
  // Read bookmarks sequence array mapping persist storage outputs requested in SP-10
  const bookmarks = usePracticeStore((state) => state.bookmarks);
  const removeBookmark = usePracticeStore((state) => state.removeBookmark);

  // Tabs filters array segmentation map loops
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics'

  const filteredList = bookmarks.filter((item) => {
    if (activeTab === 'All') return true;
    const sub = item.subject || 'Physics'; // fallback
    return sub.toLowerCase() === activeTab.toLowerCase();
  });

  const confirmDelete = (idTarget) => {
    Alert.alert(
      'Remove Bookmark?',
      'Item will be detached from your optimal offline archive pool permanent list.',
      [
        { text: 'Keep', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => removeBookmark(idTarget) 
        },
      ]
    );
  };

  const handlePracticeIsolated = (itemTarget) => {
    // Pass direct isolated practice routing context variables
    navigation.navigate('Practice', { 
      topicId: itemTarget.topicId || 'isolated-review',
      mode: 'revision', 
    });
  };

  const renderTabs = () => {
    const tabs = ['All', 'Physics', 'Chemistry', 'Biology', 'Mathematics'];
    return (
      <View style={styles.tabRow}>
        <FlatList
          horizontal
          data={tabs}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
          renderItem={({ item }) => {
            const isActive = activeTab === item;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const mathOptions = {
    messageStyle: 'none',
    extensions: ['tex2jax.js'],
    jax: ['input/TeX', 'output/HTML-CSS'],
    tex2jax: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
    },
  };

  const renderItem = ({ item }) => {
    return (
      <Animated.View entering={FadeIn}>
        <Card style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.chipsRow}>
              <Badge label={item.subject || 'Physics'} variant="primary" />
              {item.difficulty ? (
                <Badge 
                  label={item.difficulty} 
                  variant={item.difficulty === 'hard' ? 'danger' : 'warning'} 
                />
              ) : null}
            </View>

            <TouchableOpacity 
              style={styles.trashBtn} 
              onPress={() => confirmDelete(item.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.trashIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qBody}>
            <MathJax
              mathJaxOptions={mathOptions}
              html={`<div style="font-size: 15px; color: ${COLORS.text}; font-family: sans-serif; line-height: 1.5;">${item.body || 'Question snippet template'}</div>`}
            />
          </View>

          {/* Correct answer reference baseline mapping */}
          <View style={styles.ansBox}>
            <Text style={styles.ansHint}>
              Correct Key: <Text style={styles.boldAns}>{item.correct_option || 'C'}</Text>
            </Text>
          </View>

          {/* Isolated drill Practice integration loop requested in SP-10 */}
          <TouchableOpacity
            style={styles.practiceTrigger}
            onPress={() => handlePracticeIsolated(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.triggerLabel}>Practice Isolated Context ↗</Text>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Saved Vault Pool" showBack />
      {renderTabs()}

      {filteredList.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyEmoji}>🔖</Text>}
          title="No bookmarks indexed"
          subtitle="Star active question strings during practice runs to populate continuous recall target vectors."
        />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listCol}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tabScroll: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    gap: SPACING[2],
  },
  tabChip: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryMid,
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  listCol: {
    padding: SPACING[4],
    gap: SPACING[4],
    paddingBottom: SPACING[12],
  },
  card: {
    gap: SPACING[3],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  trashBtn: {
    padding: SPACING[1],
  },
  trashIcon: {
    fontSize: 18,
  },
  qBody: {
    minHeight: 50,
  },
  ansBox: {
    backgroundColor: COLORS.successLight + '20',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  ansHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.successDark,
  },
  boldAns: {
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  practiceTrigger: {
    marginTop: SPACING[1],
    paddingVertical: SPACING[2],
    alignItems: 'center',
    backgroundColor: COLORS.neutral100,
    borderRadius: RADIUS.md,
  },
  triggerLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  emptyEmoji: {
    fontSize: 40,
  },
});
