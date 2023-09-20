import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { QueryParserService } from '../utilities/query-parser.service';
import { UpdateUserDto } from './dtos';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private queryParser: QueryParserService,
  ) {}

  @Post()
  async addUser(@Body() user: CreateUserDto) {
    return {
      status: true,
      data: { id: await this.userService.createUser(user) },
    };
  }

  @Get('all')
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
    @Query('where') where?: string,
  ) {
    return this.userService.findUsers({
      skip,
      take,
      orderBy: this.queryParser.parseQuery(
        orderBy,
      ) as Prisma.UserOrderByWithRelationInput,
      where: this.queryParser.parseQuery(where) as Prisma.UserWhereInput,
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return {
      status: true,
      data: await this.userService.updateUser(id, user),
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return {
      status: true,
      message: 'User deleted successfully',
    };
  }
}
