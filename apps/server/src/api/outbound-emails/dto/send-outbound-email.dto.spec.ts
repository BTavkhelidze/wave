import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Language } from '@prisma/client';
import { SendOutboundEmailDto } from './send-outbound-email.dto';

describe('SendOutboundEmailDto', () => {
  const validPayload = {
    recipientEmail: 'client@example.com',
    language: Language.EN,
    subject: 'Project update',
    message: 'Message body',
  };

  it('accepts supported email languages', async () => {
    const englishDto = plainToInstance(SendOutboundEmailDto, {
      ...validPayload,
      language: Language.EN,
    });
    const georgianDto = plainToInstance(SendOutboundEmailDto, {
      ...validPayload,
      language: Language.KA,
    });

    await expect(validate(englishDto)).resolves.toHaveLength(0);
    await expect(validate(georgianDto)).resolves.toHaveLength(0);
  });

  it('rejects unsupported email languages', async () => {
    const dto = plainToInstance(SendOutboundEmailDto, {
      ...validPayload,
      language: 'FR',
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'language',
        }),
      ]),
    );
  });
});
