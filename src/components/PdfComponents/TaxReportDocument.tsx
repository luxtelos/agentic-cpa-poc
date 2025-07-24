import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font
} from '@react-pdf/renderer';
import { 
  TaxReportData, 
  CompanyInfo, 
  FinancialItem, 
  DisclosureItem,
  RecommendationItem
} from '../../lib/taxReportTypes';

// Register fonts - fallback to Helvetica
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

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
    textAlign: 'center',
    marginBottom: 20
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
    borderRight: '1pt solid #ddd',
    padding: 4,
    textAlign: 'right'
  },
  tableCellLeft: {
    flex: 1,
    borderRight: '1pt solid #ddd',
    padding: 4,
    textAlign: 'left'
  },
  disclosureItem: {
    marginBottom: 5
  },
  disclosureTitle: {
    fontWeight: 'bold'
  },
  recommendationItem: {
    marginBottom: 8
  }
});

const Header = ({ title }: { title: string }) => (
  <View style={styles.header} fixed>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text render={({ pageNumber, totalPages }) => 
      `Page ${pageNumber} of ${totalPages}`
    } />
  </View>
);

interface FinancialTableProps {
  title: string;
  data: FinancialItem[];
}

const FinancialTable = ({ title, data }: FinancialTableProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCellLeft, { flex: 3 }]}>Description</Text>
        <Text style={styles.tableCell}>Amount</Text>
      </View>
      {data.map((item, index) => (
        <View style={styles.tableRow} key={index}>
          <Text style={[styles.tableCellLeft, { flex: 3 }]}>{item.description}</Text>
          <Text style={styles.tableCell}>{item.amount}</Text>
        </View>
      ))}
    </View>
  </View>
);

interface DisclosureListProps {
  disclosures: DisclosureItem[];
}

const DisclosureList = ({ disclosures }: DisclosureListProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Key Disclosures</Text>
    {disclosures.map((item, index) => (
      <View style={styles.disclosureItem} key={index}>
        <Text style={styles.disclosureTitle}>{item.title}:</Text>
        <Text>{item.content}</Text>
      </View>
    ))}
  </View>
);

interface RecommendationsProps {
  recommendations: RecommendationItem[];
}

const Recommendations = ({ recommendations }: RecommendationsProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Recommendations</Text>
    {recommendations.map((item, index) => (
      <View style={styles.recommendationItem} key={index}>
        <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
        {item.details.map((detail, idx) => (
          <Text key={idx}>• {detail}</Text>
        ))}
      </View>
    ))}
  </View>
);

interface CompanyInfoProps {
  companyInfo: CompanyInfo;
}

const CompanyInfoSection = ({ companyInfo }: CompanyInfoProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Company Information</Text>
    <Text>Legal Name: {companyInfo.name}</Text>
    <Text>Address: {companyInfo.address}</Text>
    <Text>EIN: {companyInfo.ein}</Text>
    <Text>Tax Year: {companyInfo.taxYear}</Text>
    <Text>Business Activity: {companyInfo.businessActivity}</Text>
    {companyInfo.naicsCode && <Text>NAICS Code: {companyInfo.naicsCode}</Text>}
  </View>
);

export const TaxReportDocument = ({ reportData }: { reportData: TaxReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header title="Tax Advisory Report" />
      
      <CompanyInfoSection companyInfo={reportData.companyInfo} />
      
      <FinancialTable title="Income Summary" data={reportData.incomeSummary} />
      <FinancialTable title="Deductions" data={reportData.deductions} />
      <FinancialTable title="Tax Computation" data={reportData.taxComputation} />
      
      <DisclosureList disclosures={reportData.disclosures} />
      <Recommendations recommendations={reportData.recommendations} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Final Assessment</Text>
        <Text>{reportData.finalAssessment}</Text>
      </View>
      
      <Footer />
    </Page>
  </Document>
);
