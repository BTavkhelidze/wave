import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContactMessageDto } from './create-contact-message.dto';

describe('CreateContactMessageDto', () => {
  const validPayload = {
    fullName: ' John Doe ',
    email: ' JOHN@example.com ',
    phone: ' +995555123456 ',
    subject: ' Fire protection system ',
    message: ' I would like more information about this service. ',
  };

  it('accepts and normalizes a valid contact message', async () => {
    const dto = plainToInstance(CreateContactMessageDto, validPayload);

    await expect(validate(dto, { whitelist: true })).resolves.toHaveLength(0);
    expect(dto).toMatchObject({
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+995555123456',
      subject: 'Fire protection system',
      message: 'I would like more information about this service.',
    });
  });

  it('converts optional empty strings to undefined', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      ...validPayload,
      phone: '   ',
      subject: '',
    });

    await expect(validate(dto, { whitelist: true })).resolves.toHaveLength(0);
    expect(dto.phone).toBeUndefined();
    expect(dto.subject).toBeUndefined();
  });

  it('rejects invalid email, short message, and whitespace-only required values', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      fullName: '   ',
      email: 'not-an-email',
      message: ' short ',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['fullName', 'email', 'message']),
    );
  });

  it('rejects unknown lifecycle fields when whitelist validation is enabled', async () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      ...validPayload,
      status: 'READ',
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });
});
