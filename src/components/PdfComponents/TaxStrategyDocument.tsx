import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TaxStrategyData } from '../../lib/taxReportTypes';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 20
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5
  },
  tableHeader: {
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5
  }
});

const TaxStrategyDocument = ({ children }: { children: React.ReactNode }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {children}
    </Page>
  </Document>
);

const ExecutiveSummary = ({ data }: { data: TaxStrategyData['summary'] }) => (
  <View style={styles.section}>
    <Text style={styles.header}>Executive Summary</Text>
    <Text style={styles.text}>Company: {data.companyName}</Text>
    <Text style={styles.text}>Effective Tax Rate: {data.effectiveTaxRate}%</Text>
    <Text style={styles.text}>Industry Benchmark: {data.industryBenchmark}%</Text>
    <Text style={styles.text}>Potential Annual Savings: ${data.potentialSavings.toLocaleString()}</Text>
  </View>
);

const StrategyList = ({ items }: { items: TaxStrategyData['strategies'] }) => (
  <View style={styles.section}>
    <Text style={styles.header}>Prioritized Strategies</Text>
    {items.map((strategy, index) => (
      <View key={index} style={[styles.section, { marginLeft: 10 }]}>
        <Text style={styles.subheader}>Strategy #{index + 1}: {strategy.name}</Text>
        <Text style={styles.text}>- Savings: ${strategy.savings.toLocaleString()}</Text>
        <Text style={styles.text}>- Timeline: {strategy.timeline}</Text>
        <Text style={styles.text}>- Steps:</Text>
        {strategy.steps.map((step, i) => (
          <Text key={i} style={[styles.text, { marginLeft: 10 }]}>• {step}</Text>
        ))}
      </View>
    ))}
  </View>
);

const ImplementationRoadmap = ({ milestones }: { milestones: TaxStrategyData['roadmap'] }) => (
  <View style={styles.section}>
    <Text style={styles.header}>Implementation Roadmap</Text>
    {milestones.map((milestone, index) => (
      <View key={index} style={[styles.section, { marginLeft: 10 }]}>
        <Text style={styles.subheader}>{milestone.quarter}</Text>
        <View style={styles.table}>
          {milestone.actions.map((action, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.text]}>{action}</Text>
              <Text style={[styles.tableCell, styles.text]}>{milestone.deadlines[i]}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);

const ComplianceCalendar = ({ deadlines }: { deadlines: TaxStrategyData['deadlines'] }) => (
  <View style={styles.section}>
    <Text style={styles.header}>Compliance Calendar</Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.tableCell}>Month</Text>
        <Text style={styles.tableCell}>Requirements</Text>
      </View>
      {deadlines.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.text]}>{item.month}</Text>
          <Text style={[styles.tableCell, styles.text]}>{item.requirements.join(', ')}</Text>
        </View>
      ))}
    </View>
  </View>
);

export default TaxStrategyDocument;
export { ExecutiveSummary, StrategyList, ImplementationRoadmap, ComplianceCalendar };
