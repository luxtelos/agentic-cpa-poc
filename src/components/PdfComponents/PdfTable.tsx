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
});

interface PdfTableProps {
  content?: string; // Raw markdown table
  headers?: string[];
  rows?: ReactNode[][];
  columnWidths?: number[];
}

export function parseMarkdownTable(markdown: string) {
  const lines = markdown
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return { headers: [], rows: [] };

  const headerCells = lines[0].split('|').slice(1, -1).map(c => c.trim());
  const rowLines = lines.slice(2);
  const rows = rowLines.map(line =>
    line.split('|').slice(1, -1).map(c => c.trim())
  );

  return { headers: headerCells, rows };
}

export const PdfTable = ({ content, headers, rows, columnWidths }: PdfTableProps) => {
  let tableHeaders = headers || [];
  let tableRows = rows || [];

  if (content) {
    const parsed = parseMarkdownTable(content);
    tableHeaders = parsed.headers;
    tableRows = parsed.rows;
  }

  const widths = columnWidths || tableHeaders.map(() => 100 / tableHeaders.length);

  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        {tableHeaders.map((header, i) => (
          <View key={`header-${i}`} style={[styles.tableColHeader, { width: `${widths[i]}%` }]}>
            <Text style={styles.tableCellHeader}>{header}</Text>
          </View>
        ))}
      </View>
      {tableRows.map((row, rowIndex) => (
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
