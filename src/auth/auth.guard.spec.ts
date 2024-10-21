import { AuthGuard } from '@nestjs/passport';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(AuthGuard()).toBeDefined();
  });
});
