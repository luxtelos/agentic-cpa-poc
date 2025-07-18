import { Document, Page, StyleSheet, View, Text } from '@react-pdf/renderer';
import { PdfTable } from './PdfTable';
import type { Strategy, TaxReport, PdfTableData } from '../../lib/pdfTypes';
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
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10
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

  const renderSection = (title: string, content?: string | PdfTableData) => {
    if (!content) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {typeof content === 'string' ? (
          <PdfTable content={content} />
        ) : (
          <PdfTable {...content} />
        )}
      </View>
    );
  };

  const renderTextSection = (title: string, content?: string) => {
    if (!content) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.paragraph}>{content}</Text>
      </View>
    );
  };

  return (
    <Document>
      {/* Header Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Tax Optimization Report</Text>
          <Text style={styles.subtitle}>
            Comprehensive Tax Minimization Strategy Report
          </Text>
        </View>
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
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
        </View>

        {/* Peer Benchmarking */}
        {renderTextSection('Peer Benchmarking Results', report.executiveSummary.benchmarkingNotes)}

        {/* Prioritized Strategies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioritized Strategies</Text>
          {uniqueStrategies.map((strategy, i) => (
            <StrategyCard key={strategy.id || i} strategy={strategy} />
          ))}
        </View>
      </Page>

      {/* Additional Pages */}
      <Page size="A4" style={styles.page}>
        {/* Implementation Roadmap */}
        {renderSection('Implementation Roadmap', report.roadmapTable)}

        {/* Compliance Calendar */}
        {renderSection('Compliance Calendar', report.complianceCalendarTable)}

        {/* Projected Savings */}
        {renderSection('Total Projected Savings', report.projectedSavingsTable)}
      </Page>

      {/* Risk Assessment Page */}
      {report.riskAssessment && (
        <Page size="A4" style={styles.page}>
          {renderTextSection('Risk Assessment & Compliance', report.riskAssessment)}
        </Page>
      )}

      {/* Legal Disclaimer */}
      {report.legalDisclaimer && (
        <Page size="A4" style={styles.page}>
          {renderTextSection('Legal Disclaimer', report.legalDisclaimer)}
        </Page>
      )}
    </Document>
  );
};
