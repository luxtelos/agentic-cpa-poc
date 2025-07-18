/**
 * Cleans markdown content before PDF rendering
 * - Removes HTML comments
 * - Normalizes whitespace
 * - Handles newlines for PDF rendering
 */
export const cleanMarkdown = (markdown: string): string => {
  // Remove <think> tags and their content
  let cleaned = markdown.replace(/<think>[\s\S]*?<\/think>/g, '');
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--.*?-->/gs, '');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // Handle markdown hard line breaks (two spaces at end of line)
  cleaned = cleaned.replace(/ {2}\n/g, '\u2060\n\u2060');

  // Replace single newlines with spaces (except between paragraphs)
  cleaned = cleaned.replace(/([^\n])\n([^\n])/g, '$1 $2');

  // Remove any remaining standalone newlines
  cleaned = cleaned.replace(/\n+/g, ' ');

  // Normalize special characters
  cleaned = cleaned
    .replace(/²/g, '↑')
    .replace(/Ï/g, '→')
    .replace(/[^\u0020-\u007E]/g, ' '); // Replace non-printable ASCII chars

  // Remove all undefined items
  cleaned = cleaned.replace(/• undefined\n/g, '')
                  .replace(/- undefined\n/g, '')
                  .replace(/\* undefined\n/g, '');

  // Standardize list markers
  cleaned = cleaned.replace(/(\n•)/g, '\n-')
                  .replace(/(\n\*)/g, '\n-');

  // Fix table formatting
  cleaned = cleaned.replace(/\|/g, ' | ')
                  .replace(/\n\s*\n/g, '\n');

  // Extract and preserve HTML tags before word breaking
  const htmlTags: {index: number, tag: string}[] = [];
  let tagMatch;
  const tagRegex = /<[^>]+>/g;
  
  while ((tagMatch = tagRegex.exec(cleaned)) !== null) {
    htmlTags.push({
      index: tagMatch.index,
      tag: tagMatch[0]
    });
  }

  // Remove HTML tags temporarily
  let contentWithoutTags = cleaned.replace(/<[^>]+>/g, '\uFFFC'); // Use placeholder

  // Break long words in non-HTML content
  contentWithoutTags = contentWithoutTags.replace(
    /(\S{20,})/g,
    (match) => match.replace(/(.{20})/g, '$1\u00AD')
  );

  // Process tables to prevent overflow
  contentWithoutTags = contentWithoutTags.replace(
    /\|(.+?)\|/g,
    (match) => `|${match.slice(1, -1).replace(/(.{15})/g, '$1\u00AD')}|`
  );

  // Reinsert HTML tags
  cleaned = contentWithoutTags;
  htmlTags.forEach(({index, tag}) => {
    cleaned = cleaned.slice(0, index) + tag + cleaned.slice(index + 1);
  });
    
  // Trim whitespace
  return cleaned.trim();
};
