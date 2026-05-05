// prisma/seed.ts
/* eslint-disable no-console */

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

import { randomUUID } from 'crypto';
import { BusinessSector, OrderState, PrismaClient } from '../generated/client';

const adapter = new PrismaPg({
  connectionString:
    'postgresql://neondb_owner:npg_a2fYIQdGgi9x@ep-sparkling-tooth-ahiq4zef-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});
const prisma = new PrismaClient({ adapter });

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'admin@orderlink.at';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'admin1234';
const SUPER_ADMIN_FIRST_NAME = process.env.SUPER_ADMIN_FIRST_NAME ?? 'Super';
const SUPER_ADMIN_LAST_NAME = process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin';

async function ensureSuperAdmin() {
  const passwordHash = await hash(SUPER_ADMIN_PASSWORD, 10);

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      deleted: false,
    },
    create: {
      name: 'ADMIN',
      deleted: false,
    },
  });

  const existing = await prisma.employees.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.employees.update({
      where: { employeeId: existing.employeeId },
      data: {
        password: passwordHash,
        firstName: SUPER_ADMIN_FIRST_NAME,
        lastName: SUPER_ADMIN_LAST_NAME,
        deleted: false,
        roleId: adminRole.roleId,
      },
    });
    console.log(`🔐 Super admin updated: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  await prisma.employees.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      password: passwordHash,
      firstName: SUPER_ADMIN_FIRST_NAME,
      lastName: SUPER_ADMIN_LAST_NAME,
      deleted: false,
      roleId: adminRole.roleId,
    },
  });

  console.log(`🔐 Super admin created: ${SUPER_ADMIN_EMAIL}`);
}

/**
 * -------------------------
 * CLI PARSING (no deps)
 * -------------------------
 */
type Mode = 'help' | 'all' | 'customers' | 'orders' | 'employee';

type SeedArgs = {
  mode: Mode;
  customers: number;
  maxOrdersPerCustomer: number;
  ordersTotal: number | null; // wenn gesetzt: fixe Gesamtanzahl Orders
  ensureProducts: number | null;
  addProducts: number;
  touchProducts: boolean;
};

function hasFlag(argv: string[], flag: string) {
  return argv.includes(flag);
}
function getArgValue(argv: string[], key: string): string | null {
  // supports: --key 123  OR  --key=123
  const eq = argv.find((a) => a.startsWith(`${key}=`));
  if (eq) return eq.split('=').slice(1).join('=') || null;
  const idx = argv.indexOf(key);
  if (idx >= 0 && argv[idx + 1] && !argv[idx + 1].startsWith('--'))
    return argv[idx + 1];
  return null;
}
function toInt(v: string | null, fallback: number) {
  if (v === null) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseArgs(argvRaw: string[]): SeedArgs {
  const argv = argvRaw.slice(2); // node, script, command, ...args
  const command = argv[0];
  const optionArgs =
    command && !command.startsWith('--') ? argv.slice(1) : argv;

  let mode: Mode = 'help';

  switch (command) {
    case 'all':
      mode = 'all';
      break;
    case 'customers':
    case 'customers-only':
      mode = 'customers';
      break;
    case 'orders':
    case 'orders-only':
      mode = 'orders';
      break;
    case 'employee':
    case 'employee-only':
      mode = 'employee';
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      mode = 'help';
      break;
    default:
      mode = 'help';
      break;
  }

  const customers = toInt(getArgValue(optionArgs, '--customers'), 120);
  const maxOrdersPerCustomer = toInt(
    getArgValue(optionArgs, '--max-orders-per-customer'),
    18,
  );

  const ordersTotalStr = getArgValue(optionArgs, '--orders');
  const ordersTotal = ordersTotalStr
    ? Math.max(0, Number.parseInt(ordersTotalStr, 10))
    : null;

  const touchProducts = !hasFlag(optionArgs, '--no-products');
  const ensureProductsStr = getArgValue(optionArgs, '--ensure-products');
  const ensureProducts = ensureProductsStr
    ? Math.max(0, Number.parseInt(ensureProductsStr, 10))
    : touchProducts
      ? 80
      : null;

  const addProducts = touchProducts
    ? toInt(getArgValue(optionArgs, '--add-products'), 30)
    : 0;

  return {
    mode,
    customers,
    maxOrdersPerCustomer,
    ordersTotal: Number.isFinite(ordersTotal as any) ? ordersTotal : null,
    ensureProducts,
    addProducts,
    touchProducts,
  };
}

function printHelp() {
  console.log(`
🌱 OrderLink Seed Script

Usage:
  pnpm seed <command> [options]

Commands:
  help        Show this help output
  employee    Seed only the super admin employee and site config
  customers   Seed customers only
  orders      Seed orders for existing customers only
  all         Seed products, customers and orders

Examples:
  pnpm seed help
  pnpm seed employee
  pnpm seed all --customers 120 --max-orders-per-customer 18
  pnpm seed customers --customers 50
  pnpm seed orders --orders 2000
  pnpm seed all --ensure-products 80 --add-products 30
  pnpm seed all --no-products

Options:
  --customers <number>                 Customer count for customers/all commands. Default: 120
  --max-orders-per-customer <number>   Max random orders per created customer. Default: 18
  --orders <number>                    Fixed total order count
  --ensure-products <number>           Ensure at least this many products exist. Default: 80
  --add-products <number>              Add this many products per run. Default: 30
  --no-products                        Do not create or touch products

Environment variables:
  SUPER_ADMIN_EMAIL                    Default: admin@orderlink.at
  SUPER_ADMIN_PASSWORD                 Default: admin1234
  SUPER_ADMIN_FIRST_NAME               Default: Super
  SUPER_ADMIN_LAST_NAME                Default: Admin
`);
}

/**
 * -------------------------
 * HELPERS
 * -------------------------
 */
const RUN_ID = randomUUID().slice(0, 8);
const NOW = new Date();
const SIGNUP_FROM = new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 365 * 3);
const ORDER_FROM = new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 365 * 2.5);

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function maybe<T>(value: T, probability = 0.5): T | null {
  return Math.random() < probability ? value : null;
}
function randomDateBetween(from: Date, to: Date) {
  const ms = randInt(from.getTime(), to.getTime());
  return new Date(ms);
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function addMinutes(date: Date, minutes: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
function normalizeEmail(s: string) {
  return s.toLowerCase().replace(/\s+/g, '.');
}

const firstNames = [
  'Michael',
  'Lena',
  'Anna',
  'Julia',
  'Noah',
  'Elias',
  'Marie',
  'David',
  'Sophie',
  'Paul',
  'Leon',
  'Mia',
  'Laura',
  'Felix',
  'Jakob',
  'Sarah',
  'Lisa',
  'Nina',
  'Florian',
  'Jonas',
  'Tobias',
  'Emilia',
  'Charlotte',
  'Hannah',
  'Simon',
  'Valentin',
  'Katharina',
  'Theresa',
  'Fabian',
  'Matthias',
];

const lastNames = [
  'Mayer',
  'Huber',
  'Wagner',
  'Gruber',
  'Bauer',
  'Steiner',
  'Fischer',
  'Weber',
  'Schmid',
  'Schneider',
  'Hofer',
  'Berger',
  'Winter',
  'Pichler',
  'Eder',
  'Koch',
  'Leitner',
  'Kaiser',
  'Seidl',
  'Auer',
];

const cities = [
  'Wien',
  'Graz',
  'Linz',
  'Salzburg',
  'Innsbruck',
  'Klagenfurt',
  'Villach',
  'St. Pölten',
  'Wels',
  'Bregenz',
];
const states = [
  'Wien',
  'Steiermark',
  'Oberösterreich',
  'Salzburg',
  'Tirol',
  'Kärnten',
  'Niederösterreich',
  'Vorarlberg',
  'Burgenland',
];
const streetNames = [
  'Hauptstraße',
  'Bahnhofstraße',
  'Kirchengasse',
  'Schulgasse',
  'Parkweg',
  'Ringstraße',
  'Bergstraße',
  'Dorfstraße',
  'Waldweg',
  'Gartenweg',
];
const countries = ['AT', 'DE', 'CH', 'IT', 'SI', 'CZ'];

const businessSectors: BusinessSector[] = [
  'AGRICULTURE',
  'CONSTRUCTION',
  'EDUCATION',
  'FINANCE',
  'HEALTH',
  'HOSPITALITY',
  'IT',
  'MANUFACTURING',
  'OTHER',
  'RETAIL',
  'TECHNOLOGY',
  'TOURISM',
  'TRANSPORTATION',
];

function randomPhone() {
  return `+43${randInt(600000000, 799999999)}`;
}
function randomPostCode(country: string) {
  if (country === 'AT') return `${randInt(1000, 9999)}`;
  if (country === 'DE') return `${randInt(10000, 99999)}`;
  if (country === 'CH') return `${randInt(1000, 9999)}`;
  return `${randInt(1000, 99999)}`;
}
function randomProductName() {
  const adjectives = [
    'Premium',
    'Classic',
    'Eco',
    'Pro',
    'Mini',
    'Max',
    'Smart',
    'Fresh',
    'Ultra',
    'Basic',
    'Daily',
    'Deluxe',
  ];
  const nouns = [
    'Box',
    'Pack',
    'Set',
    'Kit',
    'Bundle',
    'Bottle',
    'Bag',
    'Tool',
    'Device',
    'Item',
    'Tray',
    'Case',
  ];
  return `${pick(adjectives)} ${pick(nouns)} ${randInt(1, 9999)} (${RUN_ID})`;
}

function randomOrderState(orderDate: Date, selfCollect: boolean) {
  const ageDays = Math.floor(
    (NOW.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (ageDays > 120)
    return selfCollect ? OrderState.ORDER_COLLECTED : OrderState.DELIVERED;
  if (ageDays > 45)
    return pick([
      OrderState.DISPATCHED,
      OrderState.DELIVERED,
      OrderState.IN_PROGRESS,
    ]);
  if (ageDays > 10)
    return pick([
      OrderState.IN_PROGRESS,
      OrderState.DISPATCHED,
      OrderState.ORDER_PLACED,
    ]);
  return pick([OrderState.ORDER_PLACED, OrderState.IN_PROGRESS]);
}

function randomDeliveryDate(
  orderDate: Date,
  state: OrderState,
  selfCollect: boolean,
) {
  if (state === OrderState.ORDER_PLACED) return null;

  const base = addDays(orderDate, randInt(0, 21));
  const withTime = addMinutes(base, randInt(0, 60 * 12));

  if (selfCollect) {
    if (state !== OrderState.ORDER_COLLECTED && Math.random() < 0.45)
      return null;
    return withTime;
  }

  if (state === OrderState.IN_PROGRESS && Math.random() < 0.5) return null;
  if (state === OrderState.DISPATCHED && Math.random() < 0.2) return null;

  return withTime;
}

async function getNextCustomerReferenceStart(): Promise<number> {
  const agg = await prisma.customer.aggregate({
    _max: { customerReference: true },
  });
  return (agg._max.customerReference ?? 100000) + 1;
}

async function ensureProducts(
  ensureMin: number | null,
  addPerRun: number,
  touchProducts: boolean,
) {
  if (!touchProducts) {
    const list = await prisma.product.findMany({
      where: { deleted: false },
      select: { productId: true, price: true },
    });
    return list;
  }

  if (ensureMin !== null) {
    const existingCount = await prisma.product.count();
    if (existingCount < ensureMin) {
      const toAdd = ensureMin - existingCount;
      console.log(
        `📦 Only ${existingCount} products found. Adding ${toAdd} to reach ${ensureMin}...`,
      );
      await prisma.product.createMany({
        data: Array.from({ length: toAdd }).map((_, i) => {
          const createdAt = randomDateBetween(ORDER_FROM, NOW);
          const modifiedAt =
            Math.random() < 0.6 ? randomDateBetween(createdAt, NOW) : null;
          return {
            name: randomProductName() + `-min-${i + 1}`,
            price: randInt(199, 49999),
            description: `Auto-added (${RUN_ID})`,
            stock: randInt(0, 1000),
            imagePath:
              maybe(`/images/products/${randInt(1, 20)}.jpg`, 0.5) ?? undefined,
            createdAt,
            modifiedAt: modifiedAt ?? undefined,
            deleted: Math.random() < 0.03,
          };
        }),
      });
    }
  }

  if (addPerRun > 0) {
    console.log(`📦 Adding ${addPerRun} products for this run (${RUN_ID})...`);
    await prisma.product.createMany({
      data: Array.from({ length: addPerRun }).map((_, i) => {
        const createdAt = randomDateBetween(ORDER_FROM, NOW);
        const modifiedAt =
          Math.random() < 0.6 ? randomDateBetween(createdAt, NOW) : null;
        return {
          name: randomProductName() + `-run-${i + 1}`,
          price: randInt(199, 49999),
          description: `Run product (${RUN_ID})`,
          stock: randInt(0, 1000),
          imagePath:
            maybe(`/images/products/${randInt(1, 20)}.jpg`, 0.5) ?? undefined,
          createdAt,
          modifiedAt: modifiedAt ?? undefined,
          deleted: Math.random() < 0.03,
        };
      }),
    });
  }

  return prisma.product.findMany({
    where: { deleted: false },
    select: { productId: true, price: true },
  });
}

async function createCustomers(count: number) {
  let nextRef = await getNextCustomerReferenceStart();
  console.log(
    `👤 Creating ${count} customers (append-only) starting ref=${nextRef}...`,
  );

  const createdRefs: number[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const country = pick(countries);
    const city = pick(cities);
    const state = pick(states);

    const signedUp = randomDateBetween(SIGNUP_FROM, NOW);

    // modifiedAt stark gestreut
    const r = Math.random();
    let modifiedAt: Date | null = null;
    if (r < 0.35) modifiedAt = null;
    else if (r < 0.7)
      modifiedAt = randomDateBetween(
        signedUp,
        addDays(signedUp, randInt(0, 10)),
      );
    else
      modifiedAt = randomDateBetween(addDays(signedUp, randInt(30, 400)), NOW);

    const deleted = Math.random() < 0.04;

    const address = await prisma.address.create({
      data: {
        city,
        country,
        postCode: randomPostCode(country),
        state,
        streetName: pick(streetNames),
        streetNumber: `${randInt(1, 300)}${Math.random() < 0.2 ? pick(['A', 'B', 'C', 'D']) : ''}`,
        modifiedAt:
          Math.random() < 0.55 ? randomDateBetween(signedUp, NOW) : undefined,
        deleted: Math.random() < 0.02,
      },
    });

    // unique email: enthält RUN_ID + customerReference
    const email = `${normalizeEmail(firstName)}.${normalizeEmail(lastName)}.${RUN_ID}.${nextRef}@example.com`;

    await prisma.customer.create({
      data: {
        customerReference: nextRef,
        email,
        phoneNumber: randomPhone(),
        password: '$2b$10$seededHashReplaceMe',
        firstName: Math.random() < 0.88 ? firstName : undefined,
        lastName,
        companyNumber: maybe(`FN${randInt(10000, 999999)}`, 0.33) ?? undefined,
        signedUp,
        modifiedAt: modifiedAt ?? undefined,
        deleted,
        avatarPath: maybe(`/avatars/${randInt(1, 80)}.png`, 0.45) ?? undefined,
        addressId: address.addressId,
        businessSector: maybe(pick(businessSectors), 0.78) ?? undefined,
      },
    });

    createdRefs.push(nextRef);
    nextRef++;
  }

  console.log(`👤 Added customers=${count}`);
  return createdRefs;
}

async function createOrdersForCustomers(params: {
  customerRefs: number[];
  products: { productId: string; price: number }[];
  maxOrdersPerCustomer: number;
  ordersTotal: number | null;
}) {
  const { customerRefs, products, maxOrdersPerCustomer, ordersTotal } = params;

  if (customerRefs.length === 0) {
    console.log('🧾 No customers provided for order creation.');
    return 0;
  }

  // Wenn ordersTotal gesetzt: wir erstellen genau so viele Orders verteilt auf Random Customers
  // Sonst: pro Customer 0..maxOrdersPerCustomer
  const ordersToCreate: number[] = [];

  if (ordersTotal !== null) {
    for (let i = 0; i < ordersTotal; i++) {
      ordersToCreate.push(pick(customerRefs));
    }
  } else {
    for (const ref of customerRefs) {
      const n = randInt(0, maxOrdersPerCustomer);
      for (let i = 0; i < n; i++) ordersToCreate.push(ref);
    }
  }

  console.log(`🧾 Creating orders=${ordersToCreate.length} (append-only)...`);

  let created = 0;

  for (const customerReference of ordersToCreate) {
    const orderDate = randomDateBetween(ORDER_FROM, NOW);

    const selfCollect = Math.random() < 0.27;
    const state = randomOrderState(orderDate, selfCollect);
    const deliveryDate = randomDeliveryDate(orderDate, state, selfCollect);

    const order = await prisma.order.create({
      data: {
        customerReference,
        orderDate,
        deliveryDate: deliveryDate ?? undefined,
        deleted: Math.random() < 0.02,
        orderState: state,
        selfCollect,
      },
    });

    // 1..7 Produkte je Order
    const items = randInt(1, 7);
    const used = new Set<string>();

    for (let k = 0; k < items; k++) {
      const p = pick(products);
      if (used.has(p.productId)) continue;
      used.add(p.productId);

      await prisma.orderOnProducts.create({
        data: {
          orderId: order.orderId,
          productId: p.productId,
          orderDate: addMinutes(orderDate, randInt(-240, 720)),
          productAmount: randInt(1, 20),
        },
      });
    }

    // Invoice manchmal (unique orderId -> safe)
    const wantInvoice =
      state === OrderState.DELIVERED || state === OrderState.ORDER_COLLECTED
        ? Math.random() < 0.85
        : Math.random() < 0.1;

    if (wantInvoice) {
      const lines = await prisma.orderOnProducts.findMany({
        where: { orderId: order.orderId },
        include: { product: true },
      });
      const amount = lines.reduce(
        (sum, l) => sum + l.product.price * l.productAmount,
        0,
      );

      const paymentDate =
        Math.random() < 0.85
          ? randomDateBetween(orderDate, addDays(orderDate, 45))
          : null;

      await prisma.invoice.create({
        data: {
          orderId: order.orderId,
          invoiceAmount: amount,
          paymentDate: paymentDate ?? undefined,
          pdfUrl: `/invoices/${order.orderId}.pdf`,
          deleted: Math.random() < 0.01,
        },
      });
    }

    created++;
  }

  console.log(`🧾 Added orders=${created}`);
  return created;
}

async function getRandomExistingCustomerRefs(limit = 5000): Promise<number[]> {
  // holt zufällig viele customerReferences (nicht perfekt random, aber gut genug)
  const rows = await prisma.customer.findMany({
    select: { customerReference: true },
    where: { deleted: false },
    orderBy: { signedUp: 'desc' },
    take: limit,
  });

  // shuffle
  for (let i = rows.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  return rows.map((r) => r.customerReference);
}

async function ensureSiteConfig() {
  const existing = await prisma.siteConfig.findFirst({
    where: { deleted: false },
  });

  if (existing) {
    console.log('⚙️ Site config already exists.');
    return;
  }

  const address = await prisma.address.create({
    data: {
      city: 'Graz',
      country: 'AT',
      postCode: '8010',
      state: 'Steiermark',
      streetName: 'Musterstraße',
      streetNumber: '1',
      deleted: false,
    },
  });

  await prisma.siteConfig.create({
    data: {
      companyName: 'OrderLink',
      logoPath: '/logo.png',
      email: 'office@orderlink.at',
      phoneNumber: '+436641234567',
      iban: 'AT000000000000000000',
      companyNumber: 'FN000000x',
      addressId: address.addressId,
      isPremium: false,
      deleted: false,
      stripeConfigured: false,
    },
  });

  console.log('⚙️ Site config created.');
}

/**
 * -------------------------
 * MAIN
 * -------------------------
 */
async function main() {
  const args = parseArgs(process.argv);

  if (args.mode === 'help') {
    printHelp();
    return;
  }

  console.log(`🌱 Seeding RUN_ID=${RUN_ID}`);
  console.log('Args:', args);
  console.log(
    'DB:',
    process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/.*?:.*?@/, '//***:***@')
      : 'MISSING',
  );

  await prisma.$connect();

  await ensureSuperAdmin();
  await ensureSiteConfig();

  if (args.mode === 'employee') {
    console.log('✅ Employee seed done.');
    return;
  }

  const products = await ensureProducts(
    args.ensureProducts,
    args.addProducts,
    args.touchProducts,
  );
  if (args.mode !== 'customers' && products.length === 0) {
    throw new Error(
      'No products available (and --no-products was used). Create products first or allow products seeding.',
    );
  }

  let createdCustomerRefs: number[] = [];

  if (args.mode === 'all' || args.mode === 'customers') {
    createdCustomerRefs = await createCustomers(args.customers);
  }

  if (args.mode === 'all') {
    // Orders für neu erstellte Customers
    await createOrdersForCustomers({
      customerRefs: createdCustomerRefs,
      products,
      maxOrdersPerCustomer: args.maxOrdersPerCustomer,
      ordersTotal: args.ordersTotal,
    });
  }

  if (args.mode === 'orders') {
    // Orders für bestehende Customers
    const refs = await getRandomExistingCustomerRefs(5000);
    if (refs.length === 0) {
      console.log('No existing customers found. Create customers first.');
      return;
    }

    await createOrdersForCustomers({
      customerRefs: refs,
      products,
      maxOrdersPerCustomer: args.maxOrdersPerCustomer,
      ordersTotal: args.ordersTotal ?? 2000, // default für orders-only
    });
  }

  console.log('✅ Seed done.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
