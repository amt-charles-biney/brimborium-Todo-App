import { Injectable } from '@nestjs/common';

/**
 * Service responsible for parsing query parameters.
 */
@Injectable()
export class QueryParserService {
  /**
   * Parses a query string into an object.
   *
   * @param {string} query - The query string to parse, containing key-value pairs separated by semicolons.
   * @returns {Object} An object representing the parsed query with keys and values.
   */
  parseQuery(query: string): object {
    const parsedQuery: Record<string, string> = {};

    if (query) {
      const clauses = query.split(';');

      clauses.forEach((clause) => {
        const [field, value] = clause.split(':');

        parsedQuery[field] = value;
      });
    }

    return parsedQuery;
  }
}
