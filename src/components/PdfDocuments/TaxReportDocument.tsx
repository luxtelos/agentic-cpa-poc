import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PdfSection } from '../../lib/markdownProcessor';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    color: '#1a365d'
  },
  heading: {
    fontSize: 16,
    marginVertical: 10,
    color: '#2c5282'
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 5
  },
  tableHeader: {
    backgroundColor: '#ebf8ff',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    padding: 5
  }
});

import { DocumentProps } from '@react-pdf/renderer';

interface TaxReportDocumentProps extends DocumentProps {
  sections: PdfSection[];
}

export const TaxReportDocument: React.FC<TaxReportDocumentProps> = ({ sections }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>TAX OPTIMIZATION REPORT</Text>
      
      {sections.map((section, index) => {
        switch (section.type) {
          case 'heading':
            return (
              <Text key={`heading-${index}`} style={[
                styles.heading, 
                { fontSize: 16 - (section.level || 1) * 2 }
              ]}>
                {section.content || 'Untitled Section'}
              </Text>
            );
          
          case 'paragraph':
            return (
              <Text key={`paragraph-${index}`} style={styles.paragraph}>
                {section.content || '[Content not available]'}
              </Text>
            );
          
          case 'table': {
            const rows = section.content?.split('\n').filter(line => line.trim()) || [];
            if (rows.length < 2) {
              rows.push('| Column 1 | Column 2 |');
              rows.push('|----------|----------|');
              rows.push('| No data  | available|');
            }

            return (
              <View key={`table-${index}`} style={styles.table}>
                {rows.map((row, rowIndex) => (
                  <View 
                    key={`row-${rowIndex}`}
                    style={[
                      styles.tableRow,
                      rowIndex === 0 ? styles.tableHeader : undefined
                    ]}
                  >
                    {row.split('|').slice(1, -1).map((cell, cellIndex) => (
                      <Text key={`cell-${cellIndex}`} style={styles.tableCell}>
                        {cell.trim()}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          }
          
          case 'list':
            return (
              <View key={`list-${index}`}>
                {section.items?.map((item, itemIndex) => (
                  <Text key={`item-${itemIndex}`} style={styles.paragraph}>
                    • {item}
                  </Text>
                ))}
              </View>
            );
          
          default:
            return null;
        }
      })}

      <Text style={{
        position: 'absolute',
        bottom: 30,
        left: 40,
        fontSize: 10,
        color: '#666'
      }}>
        Confidential - Tax Advisory Report
      </Text>
    </Page>
  </Document>
);
