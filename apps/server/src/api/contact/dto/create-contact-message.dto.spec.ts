import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContactMessageDto } from './create-contact-message.dto';

describe('CreateContactMessageDto', () => {
  it('accepts a valid contact message', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I would like to discuss a project.',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid email address', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      name: 'John Doe',
      email: 'not-an-email',
      message: 'I would like to discuss a project.',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects missing required fields', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {});

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['name', 'email', 'message']),
    );
  });
});
