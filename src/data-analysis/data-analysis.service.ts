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
import { DataAnalysisTokenServiceService } from './external-api.token-service';

type QueryValue = string | number | boolean | undefined | null;

@Injectable()
export class DataAnalysisService {
  private readonly dtaApiUrl: string;
  private readonly http: AxiosInstance;

  constructor(
    private readonly tokenService: DataAnalysisTokenServiceService,
    private readonly config: ConfigService,
  ) {
    this.dtaApiUrl = this.config.getOrThrow<string>('DTA_API_URL');
    this.http = axios.create({
      baseURL: this.dtaApiUrl,
      timeout: 10_000,
    });
  }

  private async get<T>(
    email: string,
    path: string,
    query: Record<string, QueryValue>,
    errorMessage: string,
  ): Promise<T> {
    const token = await this.tokenService.getToken(email);

    console.log(
      `Making request to DTA API at path: ${path} with query: ${JSON.stringify(query)}`,
    );

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }
    params.append('token', token);

    try {
      const res = await this.http.get<T>(path, {
        params,
      });

      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        switch (err.response.status) {
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
    email: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      email,
      '/descriptive/orders-amount/',
      { last_days, month, year, showzeros, percentage },
      'Failed to fetch order amount',
    );
  }

  async get_products_mostly_bought(
    email: string,
    last_days = 0,
    month = false,
    year = false,
    limit = 5,
  ) {
    console.log('get_products_mostly_bought called with:', {
      email,
      last_days,
      month,
      year,
      limit,
    });
    const data = await this.get(
      email,
      '/descriptive/products-mostly-bought/',
      { last_days, month, year, limit },
      'Failed to fetch mostly bought products',
    );
    return data;
  }

  get_customers_growth(email: string) {
    return this.get(
      email,
      '/predictive/customers-growth/',
      {},
      'Failed to fetch customers growth',
    );
  }

  get_customers_growth_month(email: string) {
    return this.get(
      email,
      '/predictive/customers-growth/month/',
      {},
      'Failed to fetch customers growth month',
    );
  }

  get_orders_growth(email: string) {
    return this.get(
      email,
      '/predictive/orders-growth/',
      {},
      'Failed to fetch orders growth',
    );
  }

  get_orders_growth_month(email: string) {
    return this.get(
      email,
      '/predictive/orders-growth/month/',
      {},
      'Failed to fetch orders growth month',
    );
  }

  get_products_orders_correlation(email: string) {
    return this.get(
      email,
      '/diagnostic/products-orders-correlation/',
      {},
      'Failed to fetch products orders correlation',
    );
  }

  get_products_amount(
    email: string,
    well_stocked = false,
    out_of_stock = false,
    limit = 5,
  ) {
    return this.get(
      email,
      '/descriptive/products-amount/',
      { well_stocked, out_of_stock, limit },
      'Failed to fetch products amount',
    );
  }

  get_customers_signup(
    email: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      email,
      '/descriptive/customers-signup/',
      { last_days, month, year, showzeros, percentage },
      'Failed to fetch customers signup',
    );
  }

  get_invoices_amount(
    email: string,
    last_days = 0,
    month = false,
    year = false,
    showzeros = false,
    percentage = false,
  ) {
    return this.get(
      email,
      '/descriptive/invoices-amount/',
      { last_days, month, year, showzeros, percentage },
      'Failed to fetch invoices amount',
    );
  }
}
