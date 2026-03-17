import { EmployeesService } from 'src/employees/employees.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import axios from 'axios';

@Injectable()
export class DataAnalysisTokenServiceService {
  dtaApiUrl: string;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly config: ConfigService,
    private readonly employeeService: EmployeesService,
  ) {
    this.dtaApiUrl = this.config.getOrThrow<string>('DTA_API_URL');
  }

  async getToken(email: string): Promise<string> {
    const employee = await this.employeeService.findByEmail(email);

    const cached = await this.cache.get<string>(`token:${email}`);
    if (cached) return cached;

    const password = employee.password;

    const queryParams = new URLSearchParams({ email, password }).toString();
    const url = `${this.dtaApiUrl}/authenticate?${queryParams}`;

    try {
      const response = await axios.get(url);
      console.log('DTA API response for', email, ':', response.data);

      const token =
        typeof response.data === 'string'
          ? response.data
          : (response.data?.token as string | undefined);

      if (!token) {
        throw new InternalServerErrorException(
          'Token not found in DTA API response',
        );
      }

      await this.cache.set(`token:${email}`, token, 1000 * 60 * 20); // 20 min in ms
      return token;
    } catch (error) {
      console.error('Error authenticating with DTA API:', error);
      throw new ServiceUnavailableException(
        'Data analysis service temporarily unavailable',
      );
    }
  }
}
