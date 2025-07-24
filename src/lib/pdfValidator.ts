interface PDFValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePdfStructure = (bytes: Uint8Array): PDFValidationResult => {
  const result: PDFValidationResult = {
    isValid: true,
    errors: []
  };

  // 1. Validate PDF header
  const header = String.fromCharCode(...bytes.slice(0, 4));
  if (header !== '%PDF') {
    result.isValid = false;
    result.errors.push('Invalid PDF header - missing %PDF signature');
  }

  // 2. Validate PDF version (optional)
  const versionMatch = new (window.TextDecoder || TextDecoder)().decode(bytes.slice(5, 8));
  if (!/^\d\.\d$/.test(versionMatch)) {
    result.errors.push('Invalid PDF version format');
  }

  // 3. Validate trailer
  const trailer = new (window.TextDecoder || TextDecoder)().decode(bytes.slice(-1024)); // Check last 1KB
  if (!trailer.includes('%%EOF')) {
    result.isValid = false;
    result.errors.push('Missing PDF EOF marker');
  }

  // 4. Validate basic structure
  const fullText = new (window.TextDecoder || TextDecoder)().decode(bytes);
  const requiredElements = [
    '/Type /Catalog',
    '/Pages',
    '/Contents'
  ];

  requiredElements.forEach(element => {
    if (!fullText.includes(element)) {
      result.isValid = false;
      result.errors.push(`Missing required PDF element: ${element}`);
    }
  });

  return result;
};

export const validatePdfContent = (bytes: Uint8Array): void => {
  const validation = validatePdfStructure(bytes);
  if (!validation.isValid) {
    throw new Error(`PDF validation failed: ${validation.errors.join(', ')}`);
  }
};

// Helper for react-pdf validation
export const validateReactPdfOutput = (pdfDoc: unknown): void => {
  if (!pdfDoc || typeof pdfDoc !== 'object') {
    throw new Error('Invalid PDF document object');
  }

  const doc = pdfDoc as {
    props: unknown;
    type: string;
    children: unknown[];
  };

  const requiredProps = ['props', 'type', 'children'];
  requiredProps.forEach(prop => {
    if (!(prop in doc)) {
      throw new Error(`Invalid react-pdf document - missing ${prop}`);
    }
  });
};
