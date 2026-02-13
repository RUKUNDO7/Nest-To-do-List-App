const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const TODOS_URL = API_BASE_URL.endsWith("/todos") ? API_BASE_URL : `${API_BASE_URL}/todos`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

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

export async function getTodos() {
  return request<Todo[]>(TODOS_URL);
}

export async function addTodo(title: string) {
  return request<Todo>(TODOS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

interface UpdateTodoDto {
  title?: string;
  status?: boolean;
}

export async function updateTodo(id: number, updates: UpdateTodoDto) {
  return request<Todo>(`${TODOS_URL}/id/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteTodo(id: number) {
  return request<Todo>(`${TODOS_URL}/id/${id}`, {
    method: "DELETE",
  });
}
