import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  RefreshControl 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { ApiService } from '../../api/client';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }) {
  // Tabs navigation splits requested in SP-7
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Subjects' | 'History'
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  
  // Custom accordion open trigger ID map
  const [subjectOpenId, setSubjectOpenId] = useState('physics');

  const fetchAnalytics = useCallback(async () => {
    try {
      const [dashRes, heatRes, histRes] = await Promise.all([
        ApiService.getDashboard().catch(() => null),
        ApiService.getChapterHeatmap().catch(() => null),
        ApiService.getHistory({ limit: 20 }).catch(() => null),
      ]);

      if (dashRes) setDashboardData(dashRes);
      if (heatRes) setHeatmapData(heatRes);
      if (histRes?.data) setHistoryList(histRes.data);
    } catch (err) {
      console.log('Analytics framework mappings populated inline fallback arrays securely.');
    } finally {
      // Apply baseline static mocks map loops seamlessly if network defaults missing
      setDashboardData((prev) => prev || {
        streak: 5,
        timeSpent: [30, 45, 60, 20, 90, 110, 85], // minutes per day
        accuracyTrend: [
          { value: 65, label: 'W1' },
          { value: 72, label: 'W2' },
          { value: 68, label: 'W3' },
          { value: 78, label: 'W4' },
        ],
        weak_chapters: [
          { id: 'c1', chapter_name: 'Rotational Motion', accuracy_percent: 28 },
          { id: 'c2', chapter_name: 'Chemical Equilibrium', accuracy_percent: 34 },
          { id: 'c3', chapter_name: 'Ray Optics', accuracy_percent: 39 },
        ],
        subjects: [
          { id: 'physics', name: 'Physics', overallAcc: 64, chaptersTotal: 15, chaptersDone: 6 },
          { id: 'chemistry', name: 'Chemistry', overallAcc: 51, chaptersTotal: 14, chaptersDone: 4 },
          { id: 'biology', name: 'Biology', overallAcc: 82, chaptersTotal: 22, chaptersDone: 10 },
        ],
      });

      setHeatmapData((prev) => (prev?.length ? prev : Array.from({ length: 24 }).map((_, idx) => ({
        id: String(idx),
        heat: Math.floor(Math.random() * 5),
        label: `Ch ${idx + 1}`,
      }))));

      setHistoryList((prev) => (prev?.length ? prev : [
        { id: 'h1', topic: 'Newtonian Pulleys', date: 'Today, 2:30 PM', acc: 85, mode: 'practice' },
        { id: 'h2', topic: 'Collision in 2D', date: 'Yesterday', acc: 40, mode: 'revision' },
        { id: 'h3', topic: 'Le Chatelier Principle', date: '3 days ago', acc: 60, mode: 'practice' },
      ]));

      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getHeatColor = (val) => {
    switch (val) {
      case 4: return COLORS.successDark;
      case 3: return COLORS.success;
      case 2: return COLORS.warning;
      case 1: return COLORS.danger;
      default: return COLORS.neutral200;
    }
  };

  const renderTabs = () => {
    const tabs = ['Overview', 'Subjects', 'History'];
    return (
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Tab 1: Overview
  const renderOverview = () => {
    // Format BarChart inputs for gifted-charts library
    const barData = dashboardData?.timeSpent?.map((val, idx) => ({
      value: val,
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx],
      frontColor: val > 60 ? COLORS.primary : COLORS.primaryMid,
    })) || [];

    // Format LineChart inputs
    const lineData = dashboardData?.accuracyTrend || [
      { value: 50, label: 'Start' },
      { value: 80, label: 'Now' },
    ];

    return (
      <Animated.View entering={FadeIn} style={styles.tabContent}>
        {/* Streak Calendar Grid Simulating 30-day blocks requested in SP-7 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>30-Day Consistency Grid</Text>
          <Text style={styles.cardSubtitle}>Continuous recall outputs mapping daily locks</Text>
          <View style={styles.calendarGrid}>
            {Array.from({ length: 30 }).map((_, i) => {
              // Mark last 12 indexes colored deterministically
              const done = i >= 30 - (dashboardData?.streak || 5);
              return (
                <View
                  key={i}
                  style={[
                    styles.calSquare,
                    { backgroundColor: done ? COLORS.primary : COLORS.neutral100 },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendHint}>🔥 Current Streak: <Text style={styles.boldText}>{dashboardData?.streak || 0} days</Text></Text>
          </View>
        </Card>

        {/* Weekly Minutes Spent BarChart integration via gifted-charts */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Study Minutes Distribution</Text>
          <Text style={styles.cardSubtitle}>Last 7 days practice mapping vectors</Text>
          <View style={styles.chartWrapper}>
            <BarChart
              data={barData}
              width={width - SPACING[16]}
              height={160}
              barWidth={22}
              spacing={20}
              roundedTop
              hideRules
              xAxisThickness={1}
              yAxisThickness={0}
              yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs }}
              xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs }}
              noOfSections={3}
            />
          </View>
        </Card>

        {/* Accuracy Trend LineChart integration via gifted-charts */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Average Accuracy Trend</Text>
          <Text style={styles.cardSubtitle}>Progress over previous 4-week spans</Text>
          <View style={styles.chartWrapper}>
            <LineChart
              data={lineData}
              width={width - SPACING[16]}
              height={140}
              thickness={3}
              color={COLORS.secondary}
              dataPointsColor={COLORS.secondaryDark}
              hideRules
              xAxisThickness={1}
              yAxisThickness={0}
              yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs }}
              xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs }}
              maxValue={100}
              noOfSections={4}
            />
          </View>
        </Card>
      </Animated.View>
    );
  };

  // Tab 2: Subjects Drill-down requested in SP-7
  const renderSubjects = () => {
    return (
      <Animated.View entering={FadeIn} style={styles.tabContent}>
        <Text style={styles.sectionHeader}>Domain Distribution</Text>

        {dashboardData?.subjects?.map((sub) => {
          const isOpen = subjectOpenId === sub.id;
          return (
            <Card key={sub.id} style={styles.subjectCard}>
              <TouchableOpacity
                style={styles.subjectTop}
                onPress={() => setSubjectOpenId(isOpen ? null : sub.id)}
                activeOpacity={0.7}
              >
                <View style={styles.subjectLeft}>
                  <Text style={styles.subjectName}>{sub.name}</Text>
                  <Text style={styles.subjectMeta}>
                    {sub.chaptersDone} / {sub.chaptersTotal} Chapters unlocked
                  </Text>
                </View>
                <Badge 
                  label={`${sub.overallAcc}% Acc`} 
                  variant={sub.overallAcc >= 70 ? 'success' : 'warning'} 
                />
                <Text style={styles.expandArrow}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Accordion Heatmap Grid mapping nested components */}
              {isOpen ? (
                <Animated.View entering={FadeIn} style={styles.subjectDetail}>
                  <Text style={styles.detailLabel}>Chapter Mastery Heatmap</Text>
                  <View style={styles.heatmapGrid}>
                    {heatmapData.map((h) => (
                      <View
                        key={h.id}
                        style={[styles.heatBox, { backgroundColor: getHeatColor(h.heat) }]}
                      />
                    ))}
                  </View>
                  <View style={styles.heatLegend}>
                    <Text style={styles.legendItem}>■ Weak</Text>
                    <Text style={styles.legendItem}>■ Moderate</Text>
                    <Text style={styles.legendItem}>■ Strong</Text>
                  </View>

                  {/* Targeted Drilldown Link mapping */}
                  <TouchableOpacity
                    style={styles.drillLink}
                    onPress={() => navigation.navigate('Chapters', { subjectId: sub.id, subjectName: sub.name })}
                  >
                    <Text style={styles.drillText}>Open Vault chapters →</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : null}
            </Card>
          );
        })}
      </Animated.View>
    );
  };

  // Tab 3: History FlatList loop requested in SP-7
  const renderHistory = () => {
    if (historyList.length === 0) {
      return <EmptyState title="No past session outputs mapped" />;
    }

    return (
      <Animated.View entering={FadeIn} style={styles.tabContent}>
        <Text style={styles.sectionHeader}>Attempt Audit Trail</Text>
        {historyList.map((item) => (
          <Card key={item.id} style={styles.historyCard}>
            <View style={styles.historyTop}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyTopic}>{item.topic}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>

              <View style={styles.historyRight}>
                <Badge 
                  label={`${item.acc}%`} 
                  variant={item.acc >= 70 ? 'success' : item.acc >= 40 ? 'warning' : 'danger'} 
                />
                <Badge 
                  label={item.mode} 
                  variant={item.mode === 'revision' ? 'secondary' : 'neutral'}
                  style={styles.modeBadge}
                />
              </View>
            </View>
          </Card>
        ))}
      </Animated.View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skelCol}>
      <Skeleton height={200} style={styles.skelCard} />
      <Skeleton height={200} style={styles.skelCard} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Performance Core" />
      {renderTabs()}

      <ScrollView
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          renderSkeleton()
        ) : (
          <>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Subjects' && renderSubjects()}
            {activeTab === 'History' && renderHistory()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING[4],
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  mainScroll: {
    padding: SPACING[4],
    paddingBottom: SPACING[12],
  },
  tabContent: {
    gap: SPACING[4],
  },
  card: {
    gap: SPACING[2],
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING[2],
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: SPACING[2],
  },
  calSquare: {
    width: (width - SPACING[16] - 54) / 10,
    height: (width - SPACING[16] - 54) / 10,
    borderRadius: RADIUS.sm,
  },
  legendRow: {
    marginTop: SPACING[2],
    alignItems: 'flex-end',
  },
  legendHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingTop: SPACING[2],
  },
  // Subjects accordion
  sectionHeader: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING[1],
  },
  subjectCard: {
    padding: SPACING[3],
  },
  subjectTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[2],
  },
  subjectLeft: {
    flex: 1,
  },
  subjectName: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  subjectMeta: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  expandArrow: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING[1],
  },
  subjectDetail: {
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING[2],
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heatBox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
  },
  heatLegend: {
    flexDirection: 'row',
    gap: SPACING[3],
    justifyContent: 'flex-end',
    marginTop: SPACING[1],
  },
  legendItem: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
  },
  drillLink: {
    alignSelf: 'flex-end',
    marginTop: SPACING[2],
  },
  drillText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  // History tab
  historyCard: {
    padding: SPACING[3],
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
    paddingRight: SPACING[2],
  },
  historyTopic: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  modeBadge: {
    marginTop: 2,
  },
  skelCol: {
    gap: SPACING[4],
  },
  skelCard: {
    borderRadius: RADIUS.lg,
  },
});
