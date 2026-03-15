const BASE = "/api/admin";

function getToken(): string | null {
  return localStorage.getItem("nsr_admin_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem("nsr_admin_token");
}

export async function adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  localStorage.setItem("nsr_admin_token", data.token);
  return { success: true, token: data.token };
}

export async function fetchAdminData(type: string): Promise<unknown> {
  const res = await fetch(`${BASE}/data/${type}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  return res.json();
}

export async function saveAdminData(type: string, data: unknown): Promise<void> {
  const res = await fetch(`${BASE}/data/${type}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save ${type}`);
}

export async function fetchSiteContent(): Promise<unknown> {
  const res = await fetch(`${BASE}/site-content`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch site content");
  return res.json();
}

export async function saveSiteContent(data: unknown): Promise<void> {
  const res = await fetch(`${BASE}/site-content`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save site content");
}

export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.url as string;
}

export async function fetchLeads(): Promise<Record<string, string>[]> {
  const res = await fetch(`${BASE}/leads`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function clearLeads(): Promise<void> {
  const res = await fetch(`${BASE}/leads`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to clear leads");
}
