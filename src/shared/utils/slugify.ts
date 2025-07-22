// utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces & non-word chars with `-`
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}
