import type { BlogLanguage, BlogStatus } from './blog.types';

export const BLOG_LANGUAGES: readonly BlogLanguage[] = ['EN', 'KA'];
export const BLOG_STATUSES: readonly BlogStatus[] = ['DRAFT', 'PUBLISHED'];

export const DEFAULT_BLOG_LANGUAGE: BlogLanguage = 'EN';

export function getBlogLanguageLabel(language: BlogLanguage): string {
  const labels: Record<BlogLanguage, string> = {
    EN: 'English',
    KA: 'Georgian',
  };

  return labels[language];
}

export function getBlogStatusLabel(status: BlogStatus): string {
  const labels: Record<BlogStatus, string> = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
  };

  return labels[status];
}
