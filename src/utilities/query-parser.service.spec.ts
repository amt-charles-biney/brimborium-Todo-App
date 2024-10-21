import { Test, TestingModule } from '@nestjs/testing';
import { QueryParserService } from './query-parser.service';

describe('QueryParserService', () => {
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

  it('should parse an empty query string', () => {
    const query = '';
    const result = service.parseQuery(query);

    expect(result).toEqual({});
  });

  it('should parse a query string with single key-value pair', () => {
    const query = 'name:Kwesi';
    const result = service.parseQuery(query);

    expect(result).toEqual({ name: 'Kwesi' });
  });

  it('should parse a query string with multiple key-value pairs', () => {
    const query = 'name:Kwesi;age:30;city:Takoradi';
    const result = service.parseQuery(query);

    expect(result).toEqual({ name: 'Kwesi', age: '30', city: 'Takoradi' });
  });

  it('should handle empty values', () => {
    const query = 'name:Kwesi;age:;city:';
    const result = service.parseQuery(query);

    expect(result).toEqual({ name: 'Kwesi', age: '', city: '' });
  });

  it('should handle duplicate keys by overwriting values', () => {
    const query = 'name:Kwesi;name:Kingston';
    const result = service.parseQuery(query);

    expect(result).toEqual({ name: 'Kingston' });
  });

  it('should handle spaces in values', () => {
    const query = 'name:Kwesi Smith;city:Takoradi';
    const result = service.parseQuery(query);

    expect(result).toEqual({ name: 'Kwesi Smith', city: 'Takoradi' });
  });
});
