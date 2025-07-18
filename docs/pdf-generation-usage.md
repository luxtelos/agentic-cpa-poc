# PDF Generation System Documentation

## Overview
The PDF generation system provides React components and utilities to convert markdown content to styled PDF documents with features like:
- Header/footer support
- Automatic page breaks
- Table formatting
- Font management

## Core Components

### `PdfGenerator`
The PDF download button component. Uses `PdfRenderer` internally.

### `PdfRenderer`
The core PDF rendering component that converts markdown to PDF.

#### Props:
```ts
interface PdfGeneratorProps {
  markdown: string;       // Markdown content to render  
  fileName?: string;      // Output PDF filename
  header?: string;        // Static header text
  footer?: string;        // Static footer text
}
```

## Usage Example
```tsx
import { PdfGenerator } from '../components/PdfGenerator';

const Example = () => (
  <PdfGenerator
    markdownContent="# Tax Report\n## Summary\n- Total savings: **$12,450**"
    fileName="tax-report.pdf"
    header="Confidential"
    footer={`Generated on ${new Date().toLocaleDateString()}`}
  />
);

// For advanced usage:
import { PdfRenderer } from '../components/PdfRenderer';
import { PDFViewer } from '@react-pdf/renderer';

const PreviewExample = () => (
  <PDFViewer width="100%" height="600px">
    <PdfRenderer 
      markdown="# Preview Document"
      header="Draft"
      footer="Preview"
    />
  </PDFViewer>
);
```

## Markdown Features
Supported elements:
- Headings (#, ##, ###)
- Paragraphs and line breaks
- Emphasis (**bold**, *italic*)
- Lists (ordered and unordered)
- Tables (with alignment)
- Horizontal rules (page breaks)
- Inline code and code blocks

Special syntax:
- `<!-- pagebreak -->` for manual page breaks
- Wrap tables in markdown syntax:
  ```markdown
  | Header 1 | Header 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  ```

## Styling
Customize PDF appearance via:
1. `pdf-styles.css` - Global PDF styles
2. Inline markdown HTML with style attributes
3. Media queries for print-specific styling

## Advanced Usage
For complex documents, pre-process markdown using `processMarkdownForPdf()` from `pdfMarkdownProcessor.ts`.
