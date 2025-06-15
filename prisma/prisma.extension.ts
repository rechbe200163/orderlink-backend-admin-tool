import { Prisma, PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

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
      },
    },
  });

export type ExtendedPrismaClient = typeof extendedPrismaClient;

function addNotDeletedFilter(where: any = {}) {
  if ('deleted' in where || typeof where !== 'object') {
    return where;
  }

  return {
    AND: [{ deleted: false }, where],
  };
}
