import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async sign(id: string) {
    return this.jwtService.signAsync({ id });
  }

  public async verify(token: string) {
    return this.jwtService.verifyAsync(token);
  }
}
