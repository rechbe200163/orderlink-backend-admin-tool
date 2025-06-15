import { Customer, Employees } from '@prisma/client';

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
  'email' | 'firstName' | 'lastName' | 'employeeId' | 'role'
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
