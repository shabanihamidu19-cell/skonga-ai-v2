import { Router } from "express";
import { PRO_PLANS, detectNetwork, type Entitlement, type PlanId } from "@skonga/shared";
import { db, newRef, type PaymentRecord } from "./store.js";
import { generateReply, normalizeStyle } from "./tutor.js";

const PLAN_IDS: PlanId[] = ["day", "week", "month", "year"];

function grantPro(phone: string, planId: PlanId): Entitlement {
  const plan = PRO_PLANS.find((p) => p.id === planId)!;
  const expires = new Date();
  expires.setDate(expires.getDate() + plan.days);
  const entitlement: Entitlement = {
    isPro: true,
    planId,
    expiresAt: expires.toISOString(),
  };
  db.entitlements.set(phone.replace(/\D/g, ""), entitlement);
  return entitlement;
}

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "skonga-api",
    mode: process.env.LLM_API_KEY ? "llm" : "fallback",
    pay: process.env.PAY_PROVIDER ?? "mock",
  });
});

router.post("/v1/chat", async (req, res) => {
  const message = String(req.body?.message ?? "").trim();
  const threadId = String(req.body?.threadId ?? "");
  const style = normalizeStyle(req.body?.style);
  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }
  const reply = await generateReply(message, style);
  res.json({ reply, threadId: threadId || null });
});

router.post("/v1/pay/stk", (req, res) => {
  const planId = req.body?.planId as PlanId;
  const phone = String(req.body?.phone ?? "").trim();
  if (!PLAN_IDS.includes(planId)) {
    res.status(400).json({ error: "invalid planId" });
    return;
  }
  if (phone.replace(/\D/g, "").length < 9) {
    res.status(400).json({ error: "phone is required" });
    return;
  }
  const plan = PRO_PLANS.find((p) => p.id === planId)!;
  const live = process.env.PAY_PROVIDER === "live";
  const record: PaymentRecord = {
    reference: newRef("stk"),
    planId,
    phone,
    status: live ? "pending" : "paid",
    createdAt: new Date().toISOString(),
  };
  db.payments.set(record.reference, record);
  if (!live) grantPro(phone, planId);
  res.json({
    reference: record.reference,
    status: record.status,
    amountTsh: plan.priceTsh,
    network: detectNetwork(phone),
    hint: live
      ? "Enter PIN on the phone. Do not type PIN in the app."
      : "Mock provider auto-confirmed. Set PAY_PROVIDER=live when a real aggregator is connected.",
  });
});

router.post("/v1/pay/callback", (req, res) => {
  const reference = String(req.body?.reference ?? "");
  const status = req.body?.status === "paid" ? "paid" : "failed";
  const payment = db.payments.get(reference);
  if (!payment) {
    res.status(404).json({ error: "unknown reference" });
    return;
  }
  payment.status = status;
  if (status === "paid") grantPro(payment.phone, payment.planId);
  res.json({ reference, status: payment.status });
});

router.get("/v1/entitlement", (req, res) => {
  const phone = String(req.query.phone ?? "").replace(/\D/g, "");
  const token = String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  let entitlement: Entitlement = { isPro: false, planId: null, expiresAt: null };
  if (phone && db.entitlements.has(phone)) entitlement = db.entitlements.get(phone)!;
  if (token && db.sessions.has(token)) {
    const email = db.sessions.get(token)!.email;
    if (db.entitlements.has(email)) entitlement = db.entitlements.get(email)!;
  }
  if (entitlement.expiresAt && new Date(entitlement.expiresAt).getTime() < Date.now()) {
    entitlement = { isPro: false, planId: null, expiresAt: null };
  }
  res.json(entitlement);
});

router.post("/v1/auth/login", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email.includes("@") || password.length < 6) {
    res.status(400).json({ error: "email and password (6+ chars) required" });
    return;
  }
  const token = newRef("tok");
  db.sessions.set(token, { token, email, createdAt: new Date().toISOString() });
  res.json({ token });
});
