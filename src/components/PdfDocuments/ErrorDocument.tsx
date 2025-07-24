import React, { useEffect } from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './TaxReportDocument';

import { DocumentProps } from '@react-pdf/renderer';

interface ErrorDocumentProps extends DocumentProps {
  error: Error;
}

export const ErrorDocument: React.FC<ErrorDocumentProps> = ({ error }) => {
  useEffect(() => {
    console.error('[PDF] Rendering Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }, [error]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={[styles.title, { color: '#ff0000' }]}>
          Error Generating Report
        </Text>
        <Text style={styles.paragraph}>
          {error.message.substring(0, 100)}
        </Text>
        <Text style={styles.paragraph}>
          Please try again or contact support
        </Text>
      </Page>
    </Document>
  );
};
