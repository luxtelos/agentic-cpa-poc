import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { Strategy } from '../../lib/pdfTypes';
import { formatCurrency } from '../../lib/pdfUtils';

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    padding: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  savings: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: 'bold'
  },
  timeline: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8
  },
  step: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 8,
    position: 'relative'
  },
  stepBullet: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 4,
    height: 4,
    backgroundColor: '#1e40af',
    borderRadius: 2
  }
});

export const StrategyCard = ({ strategy }: { strategy: Strategy }) => (
  <View style={styles.container} wrap={false}>
    <View style={styles.header}>
      <Text style={styles.title}>{strategy.title}</Text>
      <Text style={styles.savings}>
        {formatCurrency(strategy.savings)} savings
      </Text>
    </View>
    <Text style={styles.timeline}>
      Timeline: {strategy.timeline} • Complexity: {strategy.complexity}/10
    </Text>
    {strategy.steps.map((step) => (
      <View key={`${strategy.title}-${step}`} style={styles.step}>
        <View style={styles.stepBullet} />
        <Text>{step}</Text>
      </View>
    ))}
  </View>
);
