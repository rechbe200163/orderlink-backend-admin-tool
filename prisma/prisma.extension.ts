import { ResourceAction } from './src/generated/dto/resourceAction.entity';
import { Actions, Prisma, PrismaClient, Ressources } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';
import { permission } from 'process';

export const extendedPrismaClient = new PrismaClient()
  .$extends(pagination())
  .$extends({
    model: {
      customer: {
        findCustomerByEmail: async (email: string) => {
          return extendedPrismaClient.customer.findFirst({
            where: { email },
          });
        },
        findByReference: (reference: number) =>
          extendedPrismaClient.customer.findUnique({
            where: { customerReference: reference },
          }),
        findWithCart: (reference: number) =>
          extendedPrismaClient.customer.findUnique({
            where: { customerReference: reference },
            include: { cart: { include: { products: true } } },
          }),
      },
      cart: {
        addProduct: async (cartId: string, productId: string, quantity = 1) => {
          return extendedPrismaClient.cartOnProducts.upsert({
            where: { cartId_productId: { cartId, productId } },
            update: { quantity: { increment: quantity } },
            create: { cartId, productId, quantity },
          });
        },
        removeProduct: async (cartId: string, productId: string) => {
          return extendedPrismaClient.cartOnProducts.delete({
            where: { cartId_productId: { cartId, productId } },
          });
        },
      },
      employees: {
        findEmployeeByEmail: async (email: string) => {
          return extendedPrismaClient.employees.findFirst({
            where: { email },
          });
        },
        findByRole: async (role: string) => {
          return extendedPrismaClient.employees.findMany({
            where: { role },
          });
        },
        findById: async (employeeId: string) => {
          return extendedPrismaClient.employees.findUnique({
            where: { employeeId },
          });
        },
        findByPermission: async (
          paging: {
            limit: number;
            page: number;
          },
          permissions: {
            resource: Ressources;
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
        findByName: async (name: string) => {
          return extendedPrismaClient.role.findFirst({
            where: { name },
          });
        },
      },
    },
  });

export type ExtendedPrismaClient = typeof extendedPrismaClient;
