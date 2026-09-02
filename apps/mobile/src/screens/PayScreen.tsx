import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { NETWORK_LABEL, PRO_PLANS, detectNetwork, formatTsh, type PlanId } from "@skonga/shared";
import { initiateStk, isApiConfigured } from "../api/client";
import { useAppState } from "../context/AppState";
import { colors } from "../theme";

export function PayScreen() {
  const { entitlement, unlockPro } = useAppState();
  const [planId, setPlanId] = useState<PlanId>("month");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const network = detectNetwork(phone);

  async function onPay() {
    if (phone.replace(/\D/g, "").length < 9) {
      Alert.alert("Phone required", "Enter a Tanzanian mobile-money number.");
      return;
    }
    setBusy(true);
    try {
      if (isApiConfigured()) {
        const res = await initiateStk({ planId, phone });
        Alert.alert("STK sent", `Reference ${res.reference}. Enter your PIN on the phone — never in the app.`);
      } else {
        Alert.alert(
          "Payment API not live",
          "STK is mocked until POST /v1/pay/stk is connected. Pro is unlocked on this device only."
        );
        unlockPro(planId);
      }
    } catch (e) {
      Alert.alert("Payment failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.h}>SKONGA Pro</Text>
      {entitlement.isPro && (
        <Text style={styles.ok}>
          Pro active{entitlement.expiresAt ? ` until ${entitlement.expiresAt.slice(0, 10)}` : ""}.
        </Text>
      )}
      <Text style={styles.muted}>Choose a plan. After confirmed payment, extra messages unlock.</Text>
      {PRO_PLANS.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.plan, planId === p.id && styles.planOn]} onPress={() => setPlanId(p.id)}>
          <Text style={styles.planTitle}>{p.label}</Text>
          <Text style={styles.muted}>
            {p.durationLabel} · {formatTsh(p.priceTsh)}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.label}>Phone for STK Push</Text>
      <TextInput style={styles.input} keyboardType="phone-pad" placeholder="07XXXXXXXX" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone} />
      <Text style={styles.muted}>{NETWORK_LABEL[network]}</Text>
      <Text style={styles.muted}>PIN inawekwa kwenye simu yako, si ndani ya app.</Text>
      <TouchableOpacity style={styles.btn} onPress={onPay} disabled={busy}>
        <Text style={styles.btnText}>{busy ? "Sending..." : "Continue"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  h: { color: colors.text, fontSize: 22, fontWeight: "700" },
  ok: { color: "#34d399", marginTop: 8 },
  muted: { color: colors.muted, marginTop: 6 },
  label: { color: colors.muted, marginTop: 20, marginBottom: 8 },
  plan: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginTop: 8 },
  planOn: { borderColor: colors.accent },
  planTitle: { color: colors.text, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  btnText: { color: "white", fontWeight: "700" },
});
