import { cleanMarkdown } from './cleanMarkdown';
/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';

describe('cleanMarkdown', () => {
  it('removes think tags and their content', () => {
    const input = `Some text<think>hidden content</think>more text`;
    expect(cleanMarkdown(input)).toBe('Some textmore text');
  });

  it('handles multiline think tags', () => {
    const input = `Start<think>
    Multi-line
    content
    </think>End`;
    expect(cleanMarkdown(input)).toBe('StartEnd');
  });

  it('preserves other HTML tags', () => {
    const input = `Text<div>content</div>`;
    expect(cleanMarkdown(input)).toBe('Text<div>content</div>');
  });

  it('handles multiple think tags', () => {
    const input = `1<think>a</think>2<think>b</think>3`;
    expect(cleanMarkdown(input)).toBe('123');
  });
});
