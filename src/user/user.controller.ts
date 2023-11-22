import { Body, Controller, Post } from '@nestjs/common';
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
}
