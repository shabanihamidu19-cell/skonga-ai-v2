import type { Entitlement, PlanId } from "@skonga/shared";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) {
    throw new ApiError("API URL is not configured (EXPO_PUBLIC_API_URL).");
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

export async function sendChat(payload: {
  threadId: string;
  message: string;
  style: string;
}): Promise<{ reply: string }> {
  return request("/v1/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function initiateStk(payload: {
  planId: PlanId;
  phone: string;
}): Promise<{ reference: string; status: string }> {
  return request("/v1/pay/stk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEntitlement(phone?: string): Promise<Entitlement> {
  const q = phone ? `?phone=${encodeURIComponent(phone.replace(/\D/g, ""))}` : "";
  return request(`/v1/entitlement${q}`);
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const res = await request<{ token: string }>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(res.token);
  return res;
}

export function isApiConfigured(): boolean {
  return Boolean(BASE);
}
