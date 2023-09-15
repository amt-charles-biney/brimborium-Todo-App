import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Service responsible for parsing query parameters.
 */
@Injectable()
export class QueryParserService {
  /**
   * Parses the 'orderBy' query parameter into a format suitable for Prisma's orderBy option.
   *
   * @param {string} orderBy - The 'orderBy' query parameter (e.g., 'name:asc' or 'createdAt:desc').
   * @returns {Prisma.UserOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput} - The parsed orderBy object.
   */
  parseOrderBy(
    orderBy: string,
  ): Prisma.UserOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput {
    const parsedOrderBy:
      | Prisma.UserOrderByWithRelationInput
      | Prisma.TaskOrderByWithRelationInput = {};

    if (orderBy) {
      const orderParams = orderBy.split(':');

      if (orderParams.length === 2) {
        const [field, direction] = orderParams;
        const prismaDirection =
          direction.toLowerCase() === 'desc' ? 'desc' : 'asc';
        parsedOrderBy[field] = prismaDirection;
      }
    }

    return parsedOrderBy;
  }

  /**
   * Parses the 'where' query parameter into a format suitable for Prisma's where option.
   *
   * @param {string} where - The 'where' query parameter (e.g., 'name:John' or 'age:gte:25').
   * @returns {Prisma.UserWhereInput | Prisma.TaskWhereInput} - The parsed where object.
   */
  parseWhere(where: string): Prisma.UserWhereInput | Prisma.TaskWhereInput {
    const parsedWhere: Prisma.UserWhereInput | Prisma.TaskWhereInput = {};

    if (where) {
      const clauses = where.split(';');

      clauses.forEach((clause) => {
        const [field, value] = clause.split(':');

        parsedWhere[field] = value;
      });
    }

    return parsedWhere;
  }
}
