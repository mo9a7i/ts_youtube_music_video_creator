export function getTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')     // Remove dashes and colons
    .replace(/[T.]/g, '-')    // Replace T and dot with dash
    .slice(0, 15);            // Get only YYYYMMdd-HHmmss
} 