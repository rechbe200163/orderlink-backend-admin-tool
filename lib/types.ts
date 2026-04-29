import { Request } from 'express';
import { Employees } from 'generated/client';

export type Token = {
  accessToken: string;
  issuedAt: number;
  expiresAt: number;
};

export type SanitizedEmployee = Pick<
  Employees,
  'email' | 'firstName' | 'lastName' | 'employeeId' | 'roleId' | 'superAdmin'
>;

export type JwtPayload = SanitizedEmployee;

export type AuthResult = {
  token: Token;
  user: SanitizedEmployee;
};

export type PagingData<T> = [
  data: T[],
  meta: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  },
];

export interface UserRequest extends Request {
  user?: JwtPayload;
  tenantId?: string;
}
