export function   sanitizeFileName(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')           // replace spaces with dashes
    .replace(/[^a-z0-9.-]/g, '');   // remove anything not alphanumeric, dot, or dash
}