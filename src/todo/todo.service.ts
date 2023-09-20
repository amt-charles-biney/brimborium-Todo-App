import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class TodoService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}
}
