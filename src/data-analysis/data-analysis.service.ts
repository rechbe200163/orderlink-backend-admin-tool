import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

type QueryValue = string | number | boolean | undefined | null;

@Injectable()
export class DataAnalysisService {
  private readonly dtaApiUrl: string;
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.dtaApiUrl = this.config.getOrThrow<string>('DTA_API_URL');
    this.http = axios.create({
      baseURL: this.dtaApiUrl,
      timeout: 10_000,
    });
  }

  private async get<T>(
    path: string,
    query: Record<string, QueryValue>,
    errorMessage: string,
  ): Promise<T> {
    // undefined/null rausfiltern + alles als string
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }

    try {
      const res = await this.http.get<T>(path, { params });
      return res.data;
    } catch (err) {
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  }

  get_orders_amount(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    show_zeros = false,
  ) {
    return this.get(
      '/descriptive/orders-amount/',
      { last_days, month, year, showzeros: show_zeros, token },
      'Failed to fetch order amount',
    );
  }

  get_products_mostly_bought(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    limit = 5,
  ) {
    return this.get(
      '/descriptive/products-mostly-bought/',
      { last_days, month, year, limit, token },
      'Failed to fetch mostly bought products',
    );
  }

  get_customers_growth(
    token: string,
    one_day = false,
    seven_days = false,
    month = false,
    year = false,
  ) {
    return this.get(
      '/predictive/customers-growth/',
      { one_day, seven_days, month, year, token },
      'Failed to fetch customers growth',
    );
  }

  get_orders_growth(
    token: string,
    one_day = false,
    seven_days = false,
    month = false,
    year = false,
  ) {
    return this.get(
      '/predictive/orders-growth/',
      { one_day, seven_days, month, year, token },
      'Failed to fetch orders growth',
    );
  }

  get_products_orders_correlation(token: string) {
    return this.get(
      '/diagnostic/products-orders-correlation/',
      { token },
      'Failed to fetch products orders correlation',
    );
  }

  get_products_amount(
    token: string,
    well_stocked = false,
    out_of_stock = false,
    limit = 5,
  ) {
    return this.get(
      '/descriptive/products-amount/',
      { well_stocked, out_of_stock, limit, token },
      'Failed to fetch products amount',
    );
  }
}
