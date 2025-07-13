import {
  Actions,
  BusinessSector,
  PrismaClient,
  Resources,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string) {
  const saltRounds = 10;
  return hash(plain, saltRounds);
}

async function main() {
  const password = await hashPassword('Kennwort1');

  // 1. Seed Actions
  const actionEnums = Object.values(Actions);
  const actions = await Promise.all(
    actionEnums.map((name) => prisma.action.create({ data: { name } })),
  );

  // 2. Seed Resources
  const resourceEnums = Object.values(Resources);
  const resources = await Promise.all(
    resourceEnums.map((name) => prisma.resource.create({ data: { name } })),
  );

  // 3. Create ResourceActions (all combinations)
  await Promise.all(
    actions.flatMap((action) =>
      resources.map((resource) =>
        prisma.resourceAction.create({
          data: {
            action: action.name,
            resource: resource.name,
          },
        }),
      ),
    ),
  );

  // 4. Create ADMIN Role
  const role = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Full access administrator',
    },
  });

  // 5. Create an Employee with ADMIN role
  await prisma.employees.create({
    data: {
      email: faker.internet.email(),
      password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: role.name,
    },
  });

  // 6. Assign 10 random permissions to ADMIN role
  const allResourceActions = await prisma.resourceAction.findMany();
  const randomSubset = faker.helpers.arrayElements(allResourceActions, 10);
  await Promise.all(
    randomSubset.map((ra) =>
      prisma.permission.create({
        data: {
          role: role.name,
          action: ra.action,
          resource: ra.resource,
          allowed: true,
        },
      }),
    ),
  );

  // 7. Create Addresses
  const addresses = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.address.create({
        data: {
          city: faker.location.city(),
          country: faker.location.country(),
          postCode: faker.location.zipCode(),
          state: faker.location.state(),
          streetName: faker.location.street(),
          streetNumber: faker.location.buildingNumber(),
        },
      }),
    ),
  );

  // 8. Create Customers
  const customers = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.customer.create({
        data: {
          customerReference: 1000 + i,
          email: faker.internet.email(),
          phoneNumber: faker.phone.number({ style: 'international' }),
          password,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          companyNumber: faker.company.name(),
          addressId: addresses[i % addresses.length].addressId,
          businessSector: faker.helpers.arrayElement(
            Object.values(BusinessSector),
          ),
        },
      }),
    ),
  );

  // 9. Create Carts for Customers
  const carts = await Promise.all(
    customers.map((customer) =>
      prisma.cart.create({
        data: {
          customerReference: customer.customerReference,
        },
      }),
    ),
  );

  // 10. Create Categories
  const categories = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.category.create({
        data: {
          name:
            faker.commerce.department() + ' ' + faker.string.uuid().slice(0, 4),
          imagePath: faker.image.urlLoremFlickr({ category: 'business' }),
        },
      }),
    ),
  );

  // 11. Create Products with category relation
  const products = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseInt(faker.commerce.price({ min: 100, max: 10000 })),
          description: faker.commerce.productDescription(),
          stock: faker.number.int({ min: 10, max: 100 }),
          imagePath: faker.image.urlLoremFlickr({ category: 'product' }),
          categoryId: categories[i % categories.length].categoryId,
        },
      }),
    ),
  );

  // 12. Add Products to Carts
  await Promise.all(
    carts.map((cart, i) =>
      prisma.cartOnProducts.create({
        data: {
          cartId: cart.cartId,
          productId: products[i % products.length].productId,
          quantity: faker.number.int({ min: 1, max: 5 }),
        },
      }),
    ),
  );

  // 13. Create Orders
  const orders = await Promise.all(
    customers.map((customer) =>
      prisma.order.create({
        data: {
          customerReference: customer.customerReference,
          orderState: 'ORDER_PLACED',
          selfCollect: faker.datatype.boolean(),
          deliveryDate: faker.date.soon(),
        },
      }),
    ),
  );

  // 14. Add Products to Orders
  await Promise.all(
    orders.map((order, i) =>
      prisma.orderOnProducts.create({
        data: {
          orderId: order.orderId,
          productId: products[i % products.length].productId,
          productAmount: faker.number.int({ min: 1, max: 3 }),
        },
      }),
    ),
  );

  // 15. Create Invoices
  await Promise.all(
    orders.map((order) =>
      prisma.invoice.create({
        data: {
          orderId: order.orderId,
          invoiceAmount: faker.number.int({ min: 500, max: 10000 }),
          pdfUrl: `https://fakepdf.com/invoice-${order.orderId}.pdf`,
        },
      }),
    ),
  );

  // 16. Create Routes
  const routes = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.route.create({
        data: {
          name: faker.location.street(),
        },
      }),
    ),
  );

  // 17. Assign Routes to Orders
  await Promise.all(
    orders.map((order, i) =>
      prisma.routesOnOrders.create({
        data: {
          orderId: order.orderId,
          routeId: routes[i % routes.length].routeId,
        },
      }),
    ),
  );

  // 18. Create Site Config
  await prisma.siteConfig.create({
    data: {
      companyName: faker.company.name(),
      logoPath: faker.image.urlPicsumPhotos(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number({ style: 'international' }),
      iban: faker.finance.iban(),
      companyNumber: faker.string.uuid(),
      addressId: addresses[0].addressId,
    },
  });

  console.log('✅ Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
