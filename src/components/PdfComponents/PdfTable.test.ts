import { describe, it, expect } from 'vitest';
import { parseMarkdownTable } from './PdfTable';

describe('parseMarkdownTable', () => {
  it('parses headers and rows from markdown table', () => {
    const markdown = `| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |`;
    const { headers, rows } = parseMarkdownTable(markdown);

    expect(headers).toEqual(['A', 'B']);
    expect(rows).toEqual([
      ['1', '2'],
      ['3', '4']
    ]);
  });

  it('returns empty arrays for invalid table', () => {
    const { headers, rows } = parseMarkdownTable('not a table');
    expect(headers).toEqual([]);
    expect(rows).toEqual([]);
  });
});
