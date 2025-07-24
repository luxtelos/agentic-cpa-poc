import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginVertical: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    textAlign: 'left'
  },
  headerCell: {
    fontWeight: 'bold'
  },
  numericCell: {
    textAlign: 'right'
  }
});

const isNumeric = (value: string | number) => {
  const strValue = value.toString();
  return /^\$?\d+(,\d{3})*(\.\d+)?%?$/.test(strValue.trim());
};

const calculateColumnWidths = (rows: (string | number)[][]) => {
  const colCount = rows[0]?.length || 0;
  const colWidths = new Array(colCount).fill(0);
  
  rows.forEach(row => {
      row.forEach((cell, colIndex) => {
        const cellWidth = cell.toString().length * 5; // Approximate width based on character count
      if (cellWidth > colWidths[colIndex]) {
        colWidths[colIndex] = cellWidth;
      }
    });
  });

  return colWidths;
};

export const EnhancedTable = ({ rows }: { rows: (string | number)[][] }) => {
  if (!rows || rows.length === 0) return null;

  const colWidths = calculateColumnWidths(rows);
  const [headerRow, ...bodyRows] = rows;

  return (
    <View style={styles.table}>
      {/* Header Row */}
      <View style={styles.tableHeader}>
        {headerRow.map((cell, i) => (
          <View key={i} style={[styles.tableCell, styles.headerCell, { width: colWidths[i] }]}>
            <Text>{cell}</Text>
          </View>
        ))}
      </View>

      {/* Body Rows */}
      {bodyRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <View 
              key={cellIndex} 
              style={[
                styles.tableCell, 
                isNumeric(cell) ? styles.numericCell : {},
                { width: colWidths[cellIndex] }
              ]}
            >
              <Text>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
