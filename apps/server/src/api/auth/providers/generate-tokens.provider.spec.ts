import type { JwtService } from '@nestjs/jwt';
import { GenerateTokenProvider } from './generate-tokens.provider';

describe('GenerateTokenProvider', () => {
  it('adds the current session version to access and refresh tokens', async () => {
    const jwtService = {
      signAsync: jest
        .fn<Promise<string>, [Record<string, unknown>, unknown]>()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    };
    const provider = new GenerateTokenProvider(
      jwtService as unknown as JwtService,
      {
        secret: 'secret',
        audience: 'wave-admin',
        issuer: 'wave-api',
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
      },
    );

    await expect(
      provider.generateTokens({
        id: 'user-id',
        email: 'admin@example.com',
        sessionVersion: 3,
      }),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      {
        sub: 'user-id',
        email: 'admin@example.com',
        sessionVersion: 3,
      },
      expect.any(Object),
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        sub: 'user-id',
        email: 'admin@example.com',
        sessionVersion: 3,
      },
      expect.any(Object),
    );
  });
});
