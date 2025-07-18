import { StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';

const styles = StyleSheet.create({
  table: { 
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  tableRow: { 
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  tableCol: {
    width: '33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  rawTable: {
    fontFamily: 'Courier',
    fontSize: 8,
    padding: 8,
    whiteSpace: 'pre',
    lineHeight: 1.2,
  },
});

interface PdfTableProps {
  content?: string; // Optional raw markdown table content
  headers?: string[]; // Optional for backwards compatibility
  rows?: ReactNode[][]; // Optional for backwards compatibility
  columnWidths?: number[];
}

export const PdfTable = ({ content, headers, rows, columnWidths }: PdfTableProps) => {
  // If we have raw markdown content, render it directly
  if (content) {
    // Split content into lines and trim each line
    const formattedContent = content
      .split('\n')
      .map(line => line.trim())
      .join('\n');
      
    return (
      <View style={styles.table}>
        <Text style={styles.rawTable}>
          {formattedContent}
        </Text>
      </View>
    );
  }

  // Fallback to old table rendering if headers/rows are provided
  const widths = columnWidths || headers?.map(() => 100 / headers.length) || [];
  
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.tableRow}>
        {headers.map((header, i) => (
          <View key={`header-${i}`} style={[styles.tableColHeader, { width: `${widths[i]}%` }]}>
            <Text style={styles.tableCellHeader}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <View key={`cell-${rowIndex}-${cellIndex}`} style={[styles.tableCol, { width: `${widths[cellIndex]}%` }]}>
              <Text style={styles.tableCell}>{cell || '—'}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
