// FILE: src/screens/WeightChartScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { loadHistory } from '../weight/weightStore';
import { useTranslation } from 'react-i18next';

import '../i18n/weightTranslations';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#F0F5ED';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

export const WeightChartScreen: React.FC = () => {
  const { t } = useTranslation();

  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const hist = await loadHistory();

      setLabels(hist.map((h) => h.dateISO.slice(5)));
      setData(hist.map((h) => h.kg));
    })();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 36;

  const latestWeight = data.length > 0 ? data[data.length - 1] : null;
  const firstWeight = data.length > 0 ? data[0] : null;

  const diff = useMemo(() => {
    if (latestWeight === null || firstWeight === null) return null;
    return +(latestWeight - firstWeight).toFixed(1);
  }, [latestWeight, firstWeight]);

  const minWeight = useMemo(() => {
    if (!data.length) return null;
    return Math.min(...data);
  }, [data]);

  const maxWeight = useMemo(() => {
    if (!data.length) return null;
    return Math.max(...data);
  }, [data]);

  return (
    <View style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View pointerEvents="none" style={st.glowTop} />
      <View pointerEvents="none" style={st.glowBottom} />

      <ScrollView
        style={st.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.content}
      >
        <View style={st.hero}>
          <View style={st.kickerPill}>
            <Text style={st.kickerText}>
              {t(
                'weight.chart_kicker',
                'WEIGHT TRACKING',
              )}
            </Text>
          </View>

          <Text style={st.title}>
            {t('weight.chart_title', 'Weight Tracking')}
          </Text>

          <Text style={st.subtitle}>
            {t(
              'weight.chart_subtitle',
              'Track your weight, changes and body progress over time.',
            )}
          </Text>
        </View>

        {data.length === 0 ? (
          <View style={st.emptyCard}>
            <View style={st.emptyIcon}>
              <Text style={st.emptyIconText}>⚖️</Text>
            </View>

            <Text style={st.emptyTitle}>
              {t(
                'weight.chart_empty_title',
                'No weight data yet',
              )}
            </Text>

            <Text style={st.emptyText}>
              {t(
                'weight.chart_empty',
                'After you log your weight, your progress chart will appear here.',
              )}
            </Text>
          </View>
        ) : (
          <>
            <View style={st.statGrid}>
              <View style={st.statBox}>
                <Text style={st.statIcon}>⚖️</Text>
                <Text style={st.statValue}>
                  {latestWeight ?? '—'}
                  <Text style={st.statUnit}> kg</Text>
                </Text>
                <Text style={st.statLabel}>
                  {t('weight.latest', 'Latest')}
                </Text>
              </View>

              <View style={st.statBox}>
                <Text style={st.statIcon}>
                  {diff !== null && diff <= 0 ? '📉' : '📈'}
                </Text>
                <Text
                  style={[
                    st.statValue,
                    diff !== null && diff <= 0 ? st.goodValue : st.warnValue,
                  ]}
                >
                  {diff !== null && diff > 0 ? '+' : ''}
                  {diff ?? '—'}
                  <Text style={st.statUnit}> kg</Text>
                </Text>
                <Text style={st.statLabel}>
                  {t('weight.change', 'Change')}
                </Text>
              </View>
            </View>

            <View style={st.card}>
              <View style={st.cardHeader}>
                <View>
                  <Text style={st.cardTitle}>
                    {t('weight.progress', 'Progress chart')}
                  </Text>

                  <Text style={st.cardSub}>
                    {labels.length} {t('weight.records', 'records')}
                  </Text>
                </View>

                <View style={st.liveBadge}>
                  <Text style={st.liveBadgeText}>
                    {t(
                      'weight.live',
                      'LIVE',
                    )}
                  </Text>
                </View>
              </View>

              <LineChart
                data={{
                  labels,
                  datasets: [
                    {
                      data,
                      strokeWidth: 3,
                    },
                  ],
                }}
                width={chartWidth}
                height={250}
                yAxisSuffix=" kg"
                withInnerLines
                withOuterLines={false}
                withShadow={false}
                bezier
                chartConfig={{
                  backgroundColor: BG,
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#F0F5ED',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(99, 201, 52, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(82, 96, 87, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: NEON,
                    fill: BG,
                  },
                  propsForBackgroundLines: {
                    stroke: 'rgba(109, 120, 111, 0.17)',
                    strokeDasharray: '4 6',
                  },
                }}
                style={st.chart}
              />
            </View>

            <View style={st.summaryCard}>
              <Text style={st.summaryTitle}>
                {t('weight.summary', 'Summary')}
              </Text>

              <View style={st.summaryRow}>
                <View style={st.summaryItem}>
                  <Text style={st.summaryLabel}>
                    {t('weight.min', 'Lowest')}
                  </Text>
                  <Text style={st.summaryValue}>
                    {minWeight ?? '—'} kg
                  </Text>
                </View>

                <View style={st.divider} />

                <View style={st.summaryItem}>
                  <Text style={st.summaryLabel}>
                    {t('weight.max', 'Highest')}
                  </Text>
                  <Text style={st.summaryValue}>
                    {maxWeight ?? '—'} kg
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 160,
  },

  glowTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(24, 163, 155, 0.10)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 60,
    left: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 201, 52, 0.10)',
  },

  hero: {
    marginBottom: 18,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.45)',
    backgroundColor: 'rgba(24, 163, 155, 0.10)',
    marginBottom: 14,
  },
  kickerText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: TEXT,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: '#455047',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },

  statGrid: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.24)',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  statValue: {
    color: TEXT,
    fontSize: 25,
    fontWeight: '900',
  },
  statUnit: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '800',
  },
  statLabel: {
    color: MUTED,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '800',
  },
  goodValue: {
    color: NEON,
  },
  warnValue: {
    color: '#F59E0B',
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.24)',
    overflow: 'hidden',
    shadowColor: '#18A39B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 18,
  },
  cardSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: 'rgba(99, 201, 52, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.42)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveBadgeText: {
    color: NEON,
    fontSize: 11,
    fontWeight: '900',
  },
  chart: {
    borderRadius: 18,
    marginLeft: -6,
  },

  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.18)',
  },
  summaryTitle: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: CARD_2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.14)',
    padding: 13,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryValue: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(109, 120, 111, 0.20)',
    marginHorizontal: 14,
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.24)',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 201, 52, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIconText: {
    fontSize: 30,
  },
  emptyTitle: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyText: {
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
});

export default WeightChartScreen;