export const sanitizePdfContent = (content: string): string => {
  // Remove everything between <think> tags including the tags themselves
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
