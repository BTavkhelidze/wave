import { BcryptProvider } from './bcrypt.provider';

describe('BcryptProvider', () => {
  let provider: BcryptProvider;

  beforeEach(() => {
    provider = new BcryptProvider();
  });

  it('hashes passwords as bcrypt strings and verifies the original password', async () => {
    const password = 'Current-password1!';

    const hashedPassword = await provider.hashPassword(password);

    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).not.toBe(password);
    await expect(
      provider.comparePassword(password, hashedPassword),
    ).resolves.toBe(true);
  });

  it('rejects incorrect passwords', async () => {
    const hashedPassword = await provider.hashPassword('Current-password1!');

    await expect(
      provider.comparePassword('Wrong-password1!', hashedPassword),
    ).resolves.toBe(false);
  });
});
