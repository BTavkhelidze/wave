import {
  DEFAULT_SERVICE_ANIMATION_COLORS,
  normalizeAnimationColor,
  SERVICE_ANIMATION_COLOR_PATTERN,
} from '../model/serviceAnimationColors';

type AnimationColorsFieldProps = {
  idPrefix: string;
  colors: string[];
  error: string | undefined;
  disabled?: boolean;
  onChange: (colors: string[]) => void;
};

export function AnimationColorsField({
  idPrefix,
  colors,
  error,
  disabled = false,
  onChange,
}: AnimationColorsFieldProps) {
  const currentColors = getFiveColors(colors);
  const errorId = `${idPrefix}-error`;

  const updateColor = (index: number, color: string) => {
    const nextColors = [...currentColors];
    nextColors[index] = normalizeAnimationColor(color);
    onChange(nextColors);
  };

  return (
    <section className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='border-b border-[#E5E7EB] px-5 py-4'>
        <h3 className='text-base font-semibold text-[#111827]'>
          Animation colors
        </h3>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Configure the five-color palette used by the service background.
        </p>
      </div>
      <div className='space-y-5 p-5'>
        <div className='grid gap-4 lg:grid-cols-5'>
          {currentColors.map((color, index) => {
            const inputId = `${idPrefix}-color-${index + 1}`;
            const colorPickerId = `${inputId}-picker`;
            const label = `Color ${index + 1}`;

            return (
              <div key={inputId}>
                <label
                  htmlFor={inputId}
                  className='block text-sm font-medium text-[#111827]'
                >
                  {label}
                </label>
                <div className='mt-2 flex items-center gap-2'>
                  <input
                    id={colorPickerId}
                    type='color'
                    value={getColorPickerValue(color)}
                    disabled={disabled}
                    aria-label={`${label} picker`}
                    onChange={(event) => updateColor(index, event.target.value)}
                    className='h-10 w-11 shrink-0 cursor-pointer rounded-md border border-[#D1D5DB] bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60'
                  />
                  <input
                    id={inputId}
                    type='text'
                    value={color}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => updateColor(index, event.target.value)}
                    className='min-w-0 flex-1 rounded-md border border-[#D1D5DB] px-3 py-2 font-mono text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:opacity-70'
                  />
                  <span
                    className='h-8 w-8 shrink-0 rounded-md border border-[#D1D5DB]'
                    style={{ backgroundColor: color }}
                    aria-hidden='true'
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <p className='text-sm font-medium text-[#111827]'>Palette preview</p>
          <div className='mt-2 grid h-10 overflow-hidden rounded-md border border-[#D1D5DB] grid-cols-5'>
            {currentColors.map((color, index) => (
              <span
                key={`${color}-${index}`}
                style={{ backgroundColor: color }}
                aria-hidden='true'
              />
            ))}
          </div>
        </div>

        {error && (
          <p id={errorId} className='text-sm text-[#DC2626]'>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

function getFiveColors(colors: string[]): string[] {
  if (colors.length === DEFAULT_SERVICE_ANIMATION_COLORS.length) {
    return colors;
  }

  return [...DEFAULT_SERVICE_ANIMATION_COLORS];
}

function getColorPickerValue(color: string): string {
  return SERVICE_ANIMATION_COLOR_PATTERN.test(color)
    ? color
    : DEFAULT_SERVICE_ANIMATION_COLORS[0];
}
