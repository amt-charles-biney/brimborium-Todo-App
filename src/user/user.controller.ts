import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async addUser(@Body() user: CreateUserDto) {
    return {
      status: true,
      data: { id: await this.userService.createUser(user) },
    };
  }

  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
  ) {
    return this.userService.findUsers({
      skip,
      take,
      orderBy,
    });
  }
}
