import { Controller, Post, Request, Response, UseGuards } from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { LocalAuthGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor() {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return req.user;
  }

  @Post('logout')
  async logout(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    try {
      req.logOut(() =>
        req.session.destroy(
          (err) => err && res.json({ 'Error destroying session:': err }),
        ),
      );

      return res.clearCookie('connect.sid').json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: error.message,
      });
    }
  }
}
