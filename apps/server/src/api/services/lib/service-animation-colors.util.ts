export const DEFAULT_SERVICE_ANIMATION_COLORS = [
  '#B22222',
  '#FF8C00',
  '#FFD700',
  '#2F4F4F',
  '#DCDCDC',
] as const;

export function normalizeServiceAnimationColors(colors: string[]): string[] {
  return colors.map((color) => color.toUpperCase());
}
