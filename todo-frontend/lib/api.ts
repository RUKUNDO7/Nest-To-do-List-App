import { getStoredToken, type AuthUser } from './auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const TODOS_URL = API_BASE_URL.endsWith("/todos") ? API_BASE_URL : `${API_BASE_URL}/todos`;
const AUTH_URL = API_BASE_URL.endsWith("/auth") ? API_BASE_URL : `${API_BASE_URL}/auth`;

async function request<T>(url: string, init?: RequestInit, auth = false): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface Todo {
  id: number;
  title: string;
  status: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>(`${AUTH_URL}/signup`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>(`${AUTH_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return request<AuthUser>(`${AUTH_URL}/me`, { method: 'GET' }, true);
}

export async function getTodos() {
  return request<Todo[]>(TODOS_URL, { method: 'GET' }, true);
}

export async function addTodo(title: string) {
  return request<Todo>(TODOS_URL, {
    method: 'POST',
    body: JSON.stringify({ title }),
  }, true);
}

interface UpdateTodoDto {
  title?: string;
  status?: boolean;
}

export async function updateTodo(id: number, updates: UpdateTodoDto) {
  return request<Todo>(`${TODOS_URL}/id/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, true);
}

export async function deleteTodo(id: number) {
  return request<Todo>(`${TODOS_URL}/id/${id}`, {
    method: 'DELETE',
  }, true);
}
