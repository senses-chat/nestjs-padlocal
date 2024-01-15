import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      return res.send('No auth header').status(401);
    }

    const [bearer, token] = req.headers.authorization.split(' ');

    if (bearer !== 'Bearer') {
      return res.send('Invalid auth header').status(401);
    }

    res.locals.jwtPayload = await this.authService.verify(token);
    next();
  }
}
