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
}
