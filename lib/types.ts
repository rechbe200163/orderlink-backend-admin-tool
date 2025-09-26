import { Customer, Employees } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export type AuthResultCustomer = {
  token: string;
  user: SanitizedCustomer;
  tenant: TenantInfo;
};

export type AuthResultEmployee = {
  token: string;
  user: SanitizedEmployee;
  tenant: TenantInfo;
};

export type TenantInfo = {
  tenantId: string;
  maxEmployees: number;
  trialEndsAt: Date | null;
  trialStartedAt: Date | null;
  status: string | null;
  enabledModules: string[];
};

export type SanitizedCustomer = Pick<
  Customer,
  'email' | 'customerReference' | 'avatarPath' | 'firstName' | 'lastName'
>;

export type SanitizedEmployee = Pick<
  Employees,
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'employeeId'
  | 'roleName'
  | 'superAdmin'
  | 'tenantId'
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
