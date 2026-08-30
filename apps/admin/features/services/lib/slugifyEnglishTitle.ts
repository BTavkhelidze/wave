const APOSTROPHE_PATTERN = /['`\u2019]/g;
const DIACRITIC_PATTERN = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_GROUP_PATTERN = /[^a-z0-9]+/g;
const REPEATED_HYPHEN_PATTERN = /-+/g;
const EDGE_HYPHEN_PATTERN = /^-|-$/g;

export function slugifyEnglishTitle(title: string): string {
  return title
    .trim()
    .normalize('NFD')
    .replace(DIACRITIC_PATTERN, '')
    .toLowerCase()
    .replace(APOSTROPHE_PATTERN, '')
    .replace(NON_ALPHANUMERIC_GROUP_PATTERN, '-')
    .replace(REPEATED_HYPHEN_PATTERN, '-')
    .replace(EDGE_HYPHEN_PATTERN, '');
}
