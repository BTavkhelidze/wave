import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignInDto } from './signIn.dto';

describe('SignInDto', () => {
  it('trims and lowercases valid email strings', async () => {
    const dto = plainToInstance(SignInDto, {
      email: ' Admin@Example.COM ',
      password: 'password1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('admin@example.com');
  });

  it('rejects non-string email values without throwing during transform', async () => {
    const dto = plainToInstance(SignInDto, {
      email: ['admin@example.com'],
      password: 'password1',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
    expect(dto.email).toEqual(['admin@example.com']);
  });
});
