import { normalizeBlogSlug } from './blog-slug.util';

describe('normalizeBlogSlug', () => {
  it.each([
    ['Fire Protection System', 'fire-protection-system'],
    ['FIRE PROTECTION SYSTEM', 'fire-protection-system'],
    ['Safety   And Security', 'safety-and-security'],
    ['Fire Protection & Safety Systems', 'fire-protection-safety-systems'],
    ["Company's New Service", 'companys-new-service'],
    ['Safety---And   Security', 'safety-and-security'],
    ['---Safety And Security---', 'safety-and-security'],
    ['Engineering 24/7', 'engineering-24-7'],
    ['Café Fire Protection', 'cafe-fire-protection'],
    ['', ''],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(normalizeBlogSlug(input)).toBe(expected);
  });
});
