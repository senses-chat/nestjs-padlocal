import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'aTestSecretThatNeedsToBeChanged',
          signOptions: { expiresIn: '3s' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('root', () => {
    it('should sign', async () => {
      const token = await authService.sign();
      console.log(token);
      // expect(token).toBe('OK');
    });

    // it('should verify', async () => {
    //   const payload = await authService.verify(
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY5Njk0MzcxMSwiZXhwIjoxNjk2OTQzNzE0fQ.W_7X0vPKjmX9UypZuLI5oiRswdU4uT6By0eZs1Gyhbs',
    //   );

    //   console.log(payload);
    // });
  });
});
