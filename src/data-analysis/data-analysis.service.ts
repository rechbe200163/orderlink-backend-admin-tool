import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;

        switch (status) {
          case 400:
            throw new BadRequestException(err.response.data);
          case 401:
            throw new UnauthorizedException();
          case 403:
            throw new ForbiddenException();
          case 404:
            throw new NotFoundException();
          case 500:
            throw new InternalServerErrorException();
        }
      }

      throw new InternalServerErrorException(errorMessage);
    }
  }

  get_orders_amount(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      '/descriptive/orders-amount/',
      { last_days, month, year, showzeros, percentage, token },
      'Failed to fetch order amount',
    );
  }

  async get_products_mostly_bought(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    limit = 5,
  ) {
    console.log('get_products_mostly_bought called with:', {
      token,
      last_days,
      month,
      year,
      limit,
    });
    const data = await this.get(
      '/descriptive/products-mostly-bought/',
      { last_days, month, year, limit, token },
      'Failed to fetch mostly bought products',
    );
    return data;
  }

  get_customers_growth(
    token: string,
  ) {
    return this.get(
      '/predictive/customers-growth/',
      { token },
      'Failed to fetch customers growth',
    );
  }

  get_customers_growth_month(token: string) {
    return this.get(
      '/predictive/customers-growth/month/',
      { token },
      'Failed to fetch customers growth month',
    );
  }

  get_orders_growth(
    token: string
  ) {
    return this.get(
      '/predictive/orders-growth/',
      { token },
      'Failed to fetch orders growth',
    );
  }

  get_orders_growth_month(token: string) {
    return this.get(
      '/predictive/orders-growth/month/',
      { token },
      'Failed to fetch orders growth month',
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

  get_customers_signup(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      '/descriptive/customers-signup/',
      { last_days, month, year, showzeros, percentage, token },
      'Failed to fetch customers signup',
    );
  }

  get_invoices_amount(
    token: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      '/descriptive/invoices-amount/',
      { last_days, month, year, showzeros, percentage, token },
      'Failed to fetch invoices amount',
    );
  }
}