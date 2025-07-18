import { Document, Page, StyleSheet, View, Text } from '@react-pdf/renderer';
import { PdfTable } from './PdfTable';
import type { Strategy, TaxReport } from '../../lib/pdfTypes';
import { StrategyCard } from './StrategyCard';
import { formatCurrency } from '../../lib/pdfUtils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  spacer: {
    height: 24, // 1.5x line height
    marginBottom: 12
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e40af'
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af'
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  summaryValue: {
    fontSize: 12
  }
});

export const TaxReportDocument = ({ report }: { report: TaxReport }) => {
  // Deduplicate strategies by title
  const uniqueStrategies = report.strategies.reduce((acc, strategy) => {
    if (!acc.some(s => s.title === strategy.title)) {
      acc.push(strategy);
    }
    return acc;
  }, [] as Strategy[]);

  return (
    <Document>
      {/* Header Page - Contains ONLY the report header */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Tax Optimization Report</Text>
          <Text style={styles.subtitle}>
            Comprehensive Tax Minimization Strategy Report
          </Text>
        </View>
      </Page>

      {/* Content Page - Starts with Strategies */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioritized Strategies</Text>
          {uniqueStrategies.map((strategy, i) => (
            <StrategyCard key={strategy.id || i} strategy={strategy} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Implementation Roadmap</Text>
          {report.roadmapTable ? (
            <PdfTable content={report.roadmapTable} />
          ) : report.roadmap?.length > 0 ? (
            <PdfTable
              content={`
| Quarter   | Actions                     | Deadlines    |
|-----------|-----------------------------|-------------|
${report.roadmap.map(item => 
  `| ${item.quarter.padEnd(9)} | ${item.actions.padEnd(27)} | ${item.deadlines.padEnd(12)} |`
).join('\n')}`}
            />
          ) : (
            <Text style={styles.summaryValue}>No roadmap data available</Text>
          )}
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Industry:</Text>
          <Text style={styles.summaryValue}>{report.executiveSummary.industry}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Revenue:</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(report.executiveSummary.revenue)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Current Tax Rate:</Text>
          <Text style={styles.summaryValue}>
            {report.executiveSummary.currentTaxRate.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Projected Savings:</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(report.executiveSummary.projectedSavings)}
          </Text>
        </View>
      </Page>
    </Document>
);
};
