import { Actions, PrismaClient, Resources } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { withAccelerate } from '@prisma/extension-accelerate';

export const extendedPrismaClient = new PrismaClient()
  .$extends(pagination())
  // .$extends(withAccelerate())
  // .$extends(
  //   readReplicas({
  //     url: process.env.DATABASE_URL_REPLICA!,
  //   }),
  // )
  .$extends({
    model: {
      customer: {
        findCustomerByEmail: async (email: string) => {
          return extendedPrismaClient.customer.findFirst({
            where: { email },
          });
        },
        findByReference: (tenantId: string, reference: number) =>
          extendedPrismaClient.customer.findUnique({
            where: {
              tenantId_customerReference: {
                tenantId,
                customerReference: reference,
              },
            },
          }),
        findWithCart: (reference: number) =>
          extendedPrismaClient.customer.findUnique({
            where: { customerReference: reference },
            include: { cart: { include: { products: true } } },
          }),
      },
      employees: {
        findEmployeeByEmail: async (tenantId: string, email: string) => {
          return extendedPrismaClient.employees.findFirst({
            where: { email, tenantId },
          });
        },
        findEmployeeByEmailAuth: async (email: string) => {
          return extendedPrismaClient.employees.findFirst({
            where: { email },
          });
        },
        findByRole: async (tenantId: string, role: string) => {
          return extendedPrismaClient.employees.findMany({
            where: { tenantId, roleName: role },
          });
        },
        findById: async (tenantId: string, employeeId: string) => {
          return extendedPrismaClient.employees.findUnique({
            where: {
              employee_tenant_employeeId_unique: {
                employeeId,
                tenantId,
              },
            },
          });
        },
        findByPermission: async (
          tenantId: string,
          paging: {
            limit: number;
            page: number;
          },
          permissions: {
            resource: Resources;
            action: Actions;
            allowed: boolean;
          },
        ) => {
          // Set default values if not provided
          const limit = paging.limit ?? 10;
          const page = paging.page ?? 1;
          return extendedPrismaClient.employees
            .paginate({
              where: {
                tenantId,
                Role: {
                  permissions: {
                    some: {
                      resource: permissions.resource,
                      action: permissions.action,
                      allowed: permissions.allowed,
                    },
                  },
                },
              },
            })
            .withPages({
              limit,
              page,
              includePageCount: true, // Include total page count
            });
        },
      },
      role: {
        findByName: async (tenantId: string, name: string) => {
          return extendedPrismaClient.role.findFirst({
            where: { name, tenantId },
          });
        },
      },
    },
  });

export type ExtendedPrismaClient = typeof extendedPrismaClient;
