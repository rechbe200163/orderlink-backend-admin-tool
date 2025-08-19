// src\interface\event-types.interface.ts
export interface EventPayloads {
  'customer.created': {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  'employee.created': {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  'access-violation': {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    resource: string;
    action: string;
  };
  'permission.requested': {
    employeeId: string;
    role: string;
    resource: string;
    actions: string[];
  };
  'product.updated': {
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
    orderId: string;
    customerReference: number;
    items: Array<{
      productId: string;
      productAmount: number;
    }>;
  };
  'otp.resend': {
    employeeId: string;
    otpCode: number;
  };
}
