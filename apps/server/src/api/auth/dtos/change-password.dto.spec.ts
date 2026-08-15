import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ChangeInitialPasswordDto,
  ChangePasswordDto,
} from './change-password.dto';

describe('ChangePasswordDto', () => {
  it('accepts a normal password change with current and new passwords', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      currentPassword: 'Current-password1!',
      newPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a normal password change when currentPassword is missing', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      newPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'currentPassword')).toBe(
      true,
    );
  });

  it('rejects weak new passwords', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      currentPassword: 'Current-password1!',
      newPassword: 'password',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });
});

describe('ChangeInitialPasswordDto', () => {
  it('accepts the initial password change payload without currentPassword', async () => {
    const dto = plainToInstance(ChangeInitialPasswordDto, {
      newPassword: 'N3w-password!',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
