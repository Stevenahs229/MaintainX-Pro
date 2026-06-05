const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = token;

  const res = await fetch(`${BASE}${path}`, {
    headers: { ...headers, ...options?.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  equipment: {
    list: () => request<any[]>('/equipment'),
    get: (id: string) => request<any>(`/equipment/${id}`),
    create: (data: any) => request<any>('/equipment', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/equipment/${id}`, { method: 'DELETE' }),
    faults: (id: string) => request<any[]>(`/equipment/${id}/faults`),
  },
  faults: {
    list: () => request<any[]>('/faults'),
    get: (id: string) => request<any>(`/faults/${id}`),
    create: (data: any) => request<any>('/faults', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string, user_id?: string) =>
      request<any>(`/faults/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, user_id }) }),
    addComment: (id: string, data: any) => request<any>(`/faults/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  },
  spareParts: {
    list: () => request<any[]>('/spare-parts'),
    get: (id: string) => request<any>(`/spare-parts/${id}`),
    create: (data: any) => request<any>('/spare-parts', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/spare-parts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  notifications: {
    list: () => request<{ activities: any[]; unread: number }>('/notifications'),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<any>('/notifications/mark-all-read', { method: 'POST' }),
  },
  dashboard: {
    get: () => request<any>('/dashboard'),
  },
  users: {
    list: () => request<any[]>('/users'),
    get: (id: string) => request<any>(`/users/${id}`),
  },
};
