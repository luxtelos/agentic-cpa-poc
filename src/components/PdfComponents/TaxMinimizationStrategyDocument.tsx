import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  Link
} from '@react-pdf/renderer';
import { TaxStrategyData } from '../../lib/taxReportTypes';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  section: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1pt solid #333',
    paddingBottom: 3
  },
  paragraph: {
    marginBottom: 10
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 4
  },
  strategyRow: {
    marginBottom: 5
  },
  timelineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  timelineItem: {
    width: '45%',
    marginRight: '5%',
    marginBottom: 8
  },
  timelineDate: {
    fontWeight: 'bold'
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  bulletPoint: {
    width: 10
  },
  footnote: {
    fontSize: 7,
    lineHeight: 1.1,
    marginTop: 10
  }
});

const Header = ({ report }: { report: TaxStrategyData }) => (
  <View style={styles.header} fixed>
    <Text style={styles.title}>TAX MINIMIZATION STRATEGY REPORT</Text>
    <Text>Business: {report.summary.companyName}</Text>
    <Text>Analysis Date: {new Date().toLocaleDateString('en-US')}</Text>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text render={({ pageNumber, totalPages }) => 
      `Page ${pageNumber} of ${totalPages}`
    } />
  </View>
);

export const TaxMinimizationStrategyDocument = ({ report }: { report: TaxStrategyData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header report={report} />
      
      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
        <Text style={styles.paragraph}>
          Current Effective Tax Rate: {report.summary.effectiveTaxRate}%
        </Text>
        <Text style={styles.paragraph}>
          Industry Benchmark: {report.summary.industryBenchmark}%
        </Text>
        <Text style={styles.paragraph}>
          Total Potential Annual Savings: ${report.summary.potentialSavings.toLocaleString()}
        </Text>
      </View>

      {/* Prioritized Strategies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRIORITIZED STRATEGIES</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Strategy</Text>
            <Text style={styles.tableCell}>Estimated Savings</Text>
            <Text style={styles.tableCell}>Timeline</Text>
          </View>
          {report.strategies.map((strategy) => (
            <View style={styles.tableRow} key={strategy.name}>
              <Text style={[styles.tableCell, {flex: 3}]}>{strategy.name}</Text>
              <Text style={styles.tableCell}>${strategy.savings.toLocaleString()}</Text>
              <Text style={styles.tableCell}>{strategy.timeline}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Implementation Roadmap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IMPLEMENTATION ROADMAP</Text>
        <View style={styles.timelineContainer}>
          {report.roadmap.map((item) => (
            <View style={styles.timelineItem} key={item.quarter}>
              <Text style={styles.timelineDate}>{item.quarter}</Text>
              {item.actions.map((action) => (
                <Text key={`${item.quarter}-${action}`} style={styles.paragraph}>• {action}</Text>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Compliance Calendar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMPLIANCE CALENDAR</Text>
        {report.deadlines.map((deadline) => (
          <View key={deadline.month} style={styles.paragraph}>
            <Text style={{fontWeight: 'bold'}}>{deadline.month}:</Text>
            <Text> {deadline.requirements.join(', ')}</Text>
          </View>
        ))}
      </View>
      
      <Footer />
    </Page>
  </Document>
);
