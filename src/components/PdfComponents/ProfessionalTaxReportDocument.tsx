import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer } from '@react-pdf/renderer';
import type { TaxReport, Strategy } from '../../lib/pdfTypes';
import { formatCurrency, formatPercentage } from '../../lib/pdfUtils';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/fonts/Helvetica.ttf' },
    { src: '/fonts/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    position: 'relative'
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 10,
    fontSize: 10,
    color: '#4b5563'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center'
  },
  titleContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #1e40af'
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af'
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  column: {
    width: '48%'
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1px solid #f3f4f6'
  },
  metricLabel: {
    fontSize: 10,
    color: '#374151',
    width: '60%'
  },
  metricValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    width: '40%',
    textAlign: 'right'
  },
  strategyTable: {
    width: '100%',
    border: '1px solid #e5e7eb',
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 5,
    borderBottom: '1px solid #e5e7eb'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1px solid #f3f4f6'
  },
  tableCell: {
    fontSize: 8,
    padding: 3
  },
  headerCell: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 3
  },
  timelineContainer: {
    marginTop: 15
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8
  },
  timelineQuarter: {
    width: 50,
    fontWeight: 'bold',
    fontSize: 9
  },
  timelineContent: {
    flex: 1,
    fontSize: 9
  },
  riskContainer: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderLeft: '3px solid #ef4444',
    marginTop: 15
  },
  disclaimer: {
    fontSize: 7,
    lineHeight: 1.2,
    marginTop: 10
  }
});

interface ProfessionalTaxReportDocumentProps {
  report: TaxReport;
  analysisDate: string;
}

export const ProfessionalTaxReportDocument = ({ 
  report, 
  analysisDate 
}: ProfessionalTaxReportDocumentProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text>Business: {report.companyInfo?.name || 'N/A'}</Text>
          <Text>Analysis Date: {analysisDate}</Text>
          <Text>Tax Year Analyzed: {report.companyInfo?.taxYear || 'N/A'}</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>TAX MINIMIZATION STRATEGY REPORT</Text>
          <Text style={styles.subtitle}>Prepared for {report.companyInfo?.name || 'N/A'}</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
          
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Effective corporate tax rate</Text>
                <Text style={styles.metricValue}>
                  {report.executiveSummary?.currentTaxRate ? 
                    formatPercentage(report.executiveSummary.currentTaxRate) : 'N/A'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Pre-tax book income</Text>
                <Text style={styles.metricValue}>
                  {report.executiveSummary?.revenue ? 
                    formatCurrency(report.executiveSummary.revenue) : 'N/A'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total potential annual federal tax savings</Text>
                <Text style={styles.metricValue}>
                  {report.executiveSummary?.projectedSavings ? 
                    formatCurrency(report.executiveSummary.projectedSavings) : 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.column}>
              <Text style={styles.metricLabel}>Peer Benchmark (NAICS {report.companyInfo?.naicsCode || 'N/A'})</Text>
              <Text style={{fontSize: 9, marginBottom: 10}}>
                19-22% typical cash ETR
              </Text>
              <Text style={styles.metricLabel}>Analysis:</Text>
              <Text style={{fontSize: 9}}>
                The company's taxable income was reduced to $43,458 after an $87,190 NOL carryforward, 
                yet a full 21% flat corporate rate still applied. Compared with peers, cash ETR is 
                competitive on book income but high on taxable income, indicating under-utilized incentives.
              </Text>
            </View>
          </View>
        </View>

        {/* Prioritized Strategies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIORITIZED STRATEGIES</Text>
          
          <View style={styles.strategyTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, {width: '25%'}]}>Strategy</Text>
              <Text style={[styles.headerCell, {width: '15%'}]}>Estimated Savings</Text>
              <Text style={[styles.headerCell, {width: '10%'}]}>Implementation</Text>
              <Text style={[styles.headerCell, {width: '10%'}]}>Complexity</Text>
              <Text style={[styles.headerCell, {width: '25%'}]}>Key Implementation Steps</Text>
              <Text style={[styles.headerCell, {width: '15%'}]}>Risk Level</Text>
            </View>
            
            {/* Table Rows */}
            {report.strategies?.map((strategy, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '25%'}]}>{strategy.title}</Text>
                <Text style={[styles.tableCell, {width: '15%'}]}>
                  {strategy.savings ? formatCurrency(strategy.savings) : 'N/A'}
                </Text>
                <Text style={[styles.tableCell, {width: '10%'}]}>
                  {strategy.implementationDate || 'Q4 2025'}
                </Text>
                <Text style={[styles.tableCell, {width: '10%'}]}>
                  {strategy.complexity || 'Medium'}
                </Text>
                <Text style={[styles.tableCell, {width: '25%'}]}>
                  {strategy.implementationSteps || 'See implementation roadmap'}
                </Text>
                <Text style={[styles.tableCell, {width: '15%'}]}>
                  {strategy.riskLevel || 'Low-Medium'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Implementation Roadmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IMPLEMENTATION ROADMAP</Text>
          
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineQuarter}>Q3 2025</Text>
              <Text style={styles.timelineContent}>
                Approve IT procurement plan and vendor quotes. Open SEP-IRA at custodial bank; 
                draft contribution policy. Start contemporaneous R&D time-tracking.
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineQuarter}>Q4 2025</Text>
              <Text style={styles.timelineContent}>
                Place §179 assets in service before 31 Dec. Close books on cash-method feasibility; 
                begin Form 3115 prep. Finalize 2025 qualified research expense calculation.
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineQuarter}>Q1 2026</Text>
              <Text style={styles.timelineContent}>
                File S-Corp election (Form 2553) by 15 Mar 2026 if chosen. Prepare 2025 corporate 
                return with §179, bonus, SEP deduction, and R&D credit. Adjust quarterly estimated 
                taxes for lower liability.
              </Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RISK ASSESSMENT & COMPLIANCE</Text>
          
          <View style={styles.riskContainer}>
<Text style={{fontSize: 9, marginBottom: 5}}>
  <Text style={{fontWeight: 'bold'}}>Audit risk:</Text> Low-medium. All strategies have clear statutory 
  authority (§179, §168(k), §41, Rev. Proc. 2018-40 cash-method). Document business use greater than 50%, 
  time-tracking, and written board approvals.
</Text>
            <Text style={{fontSize: 9, marginBottom: 5}}>
              <Text style={{fontWeight: 'bold'}}>Documentation:</Text> Keep invoices, depreciation schedules, 
              SEP-IRA adoption agreement, Form 6765 work-papers, and §41 project narratives for at least 7 years.
            </Text>
            <Text style={{fontSize: 9}}>
              <Text style={{fontWeight: 'bold'}}>Potential penalties:</Text> Negligible if records maintained; 
              cash-method change includes automatic audit-protection under Rev. Proc.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>
            These materials are provided for informational purposes only and do not constitute tax, legal, or 
            accounting advice. No CPA-licensed professional has reviewed or certified these recommendations. 
            Consult a qualified tax advisor licensed in your jurisdiction before implementing any strategy. 
            Use of these recommendations is at your own risk; neither the preparer nor its affiliates accept 
            liability for actions taken in reliance hereon.
          </Text>
          <Text render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};
