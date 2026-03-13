const BASE = '/api';

function getToken() {
  return localStorage.getItem('lab_token');
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Check content-type before parsing JSON to avoid "Unexpected token '<'" errors
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra server đang chạy.');
    throw new Error(`Phản hồi không hợp lệ từ máy chủ (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {
      throw new Error(data.details.map((d: any) => d.message).join(', '));
    }
    throw new Error(data.error || 'Lỗi máy chủ');
  }
  return data;
}

const get = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body: any) => request<T>('POST', path, body);
const patch = <T>(path: string, body: any) => request<T>('PATCH', path, body);
const put = <T>(path: string, body: any) => request<T>('PUT', path, body);

export const api = {
  // Auth
  login: (email: string, password: string) =>
    post<{ token: string; user: any }>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; studentId?: string; phone?: string; supervisor?: string }) =>
    post<{ message: string }>('/auth/register', data),
  me: () => get<any>('/auth/me'),

  // Jobs
  getJobs: () => get<any[]>('/jobs'),
  getJob: (id: string) => get<any>(`/jobs/${id}`),
  getQueue: () => get<any[]>('/jobs/queue'),
  createJob: (data: any) => post<any>('/jobs', data),
  updateJob: (id: string, data: any) => patch<any>(`/jobs/${id}`, data),
  uploadFile: async (file: File): Promise<{ fileName: string; originalName: string }> => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/jobs/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra server đang chạy.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload thất bại');
    return data;
  },

  // Printers
  getPrinters: () => get<any[]>('/printers'),
  createPrinter: (data: any) => post<any>('/printers', data),
  updatePrinter: (id: string, data: any) => patch<any>(`/printers/${id}`, data),
  deletePrinter: (id: string) => request<any>('DELETE', `/printers/${id}`),
  uploadPrinterImage: async (file: File): Promise<{ url: string }> => {
    const token = getToken();
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/printers/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Không thể kết nối máy chủ.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload ảnh thất bại');
    return data;
  },

  // Inventory
  getInventory: () => get<any[]>('/inventory'),
  updateInventory: (id: string, data: any) => patch<any>(`/inventory/${id}`, data),
  addInventory: (data: any) => post<any>('/inventory', data),
  deleteInventory: (id: string) => request<any>('DELETE', `/inventory/${id}`),

  // Pricing
  getPricing: () => get<any[]>('/pricing'),
  updatePricing: (rules: any[]) => put<any>('/pricing', { rules }),

  // Service Fees
  getServiceFees: () => get<any[]>('/service-fees'),
  updateServiceFees: (fees: Array<{ name: string; amount: number }>) => put<any>('/service-fees', { fees }),

  // Messages
  getMessages: (jobId?: string) => get<any[]>(`/messages${jobId ? `?jobId=${jobId}` : ''}`),
  sendMessage: (content: string, jobId?: string) => post<any>('/messages', { content, jobId }),

  // Users (Admin)
  getUsers: () => get<any[]>('/users'),
  updateUser: (id: string, data: any) => patch<any>(`/users/${id}`, data),
  deleteUser: (id: string) => request<any>('DELETE', `/users/${id}`),

  // Logs
  getLogs: (limit?: number) => get<any[]>(`/logs${limit ? `?limit=${limit}` : ''}`),

  resubmitJob: (id: string) => patch<any>(`/jobs/${id}`, { status: 'Submitted' }),

  // Stats
  getStats: () => get<any>('/stats'),
  getDailyStats: () => get<any[]>('/stats/daily'),

  // Backup
  createBackup: () => post<any>('/backup', {}),
  listBackups: () => get<any[]>('/backups'),
  downloadBackup: (file: string) => `${BASE}/backups/${encodeURIComponent(file)}`,

  // Lab Settings
  getSettings: () => get<any>('/settings'),
  getSettingsAdmin: () => request<any>('GET', '/settings/admin'),
  updateSettings: (data: Record<string, string>) => put<any>('/settings', data),
};
