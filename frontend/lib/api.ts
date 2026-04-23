'use client';

import {
  User,
  Field,
  FieldUpdate,
  TokenPair,
  ApiError,
  RegisterPayload,
  CreateFieldPayload,
  CreateFieldUpdatePayload,
} from '@/types';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private subscribeToRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return null;
      }

      const data = (await response.json()) as TokenPair;
      const { access } = data;
      setTokens(access, refreshToken);
      return access;
    } catch {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const accessToken = getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (newToken) {
          this.notifyRefreshSubscribers(newToken);
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          this.subscribeToRefresh((token: string) => {
            const newHeaders = { ...headers, Authorization: `Bearer ${token}` };
            fetch(url, { ...options, headers: newHeaders })
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
              })
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    if (!response.ok) {
      const error: ApiError = {};
      try {
        Object.assign(error, await response.json());
      } catch {
        error.detail = `HTTP error! status: ${response.status}`;
      }
      throw error;
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<TokenPair> {
    return this.request<TokenPair>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me/');
  }

  async register(data: RegisterPayload): Promise<User> {
    return this.request<User>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User endpoints
  async listUsers(): Promise<User[]> {
    return this.request<User[]>('/api/auth/users/');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/api/auth/users/${id}/`);
  }

  async updateUser(id: number, data: Partial<RegisterPayload>): Promise<User> {
    return this.request<User>(`/api/auth/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.request<void>(`/api/auth/users/${id}/`, {
      method: 'DELETE',
    });
  }

  // Field endpoints
  async listFields(): Promise<Field[]> {
    return this.request<Field[]>('/api/fields/');
  }

  async getField(id: number): Promise<Field> {
    return this.request<Field>(`/api/fields/${id}/`);
  }

  async createField(data: CreateFieldPayload): Promise<Field> {
    return this.request<Field>('/api/fields/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateField(
    id: number,
    data: Partial<CreateFieldPayload>
  ): Promise<Field> {
    return this.request<Field>(`/api/fields/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteField(id: number): Promise<void> {
    await this.request<void>(`/api/fields/${id}/`, {
      method: 'DELETE',
    });
  }

  // Field Update endpoints
  async listFieldUpdates(fieldId: number): Promise<FieldUpdate[]> {
    return this.request<FieldUpdate[]>(`/api/fields/${fieldId}/updates/`);
  }

  async createFieldUpdate(
    fieldId: number,
    data: CreateFieldUpdatePayload
  ): Promise<FieldUpdate> {
    return this.request<FieldUpdate>(`/api/fields/${fieldId}/updates/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listRecentUpdates(): Promise<FieldUpdate[]> {
    return this.request<FieldUpdate[]>('/api/fields/recent-updates/');
  }
}

export const apiClient = new ApiClient();
