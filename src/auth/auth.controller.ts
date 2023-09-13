import { Controller, Post, Request, Response, UseGuards } from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { LocalAuthGuard } from './local.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return req.user;
  }

  @Post('/logout')
  async logout(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    req.logOut((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      return req.session.destroy(
        (err) => err && res.json({ 'Error destroying session:': err }),
      );
    });

    return res
      .clearCookie('connect.sid')
      .status(200)
      .json({ status: 'success', message: 'Logout successful' });
  }
}
