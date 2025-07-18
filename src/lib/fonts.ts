// Font definitions for PDF generation
export const PDF_FONTS = {
  primary: {
    name: 'Inter',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700
    },
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
  },
  fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue']
};

export const loadFonts = () => {
  const link = document.createElement('link');
  link.href = PDF_FONTS.primary.url;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  return new Promise((resolve) => {
    link.onload = resolve;
  });
};

export const getFontFamily = () => {
  return `'${PDF_FONTS.primary.name}', ${PDF_FONTS.fallbacks.join(', ')}`;
};
