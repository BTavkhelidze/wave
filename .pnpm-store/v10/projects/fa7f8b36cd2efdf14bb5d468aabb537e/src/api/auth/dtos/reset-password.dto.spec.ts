import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto';

describe('ResetPasswordDto', () => {
  it('accepts a strong password with matching confirmation', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: ' token ',
      newPassword: 'N3w-password!',
      confirmPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.token).toBe('token');
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
});
