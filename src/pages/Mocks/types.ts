import { HttpMethodType, TMock } from '../../types';

export type TMockFilters = {
  search: string;
  httpMethod: HttpMethodType | null;
  httpStatusCode: string | null;
};

export type TMockFormAction = {
  type: 'open' | 'close';
  payload?: TMock;
};

export type TMockFormState = {
  isOpened: boolean;
  mock?: TMock;
};
