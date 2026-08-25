import { normalizeBlogSlug } from '../../blogs/lib/blog-slug.util';

export const SERVICE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeServiceSlug(slug: string): string {
  return normalizeBlogSlug(slug);
}
