// src\interface\event-types.interface.ts
export interface EventPayloads {
  'customer.created': {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  'employee.created': {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
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
}
