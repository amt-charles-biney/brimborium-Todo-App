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
import type { UpdateUserDto, UserResultDto, CreateUserDto } from './dtos';
import { UserService } from './user.service';

/**
 * Controller for managing user-related operations.
 */
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private queryParser: QueryParserService,
  ) {}

  /**
   * Create a new user.
   *
   * @param user - The user data to be created.
   * @returns {Promise<{ status: boolean, data: { id: string } }>} A response indicating the status and the ID of the created user.
   */
  @Post()
  async addUser(
    @Body() user: CreateUserDto,
  ): Promise<{ status: boolean; data: { id: string } }> {
    return {
      status: true,
      data: { id: await this.userService.createUser(user) },
    };
  }

  /**
   * Get a list of all users with optional pagination and filtering.
   *
   * @param skip - The number of items to skip in the result.
   * @param take - The maximum number of items to return.
   * @param orderBy - The order in which to return the results.
   * @param where - The conditions to filter the results.
   * @returns {Promise<UserResultDto[]>} A list of users that match the specified criteria.
   */
  @Get('all')
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
    @Query('where') where?: string,
  ): Promise<UserResultDto[]> {
    return this.userService.findUsers({
      skip,
      take,
      orderBy: this.queryParser.parseQuery(
        orderBy,
      ) as Prisma.UserOrderByWithRelationInput,
      where: this.queryParser.parseQuery(where) as Prisma.UserWhereInput,
    });
  }

  /**
   * Update an existing user by ID.
   *
   * @param id - The ID of the user to update.
   * @param user - The updated user data.
   * @returns {Promise<{ status: boolean, data: UpdateUserDto | null }>} A response indicating the status and the updated user data.
   */
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<{ status: boolean; data: UpdateUserDto | null }> {
    return {
      status: true,
      data: await this.userService.updateUser(id, user),
    };
  }

  /**
   * Delete a user by ID.
   *
   * @param id - The ID of the user to delete.
   * @returns {Promise<{ status: boolean, message: string }>} A response indicating the status and a message indicating the result of the deletion operation.
   */
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
  ): Promise<{ status: boolean; message: string }> {
    await this.userService.deleteUser(id);
    return {
      status: true,
      message: 'User deleted successfully',
    };
  }
}
