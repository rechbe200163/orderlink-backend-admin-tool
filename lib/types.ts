import { Customer, Employees } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export type AuthResultCustomer = {
  token: string;
  user: SanitizedCustomer;
};

export type AuthResultEmployee = {
  token: string;
  user: SanitizedEmployee;
};

export type SanitizedCustomer = Pick<
  Customer,
  'email' | 'customerReference' | 'avatarPath' | 'firstName' | 'lastName'
>;

export type SanitizedEmployee = Pick<
  Employees,
  'email' | 'firstName' | 'lastName' | 'employeeId' | 'role' | 'superAdmin'
>;

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

export interface FastifyUserRequest extends FastifyRequest {
  user: SanitizedEmployee;
}
