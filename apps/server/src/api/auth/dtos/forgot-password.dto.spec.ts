import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto';

describe('ForgotPasswordDto', () => {
  it('trims and lowercases valid email strings', async () => {
    const dto = plainToInstance(ForgotPasswordDto, {
      email: ' Admin@Example.COM ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('admin@example.com');
  });

  it('rejects non-string email values without throwing during transform', async () => {
    const dto = plainToInstance(ForgotPasswordDto, {
      email: { address: 'admin@example.com' },
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
    expect(dto.email).toEqual({ address: 'admin@example.com' });
  });
});
