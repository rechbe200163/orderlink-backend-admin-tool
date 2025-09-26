-- CreateEnum
CREATE TYPE "public"."Actions" AS ENUM ('READ', 'DELETE', 'UPDATE', 'CREATE');

-- CreateEnum
CREATE TYPE "public"."Resources" AS ENUM ('PRODUCT', 'ORDER', 'CUSTOMER', 'CART', 'ADDRESS', 'INVOICE', 'EMPLOYEE', 'ROLE', 'ROUTES', 'SITE_CONFIG', 'CATEGORY', 'ACTION', 'PERMISSION', 'STATISTICS', 'OTP');

-- CreateEnum
CREATE TYPE "public"."OrderState" AS ENUM ('ORDER_PLACED', 'IN_PROGRESS', 'DISPATCHED', 'DELIVERED', 'ORDER_COLLECTED');

-- CreateEnum
CREATE TYPE "public"."BusinessSector" AS ENUM ('AGRICULTURE', 'CONSTRUCTION', 'EDUCATION', 'FINANCE', 'HEALTH', 'HOSPITALITY', 'IT', 'MANUFACTURING', 'OTHER', 'RETAIL', 'TECHNOLOGY', 'TOURISM', 'TRANSPORTATION');

-- CreateEnum
CREATE TYPE "public"."TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ModuleEnum" AS ENUM ('CUSTOM_ROLES', 'STATISTICS', 'NAVIGATION');

-- CreateTable
CREATE TABLE "public"."tenantData" (
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "status" "public"."TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "trialStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '3 days'),
    "billingCustomerId" TEXT,
    "maxEmployees" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenantData_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "public"."SiteConfig" (
    "tenantId" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoPath" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "iban" TEXT,
    "companyNumber" TEXT,
    "addressId" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("tenantId","siteConfigId")
);

-- CreateTable
CREATE TABLE "public"."addresses" (
    "tenantId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(40) NOT NULL,
    "postCode" VARCHAR(10) NOT NULL,
    "state" VARCHAR(40) NOT NULL,
    "streetName" VARCHAR(255) NOT NULL,
    "streetNumber" VARCHAR(30) NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("tenantId","addressId")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerReference" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255) NOT NULL,
    "companyNumber" VARCHAR(255),
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "signedUp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatarPath" VARCHAR(255),
    "addressId" TEXT NOT NULL,
    "businessSector" "public"."BusinessSector",

    CONSTRAINT "customers_pkey" PRIMARY KEY ("tenantId","customerReference")
);

-- CreateTable
CREATE TABLE "public"."customerHistory" (
    "tenantId" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "customerReference" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255) NOT NULL,
    "companyNumber" VARCHAR(255),
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "signedUp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatarPath" VARCHAR(255),
    "addressId" TEXT NOT NULL,
    "businessSector" "public"."BusinessSector",

    CONSTRAINT "customerHistory_pkey" PRIMARY KEY ("tenantId","historyId")
);

-- CreateTable
CREATE TABLE "public"."carts" (
    "tenantId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "customerReference" INTEGER,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("tenantId","cartId")
);

-- CreateTable
CREATE TABLE "public"."cartsProducts" (
    "tenantId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productAmount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cartsProducts_pkey" PRIMARY KEY ("tenantId","cartId","productId")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "imagePath" VARCHAR(255),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("tenantId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "stock" INTEGER NOT NULL,
    "imagePath" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("tenantId","productId")
);

-- CreateTable
CREATE TABLE "public"."productHistory" (
    "tenantId" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "stock" INTEGER NOT NULL,
    "imagePath" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "version" SERIAL NOT NULL,

    CONSTRAINT "productHistory_pkey" PRIMARY KEY ("tenantId","historyId")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerReference" INTEGER NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "orderState" "public"."OrderState" NOT NULL DEFAULT 'ORDER_PLACED',
    "selfCollect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("tenantId","orderId")
);

-- CreateTable
CREATE TABLE "public"."ordersProducts" (
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productAmount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ordersProducts_pkey" PRIMARY KEY ("tenantId","orderId","productId")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "invoiceAmount" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" VARCHAR(255) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("tenantId","invoiceId")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("tenantId","routeId")
);

-- CreateTable
CREATE TABLE "public"."routesOrders" (
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "routesOrders_pkey" PRIMARY KEY ("tenantId","routeId","orderId")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "name" "public"."ModuleEnum" NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."EnabledModule" (
    "tenantId" TEXT NOT NULL,
    "moduleName" "public"."ModuleEnum" NOT NULL,
    "id" TEXT NOT NULL,
    "enabledAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnabledModule_pkey" PRIMARY KEY ("tenantId","moduleName")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "roleId" TEXT NOT NULL,
    "description" VARCHAR(255),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("tenantId","name")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "roleName" VARCHAR(255) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("tenantId","employeeId")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "tenantId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "action" "public"."Actions" NOT NULL,
    "resource" "public"."Resources" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("tenantId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenantData_slug_key" ON "public"."tenantData"("slug");

-- CreateIndex
CREATE INDEX "tenant_name_index" ON "public"."tenantData"("name");

-- CreateIndex
CREATE INDEX "tenant_slug_index" ON "public"."tenantData"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_tenantId_key" ON "public"."SiteConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_tenantId_email_key" ON "public"."SiteConfig"("tenantId", "email");

-- CreateIndex
CREATE INDEX "address_tenant_post_code_index" ON "public"."addresses"("tenantId", "postCode");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_tenantId_addressId_key" ON "public"."addresses"("tenantId", "addressId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerReference_key" ON "public"."customers"("customerReference");

-- CreateIndex
CREATE INDEX "customer_tenant_last_name_index" ON "public"."customers"("tenantId", "lastName");

-- CreateIndex
CREATE INDEX "customer_tenant_address_index" ON "public"."customers"("tenantId", "addressId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenantId_customerReference_key" ON "public"."customers"("tenantId", "customerReference");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenantId_email_key" ON "public"."customers"("tenantId", "email");

-- CreateIndex
CREATE INDEX "customer_history_customer_ref_index" ON "public"."customerHistory"("tenantId", "customerReference");

-- CreateIndex
CREATE UNIQUE INDEX "customerHistory_tenantId_customerReference_historyId_key" ON "public"."customerHistory"("tenantId", "customerReference", "historyId");

-- CreateIndex
CREATE INDEX "cart_tenant_index" ON "public"."carts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_tenantId_customerReference_key" ON "public"."carts"("tenantId", "customerReference");

-- CreateIndex
CREATE INDEX "cart_products_tenant_index" ON "public"."cartsProducts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenantId_name_key" ON "public"."categories"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenantId_categoryId_key" ON "public"."categories"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "product_tenant_category_index" ON "public"."products"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "product_tenant_name_index" ON "public"."products"("tenantId", "name");

-- CreateIndex
CREATE INDEX "product_history_tenant_product_index" ON "public"."productHistory"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "order_tenant_customer_index" ON "public"."orders"("tenantId", "customerReference");

-- CreateIndex
CREATE INDEX "order_tenant_date_index" ON "public"."orders"("tenantId", "orderDate");

-- CreateIndex
CREATE INDEX "order_products_tenant_index" ON "public"."ordersProducts"("tenantId");

-- CreateIndex
CREATE INDEX "invoice_tenant_index" ON "public"."invoices"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_orderId_key" ON "public"."invoices"("tenantId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenantId_invoiceId_key" ON "public"."invoices"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "route_tenant_name_index" ON "public"."routes"("tenantId", "name");

-- CreateIndex
CREATE INDEX "route_orders_tenant_order_index" ON "public"."routesOrders"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "enabled_module_tenant_index" ON "public"."EnabledModule"("tenantId");

-- CreateIndex
CREATE INDEX "enabled_module_name_index" ON "public"."EnabledModule"("moduleName");

-- CreateIndex
CREATE INDEX "role_tenant_name_unique" ON "public"."roles"("tenantId", "name");

-- CreateIndex
CREATE INDEX "role_tenant_index" ON "public"."roles"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenantId_name_key" ON "public"."roles"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "public"."employees"("email");

-- CreateIndex
CREATE INDEX "employee_tenant_last_name_index" ON "public"."employees"("tenantId", "lastName");

-- CreateIndex
CREATE INDEX "employee_role_index" ON "public"."employees"("tenantId", "roleName");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenantId_employeeId_key" ON "public"."employees"("tenantId", "employeeId");

-- CreateIndex
CREATE INDEX "permission_role_index" ON "public"."Permission"("tenantId", "roleName", "action", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_tenantId_roleName_action_resource_key" ON "public"."Permission"("tenantId", "roleName", "action", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_tenantId_permissionId_key" ON "public"."Permission"("tenantId", "permissionId");

-- CreateIndex
CREATE INDEX "otp_employee_index" ON "public"."Otp"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_tenantId_code_key" ON "public"."Otp"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "public"."SiteConfig" ADD CONSTRAINT "SiteConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SiteConfig" ADD CONSTRAINT "SiteConfig_tenantId_addressId_fkey" FOREIGN KEY ("tenantId", "addressId") REFERENCES "public"."addresses"("tenantId", "addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_tenantId_addressId_fkey" FOREIGN KEY ("tenantId", "addressId") REFERENCES "public"."addresses"("tenantId", "addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customerHistory" ADD CONSTRAINT "customerHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customerHistory" ADD CONSTRAINT "customerHistory_tenantId_customerReference_fkey" FOREIGN KEY ("tenantId", "customerReference") REFERENCES "public"."customers"("tenantId", "customerReference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_tenantId_customerReference_fkey" FOREIGN KEY ("tenantId", "customerReference") REFERENCES "public"."customers"("tenantId", "customerReference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cartsProducts" ADD CONSTRAINT "cartsProducts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cartsProducts" ADD CONSTRAINT "cartsProducts_tenantId_cartId_fkey" FOREIGN KEY ("tenantId", "cartId") REFERENCES "public"."carts"("tenantId", "cartId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cartsProducts" ADD CONSTRAINT "cartsProducts_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "public"."products"("tenantId", "productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_tenantId_categoryId_fkey" FOREIGN KEY ("tenantId", "categoryId") REFERENCES "public"."categories"("tenantId", "categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productHistory" ADD CONSTRAINT "productHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productHistory" ADD CONSTRAINT "productHistory_tenantId_categoryId_fkey" FOREIGN KEY ("tenantId", "categoryId") REFERENCES "public"."categories"("tenantId", "categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productHistory" ADD CONSTRAINT "productHistory_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "public"."products"("tenantId", "productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_tenantId_customerReference_fkey" FOREIGN KEY ("tenantId", "customerReference") REFERENCES "public"."customers"("tenantId", "customerReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ordersProducts" ADD CONSTRAINT "ordersProducts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ordersProducts" ADD CONSTRAINT "ordersProducts_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "public"."orders"("tenantId", "orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ordersProducts" ADD CONSTRAINT "ordersProducts_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "public"."products"("tenantId", "productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "public"."orders"("tenantId", "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routesOrders" ADD CONSTRAINT "routesOrders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routesOrders" ADD CONSTRAINT "routesOrders_tenantId_routeId_fkey" FOREIGN KEY ("tenantId", "routeId") REFERENCES "public"."routes"("tenantId", "routeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routesOrders" ADD CONSTRAINT "routesOrders_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "public"."orders"("tenantId", "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnabledModule" ADD CONSTRAINT "EnabledModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnabledModule" ADD CONSTRAINT "EnabledModule_moduleName_fkey" FOREIGN KEY ("moduleName") REFERENCES "public"."Module"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_tenantId_roleName_fkey" FOREIGN KEY ("tenantId", "roleName") REFERENCES "public"."roles"("tenantId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_tenantId_roleName_fkey" FOREIGN KEY ("tenantId", "roleName") REFERENCES "public"."roles"("tenantId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Otp" ADD CONSTRAINT "Otp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenantData"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Otp" ADD CONSTRAINT "Otp_tenantId_employeeId_fkey" FOREIGN KEY ("tenantId", "employeeId") REFERENCES "public"."employees"("tenantId", "employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
