import { Injectable } from '@angular/core';

interface AppConfig {
  apiUrl: string;
  environment: string;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = window.APP_CONFIG || {
      apiUrl: 'http://localhost:3000',
      environment: 'development',
    };
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get environment(): string {
    return this.config.environment;
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }
}
