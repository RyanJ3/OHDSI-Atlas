import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AppConfig, defaultConfig } from './app.config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private configSubject = new BehaviorSubject<AppConfig>(defaultConfig);
  private initialized = false;

  config$ = this.configSubject.asObservable();

  get config(): AppConfig {
    return this.configSubject.value;
  }

  get webApiUrl(): string {
    return this.config.api.url;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Try to load config from config-local.json
      const config = await firstValueFrom(
        this.http.get<Partial<AppConfig>>('/config-local.json')
      );
      this.configSubject.next({ ...defaultConfig, ...config });
    } catch {
      // Use default config if no config file found
      console.warn('No config-local.json found, using default configuration');

      // Try to auto-detect WebAPI URL
      const detectedUrl = this.detectWebApiUrl();
      this.configSubject.next({
        ...defaultConfig,
        api: { ...defaultConfig.api, url: detectedUrl },
      });
    }

    this.initialized = true;
  }

  private detectWebApiUrl(): string {
    // If running on same host as WebAPI, use relative URL
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;

    // Default: assume WebAPI is at /WebAPI/ on same host
    if (port === '4200') {
      // Development mode - proxy to local WebAPI
      return 'http://localhost:8080/WebAPI/';
    }

    return `${protocol}//${host}${port ? ':' + port : ''}/WebAPI/`;
  }

  updateConfig(partialConfig: Partial<AppConfig>): void {
    this.configSubject.next({ ...this.config, ...partialConfig });
  }
}
