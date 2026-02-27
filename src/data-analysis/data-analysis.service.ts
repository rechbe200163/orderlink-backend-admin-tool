import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DataAnalysisService {
  dtaApiUrl: string;

  constructor(private readonly config: ConfigService) {
    this.dtaApiUrl = this.config.getOrThrow<string>('DTA_API_URL');
  }
  get_orders_amount(
    token: string,
    last_days: number = 0,
    month: boolean = false,
    year: boolean = false,
    show_zeros: boolean = false,
  ) {
    const queryParams = new URLSearchParams({
      last_days: last_days.toString(),
      month: month.toString(),
      year: year.toString(),
      showzeros: show_zeros.toString(),
      token,
    }).toString();
    const url = `${this.dtaApiUrl}/descriptive/orders-amount/?${queryParams}`;
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching order amount:', error);
        throw new Error('Failed to fetch order amount');
      });
  }

  get_products_mostly_bought(token: string, last_days: number = 0, month: boolean = false, year: boolean = false, limit: number = 5) {
    const queryParams = new URLSearchParams({
      last_days: last_days.toString(),
      month: month.toString(),
      year: year.toString(),
      limit: limit.toString(),
      token,
    }).toString();
    const url = `${this.dtaApiUrl}/descriptive/products-mostly-bought/?${queryParams}`;
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching mostly bought products:', error);
        throw new Error('Failed to fetch mostly bought products');
      });
  }

  get_customers_growth(
    token: string,
    one_day: boolean = false,
    seven_days: boolean = false,
    month: boolean = false,
    year: boolean = false
  ) {
    const queryParams = new URLSearchParams({
      one_day: one_day.toString(),
      seven_days: seven_days.toString(),
      month: month.toString(),
      year: year.toString(),
      token,
    }).toString();
    const url = `${this.dtaApiUrl}/predictive/customers-growth/?${queryParams}`;
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching customers growth:', error);
        throw new Error('Failed to fetch customers growth');
      });
  }

  get_orders_growth(
    token: string,
    one_day: boolean = false,
    seven_days: boolean = false,
    month: boolean = false,
    year: boolean = false
  ) {
    const queryParams = new URLSearchParams({
      one_day: one_day.toString(),
      seven_days: seven_days.toString(),
      month: month.toString(),
      year: year.toString(),
      token,
    }).toString();
    const url = `${this.dtaApiUrl}/predictive/orders-growth/?${queryParams}`;
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching orders growth:', error);
        throw new Error('Failed to fetch orders growth');
      });
  }


  get_products_orders_correlation(token: string) {
    const queryParams = new URLSearchParams({
      token,
    }).toString();
    const url = `${this.dtaApiUrl}/diagnostic/products-orders-correlation/?${queryParams}`;
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching products orders correlation:', error);
        throw new Error('Failed to fetch products orders correlation');
      });
  }

}
