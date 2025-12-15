import axios, { AxiosError } from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new ApiError(error.response?.status || 500, message));
  },
);

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API endpoints
export const api = {
  // Auth
  auth: {
    getMe: () => apiClient.get<{ user: UserResponse | null }>('/api/auth/me').then((r) => r.data),
    login: (data: LoginRequest) =>
      apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),
    register: (data: RegisterRequest) =>
      apiClient.post<RegisterResponse>('/api/auth/register', data).then((r) => r.data),
    logout: () =>
      apiClient
        .post<{ success: boolean; redirect: string }>('/api/auth/logout')
        .then((r) => r.data),
    sendMagicLink: (email: string) =>
      apiClient
        .post<{ success: boolean; message: string }>('/api/auth/magic-link', {
          email,
        })
        .then((r) => r.data),
  },

  // Business
  business: {
    get: () =>
      apiClient.get<{ business: BusinessResponse | null }>('/api/business').then((r) => r.data),
    create: (data: CreateBusinessRequest) =>
      apiClient.post<{ business: BusinessResponse }>('/api/business', data).then((r) => r.data),
    update: (data: UpdateBusinessRequest) =>
      apiClient.put<{ business: BusinessResponse }>('/api/business', data).then((r) => r.data),
  },

  // Dashboard
  dashboard: {
    getStats: () =>
      apiClient.get<DashboardStatsResponse>('/api/dashboard/stats').then((r) => r.data),
  },

  // Onboarding
  onboarding: {
    getState: () => apiClient.get<{ data: any }>('/api/onboarding/state').then((r) => r.data),
    saveState: (state: any) =>
      apiClient.post<{ success: boolean }>('/api/onboarding/state', { state }).then((r) => r.data),
  },
};

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  redirect: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: UserResponse | null;
  redirect: string;
  message: string;
}

// Response types
export interface UserResponse {
  id: string;
  email: string;
  fullName?: string;
  createdAt?: string;
}

export interface BusinessResponse {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  currency: string;
  target_margin: number;
  is_planning_mode: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStatsResponse {
  todaySales: number;
  todayOrders: number;
  healthScore: number | null;
}

// Request types
export interface CreateBusinessRequest {
  name: string;
  type: string;
  description?: string;
  location?: string;
  targetMargin?: number;
  isPlanningMode?: boolean;
}

export interface UpdateBusinessRequest {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  location?: string;
  target_margin?: number;
}

export { ApiError, apiClient };
