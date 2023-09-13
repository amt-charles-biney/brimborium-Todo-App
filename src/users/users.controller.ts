import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { QueryParserService } from '../generic-services/user-query-parser.service';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly queryParser: QueryParserService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
  ) {
    const parsedOrderBy = this.queryParser.parseOrderBy(orderBy);

    return this.usersService.findUsers({
      skip,
      take,
      orderBy: parsedOrderBy,
    });
  }

  @Post()
  async addUser(@Body() user: User) {
    return {
      status: true,
      data: { id: await this.usersService.createUser(user) },
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() user: User) {
    return {
      status: true,
      data: await this.usersService.updateUser(id, user),
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return {
      status: true,
      message: 'User deleted successfully',
    };
  }
}
