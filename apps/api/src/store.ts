import type { Entitlement, PlanId } from "@skonga/shared";

export type PaymentRecord = {
  reference: string;
  planId: PlanId;
  phone: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
};

export type Session = {
  token: string;
  email: string;
  createdAt: string;
};

const payments = new Map<string, PaymentRecord>();
const sessions = new Map<string, Session>();
const entitlements = new Map<string, Entitlement>();

export function newRef(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const db = {
  payments,
  sessions,
  entitlements,
};
