import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GeocodingService {
  private readonly geoCodingUrl: string;
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.geoCodingUrl = this.config.getOrThrow<string>('GEOCODING_API_URL');
    this.http = axios.create({
      baseURL: this.geoCodingUrl,
      timeout: 10_000,
    });
  }

  async geocode(address: string) {
    const url = `${this.geoCodingUrl}/${encodeURIComponent(address)}.json`;

    const { data } = await this.http.get(url, {
      params: {
        access_token: process.env.MAPBOX_TOKEN,
        limit: 1,
      },
    });

    return data.features[0]?.center; // [lng, lat]
  }
}
