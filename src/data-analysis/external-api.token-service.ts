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
  // Map to store inflight token requests to prevent multiple requests for the same email
  private readonly inflightTokens = new Map<string, Promise<string>>();
  private readonly dtaApiUrl: string;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly config: ConfigService,
    private readonly employeeService: EmployeesService,
  ) {
    this.dtaApiUrl = this.config.getOrThrow<string>('DTA_API_URL');
  }

  async getToken(email: string): Promise<string> {
    const cacheKey = `token:${email}`;

    const cached = await this.cache.get<string>(cacheKey);
    if (cached) return cached;

    // query for exisitong promise to prevent multiple token requests for the same email
    const inflight = this.inflightTokens.get(email);
    // return existing promise if there is one, otherwise create a new one and store it in the map
    if (inflight) return inflight;

    const promise = this.fetchAndCacheToken(email, cacheKey);
    this.inflightTokens.set(email, promise);

    try {
      return await promise;
    } finally {
      this.inflightTokens.delete(email);
    }
  }

  private async fetchAndCacheToken(
    email: string,
    cacheKey: string,
  ): Promise<string> {
    const employee = await this.employeeService.findByEmail(email);
    const password = employee.password;

    try {
      const queryParams = new URLSearchParams({ email, password }).toString();
      const url = `${this.dtaApiUrl}/authenticate?${queryParams}`;
      console.log(`Requesting token from DTA API with URL: ${url}`);
      const response = await axios.get(url);
      console.log(
        `Received response from DTA API: ${JSON.stringify(response.data)}`,
      );
      const token =
        typeof response.data === 'string'
          ? response.data
          : (response.data?.token as string | undefined);

      if (!token) {
        console.log(
          `Token not found in DTA API response: ${JSON.stringify(response.data)}`,
        );
        throw new InternalServerErrorException(
          'Token not found in DTA API response',
        );
      }

      await this.cache.set(cacheKey, token, 1000 * 60 * 20);
      return token;
    } catch (error) {
      console.log(`Error occurred while fetching token from DTA API: ${error}`);
      throw new ServiceUnavailableException(
        'Data analysis service temporarily unavailable',
      );
    }
  }
}
