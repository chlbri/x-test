import type { ERRORS } from './constants';
import type { NewsResponse } from './entities/objects';
import type { Category } from './entities/strings';

export type FetchNewsQuery = {
  categories?: Category[];
  offset?: number;
  limit?: number;
};

type Errors = typeof ERRORS;

export type Context = {
  API_URL?: string;
  API_KEY?: string;
  URL?: string;
  response?: Response;
  json?: unknown;
  news?: NewsResponse['news'];
  pagination?: NewsResponse['pagination'];
  categories?: string;
  _errors?: Errors['object'];
  errors?: Errors['array'];
};

export type Events = {
  type: 'QUERY';
} & FetchNewsQuery;
