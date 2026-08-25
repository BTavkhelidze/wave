export const DEFAULT_SERVICE_ANIMATION_COLORS = [
  '#B22222',
  '#FF8C00',
  '#FFD700',
  '#2F4F4F',
  '#DCDCDC',
] as const;

export const SERVICE_ANIMATION_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function normalizeAnimationColor(color: string): string {
  return color.toUpperCase();
}
