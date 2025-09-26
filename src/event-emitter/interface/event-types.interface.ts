// src\interface\event-types.interface.ts
export interface EventPayloads {
  'customer.created': {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  'employee.created': {
    tenant: {
      tenantSlug: string;
      tenantId: string;
    };
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  'access-violation': {
    tenantId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    resource: string;
    action: string;
  };
  'permission.requested': {
    tenantId: string;
    employeeId: string;
    role: string;
    resource: string;
    actions: string[];
  };
  'product.updated': {
    tenantId: string;
    productId: string;
    name: string;
    price: number;
    description: string;
    stock: number;
    imagePath: string | null;
    categoryId: string;
  };
  'product.created': {
    productId: string;
    name: string;
    price: number;
    description: string;
    stock: number;
    imagePath: string | null;
    categoryId: string;
  };
  'order.created': {
    tenantId: string;
    orderId: string;
    customerReference: number;
    items: Array<{
      productId: string;
      productAmount: number;
    }>;
  };
  'otp.resend': {
    tenantId: string;
    employeeId: string;
    otpCode: number;
  };
}
