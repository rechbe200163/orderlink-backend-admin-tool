import { BusinessSector, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string) {
  const saltRounds = 10;
  return hash(plain, saltRounds);
}

async function main() {
  const password = await hashPassword('Kennwort1');

  // 1. Insert Actions
  const actionEnums = ['READ', 'CREATE', 'UPDATE', 'DELETE'] as const;
  const actions = await Promise.all(
    actionEnums.map((name) => prisma.action.create({ data: { name } })),
  );

  // 2. Insert Ressources
  const resourceEnums = [
    'PRODUCT',
    'ORDER',
    'CUSTOMER',
    'CART',
    'ADDRESS',
    'INVOICE',
    'EMPLOYEE',
    'ROLE',
    'SITE_CONFIG',
    'CATEGORY',
    'ACTION',
  ] as const;
  const ressources = await Promise.all(
    resourceEnums.map((name) => prisma.ressource.create({ data: { name } })),
  );

  // 3. Create all ResourceAction combinations (action + resource)
  const role = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Full access administrator',
    },
  });

  // 5. Employee (assign ADMIN role)
  await prisma.employees.create({
    data: {
      email: faker.internet.email(),
      password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: role.name,
    },
  });

  // 6. Permission (for ADMIN → allow 10 random ResourceActions)
  const resourceActions = await prisma.resourceAction.findMany();

  await Promise.all(
    faker.helpers.arrayElements(resourceActions, 10).map((ra) =>
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
  // Create Addresses
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

  // Create Customers
  const customers = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.customer.create({
        data: {
          customerReference: 1000 + i,
          email: faker.internet.email(),
          phoneNumber: faker.phone.number({
            style: 'international',
          }),
          password,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          companyNumber: faker.company.name(),
          addressId: addresses[i % addresses.length].addressId,
          businessSector: faker.helpers.enumValue({
            AGRICULTURE: 'AGRICULTURE',
            CONSTRUCTION: 'CONSTRUCTION',
            EDUCATION: 'EDUCATION',
            FINANCE: 'FINANCE',
            HEALTH: 'HEALTH',
            HOSPITALITY: 'HOSPITALITY',
            IT: 'IT',
            MANUFACTURING: 'MANUFACTURING',
            OTHER: 'OTHER',
            RETAIL: 'RETAIL',
            TECHNOLOGY: 'TECHNOLOGY',
            TOURISM: 'TOURISM',
            TRANSPORTATION: 'TRANSPORTATION',
          }) as BusinessSector,
        },
      }),
    ),
  );

  // Carts
  const carts = await Promise.all(
    customers.map((customer) =>
      prisma.cart.create({
        data: {
          customerReference: customer.customerReference,
        },
      }),
    ),
  );

  // Categories
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

  // Products
  const products = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseInt(faker.commerce.price({ min: 100, max: 10000 })),
          description: faker.commerce.productDescription(),
          stock: faker.number.int({ min: 10, max: 100 }),
          imagePath: faker.image.urlLoremFlickr({ category: 'product' }),
        },
      }),
    ),
  );

  // Category-Product linking
  await Promise.all(
    products.map((product, i) =>
      prisma.categoriesOnProducts.create({
        data: {
          productId: product.productId,
          categoryId: categories[i % categories.length].categoryId,
        },
      }),
    ),
  );

  // CartOnProducts
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

  // Orders
  const orders = await Promise.all(
    customers.map((customer, i) =>
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

  // OrderOnProducts
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

  // Invoices
  await Promise.all(
    orders.map((order, i) =>
      prisma.invoice.create({
        data: {
          orderId: order.orderId,
          invoiceAmount: faker.number.int({ min: 500, max: 10000 }),
          pdfUrl: `https://fakepdf.com/invoice-${order.orderId}.pdf`,
        },
      }),
    ),
  );

  // Routes
  const routes = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.route.create({
        data: {
          name: faker.location.street(),
        },
      }),
    ),
  );

  // RoutesOnOrders
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

  // Site Configs
  await Promise.all(
    Array.from({ length: 1 }).map((_, i) =>
      prisma.siteConfig.create({
        data: {
          companyName: faker.company.name(),
          logoPath: faker.image.urlPicsumPhotos(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number({
            style: 'international',
          }),
          iban: faker.finance.iban(),
          companyNumber: faker.string.uuid(),
          addressId: addresses[i % addresses.length].addressId,
        },
      }),
    ),
  );

  console.log('✅ Seeding complete with faker.js!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
