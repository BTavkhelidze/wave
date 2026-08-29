export const DEFAULT_SERVICE_ANIMATION_COLORS = [
  '#B22222',
  '#FF8C00',
  '#FFD700',
  '#2F4F4F',
  '#DCDCDC',
] as const;

const SERVICE_ANIMATION_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function getSafeServiceAnimationColors(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length !== DEFAULT_SERVICE_ANIMATION_COLORS.length ||
    !value.every(
      (color): color is string =>
        typeof color === 'string' &&
        SERVICE_ANIMATION_COLOR_PATTERN.test(color),
    )
  ) {
    return [...DEFAULT_SERVICE_ANIMATION_COLORS];
  }

  return value.map((color) => color.toUpperCase());
}
