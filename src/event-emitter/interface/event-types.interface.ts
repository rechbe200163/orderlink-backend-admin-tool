// src\interface\event-types.interface.ts
export interface EventPayloads {
  'user.welcome': { firstName: string; lastName: string; email: string };
  'user.reset-password': { name: string; email: string; link: string };
  'user.verify-email': { name: string; email: string; otp: string };
  'maintenance.interval-reached': {
    bikeDetails: {
      brand: string;
      model: string;
      year: number;
      color: string;
      imagePath: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  'premium.subscription-created': {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    subscription: {
      id: string;
      status: string;
      startDate: Date;
      endDate: Date;
    };
  };
  'premium.subscription-canceled': {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    subscription: {
      id: string;
      status: string;
      endDate: Date;
    };
  };
  'premium.subscription-expired': {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    subscription: {
      id: string;
      status: string;
      endDate: Date;
    };
  };
  'premium.subscription-renewed': {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    subscription: {
      id: string;
      status: string;
      startDate: Date;
      endDate: Date;
    };
  };
}
