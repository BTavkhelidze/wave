import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto';

describe('ResetPasswordDto', () => {
  it('accepts a strong password with matching confirmation', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: ' AbC-DeF_123 ',
      newPassword: 'N3w-password!',
      confirmPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.token).toBe('AbC-DeF_123');
  });

  it('rejects non-string reset tokens without throwing during transform', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: { value: 'AbC-DeF_123' },
      newPassword: 'N3w-password!',
      confirmPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'token')).toBe(true);
    expect(dto.token).toEqual({ value: 'AbC-DeF_123' });
  });

  it('rejects mismatched password confirmation', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'token',
      newPassword: 'N3w-password!',
      confirmPassword: 'Other-password1!',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'confirmPassword')).toBe(
      true,
    );
  });

  it('rejects weak passwords', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'token',
      newPassword: 'password',
      confirmPassword: 'password',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('rejects overly long new passwords', async () => {
    const longPassword = `N3w-password!${'a'.repeat(128)}`;
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'token',
      newPassword: longPassword,
      confirmPassword: longPassword,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });
});
