import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { parseMarkdown, isNodeType, MarkdownNode } from '@/lib/markdownToAst';
import { ReactNode } from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    lineHeight: 1.5
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8
  },
  table: {
    width: '100%',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1
  }
});

const renderNode = (node: MarkdownNode): ReactNode => {
  if (!node) return null;

  switch (node.type) {
    case 'heading':
      return (
        <Text style={node.depth === 1 ? styles.heading1 : styles.heading2}>
          {node.children?.map(renderNode)}
        </Text>
      );
    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          {node.children?.map(renderNode)}
        </Text>
      );
    case 'text':
      return node.value;
    case 'table':
      return (
        <View style={styles.table}>
          {node.children?.map(renderNode)}
        </View>
      );
    case 'tableRow':
      return (
        <View style={styles.tableRow}>
          {node.children?.map(renderNode)}
        </View>
      );
    case 'tableCell':
      return (
        <View style={styles.tableCell}>
          {node.children?.map(renderNode)}
        </View>
      );
    default:
      return null;
  }
};

interface PdfAstRendererProps {
  markdown: string;
}

export const PdfAstRenderer = ({ markdown }: PdfAstRendererProps) => {
  const ast = parseMarkdown(markdown);

  return (
    <Document>
      <Page style={styles.page}>
        {ast.children.map((node, index) => (
          <View key={index}>{renderNode(node)}</View>
        ))}
      </Page>
    </Document>
  );
};
