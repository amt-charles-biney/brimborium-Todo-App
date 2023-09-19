import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryParserService } from '../utilities/query-parser.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

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

  @Get()
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
}
