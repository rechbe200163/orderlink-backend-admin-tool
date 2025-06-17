// src\interface\event-types.interface.ts
export interface EventPayloads {
  'customer.created': {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}
