import { Test, TestingModule } from '@nestjs/testing';
import { QueryParserService } from './user-query-parser.service';

describe('UserQueryParserService', () => {
  let service: QueryParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryParserService],
    }).compile();

    service = module.get<QueryParserService>(QueryParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
