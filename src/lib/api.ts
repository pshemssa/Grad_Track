import { Graduate } from './types';

const PAGE_SIZE = 10;
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api';
const ADMIN_TOKEN_KEY = 'gradtrack_admin_token';

export interface PaginatedResponse {
  data: Graduate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GraduateFilters {
  page?: number;
  search?: string;
  status?: string;
  program?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }

  return payload as T;
}

export const adminAuth = {
  getToken: getAdminToken,
  clear: clearAdminToken,
  login: async (email: string, password: string): Promise<AdminUser> => {
    const payload = await request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAdminToken(payload.token);
    return payload.user;
  },
  me: async (): Promise<AdminUser> => {
    if (!getAdminToken()) throw new Error('Authentication required.');
    const payload = await request<{ user: AdminUser }>('/auth/me');

    return payload.user;
  },
};

export const api = {
  getGraduates: async (filters: GraduateFilters = {}): Promise<PaginatedResponse> => {
    const params = new URLSearchParams();
    params.set('page', String(Math.max(1, filters.page || 1)));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.program) params.set('program', filters.program);

    return request<PaginatedResponse>(`/graduates?${params.toString()}`);
  },

  getAllGraduates: async (): Promise<Graduate[]> => {
    const payload = await request<{ data: Graduate[] }>('/graduates/all');
    return payload.data || [];
  },

  getDashboardGraduates: async (): Promise<Graduate[]> => {
    if (!getAdminToken()) throw new Error('Authentication required.');
    const payload = await request<{ data: Graduate[] }>('/dashboard');

    return payload.data || [];
  },

  createGraduate: async (payload: Omit<Graduate, 'id' | 'graduate_id' | 'created_at'>): Promise<Graduate> => {
    const response = await request<{ data: Graduate }>('/graduates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  updateGraduate: async (id: string, payload: Partial<Graduate>): Promise<Graduate> => {
    const response = await request<{ data: Graduate }>(`/graduates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  deleteGraduate: async (id: string): Promise<void> => {
    await request<void>(`/graduates/${id}`, {
      method: 'DELETE',
    });
  },
};

export { PAGE_SIZE };
