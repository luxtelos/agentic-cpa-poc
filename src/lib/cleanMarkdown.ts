export function cleanMarkdown(input: string): string {
  return input.replace(/<think>[\s\S]*?<\/think>/gi, '');
}
