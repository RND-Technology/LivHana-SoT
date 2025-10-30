/**
 * LIGHTSPEED OAUTH2 CLIENT - TIER-1 FUSION ARCHITECTURE
 * Auto-refreshing OAuth2 implementation for Lightspeed Retail API
 * Eliminates manual token regeneration and 401 errors
 */

import axios, { AxiosInstance } from 'axios';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface TokenStore {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number;
}

export class LightspeedOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private redirectUri: string;
  private gcpProject: string;
  private tokenStore: TokenStore;
  private refreshPromise: Promise<void> | null = null;
  private secretClient: SecretManagerServiceClient;

  constructor(
    clientId: string,
    clientSecret: string,
    accountId: string,
    redirectUri: string,
    gcpProject: string
  ) {
    if (!gcpProject) {
      throw new Error('GCP_PROJECT_ID is required - cannot initialize OAuth client');
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accountId = accountId;
    this.redirectUri = redirectUri;
    this.gcpProject = gcpProject;
    this.secretClient = new SecretManagerServiceClient();
    this.tokenStore = {
      accessToken: null,
      refreshToken: null,
      expiresAt: 0,
    };
  }

  /**
   * Get account ID for API calls
   */
  getAccountId(): string {
    return this.accountId;
  }

  /**
   * Initialize client by loading existing tokens from GCP Secret Manager
   */
  async initialize(): Promise<boolean> {
    try {
      const accessToken = await this.loadSecret('LIGHTSPEED_ACCESS_TOKEN');
      const refreshToken = await this.loadSecret('LIGHTSPEED_REFRESH_TOKEN');
      const expiresAt = await this.loadSecret('LIGHTSPEED_TOKEN_EXPIRES_AT');

      if (accessToken && refreshToken) {
        this.tokenStore.accessToken = accessToken;
        this.tokenStore.refreshToken = refreshToken;
        this.tokenStore.expiresAt = expiresAt ? parseInt(expiresAt) : 0;

        console.log('[OAuth] Loaded existing tokens from Secret Manager');

        // Check if token is expired and refresh if needed
        if (Date.now() >= this.tokenStore.expiresAt - 60000) {
          console.log('[OAuth] Token expired, refreshing...');
          await this.refreshAccessToken();
        }

        return true;
      }

      console.log('[OAuth] No existing tokens found - OAuth flow required');
      return false;
    } catch (error) {
      console.error('[OAuth] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Generate authorization URL for initial OAuth flow
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'employee:all system:all account:all sale:all inventory:all',
    });
    return `https://cloud.lightspeedapp.com/oauth/authorize?${params}`;
  }

  /**
   * Exchange authorization code for access token (initial OAuth flow)
   */
  async exchangeCode(code: string): Promise<void> {
    try {
      const response = await axios.post<TokenResponse>(
        'https://cloud.lightspeedapp.com/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }
      );

      await this.updateTokenStore(response.data);
      console.log('[OAuth] Successfully exchanged authorization code');
    } catch (error: any) {
      console.error('[OAuth] Failed to exchange code:', error.response?.data || error.message);
      throw new Error('OAuth code exchange failed');
    }
  }

  /**
   * Refresh expired access token using refresh token
   */
  async refreshAccessToken(): Promise<void> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._refreshAccessToken();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _refreshAccessToken(): Promise<void> {
    if (!this.tokenStore.refreshToken) {
      throw new Error('No refresh token available - OAuth flow required');
    }

    try {
      const response = await axios.post<TokenResponse>(
        'https://cloud.lightspeedapp.com/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.tokenStore.refreshToken,
          grant_type: 'refresh_token',
        }
      );

      await this.updateTokenStore(response.data);
      console.log('[OAuth] Successfully refreshed access token');
    } catch (error: any) {
      console.error('[OAuth] Failed to refresh token:', error.response?.data || error.message);
      throw new Error('OAuth token refresh failed - re-authentication required');
    }
  }

  /**
   * Get valid access token (auto-refresh if expired)
   */
  async getValidAccessToken(): Promise<string> {
    // Refresh token 1 minute before expiry
    if (Date.now() >= this.tokenStore.expiresAt - 60000) {
      console.log('[OAuth] Token expiring soon, refreshing...');
      await this.refreshAccessToken();
    }

    if (!this.tokenStore.accessToken) {
      throw new Error('No access token available - OAuth flow required');
    }

    return this.tokenStore.accessToken;
  }

  /**
   * Check if OAuth client is ready (has valid tokens)
   */
  isReady(): boolean {
    return (
      this.tokenStore.accessToken !== null &&
      this.tokenStore.refreshToken !== null &&
      Date.now() < this.tokenStore.expiresAt
    );
  }

  /**
   * Get token status for health checks
   */
  getStatus(): {
    hasTokens: boolean;
    expiresAt: number;
    expiresIn: number;
    isExpired: boolean;
  } {
    const now = Date.now();
    return {
      hasTokens: this.tokenStore.accessToken !== null && this.tokenStore.refreshToken !== null,
      expiresAt: this.tokenStore.expiresAt,
      expiresIn: Math.max(0, this.tokenStore.expiresAt - now),
      isExpired: now >= this.tokenStore.expiresAt,
    };
  }

  /**
   * Update token store and persist to Secret Manager
   */
  private async updateTokenStore(tokenResponse: TokenResponse): Promise<void> {
    this.tokenStore.accessToken = tokenResponse.access_token;
    this.tokenStore.refreshToken = tokenResponse.refresh_token;
    this.tokenStore.expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    // Persist to GCP Secret Manager
    await Promise.all([
      this.storeSecret('LIGHTSPEED_ACCESS_TOKEN', tokenResponse.access_token),
      this.storeSecret('LIGHTSPEED_REFRESH_TOKEN', tokenResponse.refresh_token),
      this.storeSecret('LIGHTSPEED_TOKEN_EXPIRES_AT', this.tokenStore.expiresAt.toString()),
    ]);

    console.log(`[OAuth] Tokens stored, expires at: ${new Date(this.tokenStore.expiresAt).toISOString()}`);
  }

  /**
   * Store secret in GCP Secret Manager (using SDK - secure, no shell injection risk)
   */
  private async storeSecret(secretName: string, value: string): Promise<void> {
    try {
      const parent = `projects/${this.gcpProject}`;
      const secretPath = `${parent}/secrets/${secretName}`;

      // Try to add new version (assumes secret exists)
      try {
        await this.secretClient.addSecretVersion({
          parent: secretPath,
          payload: {
            data: Buffer.from(value, 'utf8'),
          },
        });
        console.log(`[OAuth] Updated secret ${secretName}`);
      } catch (error: any) {
        // If secret doesn't exist (NOT_FOUND), create it
        if (error.code === 5) {
          await this.secretClient.createSecret({
            parent,
            secretId: secretName,
            secret: {
              replication: {
                automatic: {},
              },
            },
          });
          // Add the initial version
          await this.secretClient.addSecretVersion({
            parent: secretPath,
            payload: {
              data: Buffer.from(value, 'utf8'),
            },
          });
          console.log(`[OAuth] Created secret ${secretName}`);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`[OAuth] Failed to store secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Load secret from GCP Secret Manager (using SDK - secure, no shell injection risk)
   */
  private async loadSecret(secretName: string): Promise<string | null> {
    try {
      const secretPath = `projects/${this.gcpProject}/secrets/${secretName}/versions/latest`;
      const [version] = await this.secretClient.accessSecretVersion({
        name: secretPath,
      });

      const payload = version.payload?.data;
      if (!payload) {
        return null;
      }

      return payload.toString('utf8');
    } catch (error: any) {
      // Code 5 = NOT_FOUND
      if (error.code === 5) {
        return null;
      }
      console.error(`[OAuth] Failed to load secret ${secretName}:`, error.message);
      return null;
    }
  }

  /**
   * Create axios instance with OAuth interceptor
   */
  createAuthenticatedClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor: inject fresh token
    client.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.getValidAccessToken();
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        } catch (error) {
          console.error('[OAuth] Failed to get valid token for request:', error);
          throw error;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: handle 401 and retry with refresh
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet, refresh and retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log('[OAuth] Got 401, attempting token refresh...');
            await this.refreshAccessToken();
            const token = await this.getValidAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          } catch (refreshError) {
            console.error('[OAuth] Token refresh failed on 401:', refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return client;
  }
}
