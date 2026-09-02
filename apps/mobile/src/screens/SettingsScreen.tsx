import { useMemo } from "react";
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppState } from "../context/AppState";
import { useTheme } from "../context/ThemeContext";

const TERMS = process.env.EXPO_PUBLIC_LEGAL_TERMS_URL ?? "https://github.com/shabanihamidu19-cell/skonga-ai-v1";
const PRIVACY = process.env.EXPO_PUBLIC_LEGAL_PRIVACY_URL ?? "https://github.com/shabanihamidu19-cell/skonga-ai-v1";

export function SettingsScreen() {
  const { settings, updateSettings, wipeHistory } = useAppState();
  const { colors, scheme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
        label: { color: colors.muted, marginTop: 16, marginBottom: 8 },
        input: {
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 12,
          color: colors.text,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
        chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
        chipOn: { borderColor: colors.accent, backgroundColor: colors.accent + "22" },
        chipText: { color: colors.text, textTransform: "capitalize" },
        hint: { color: colors.muted, marginTop: 6, fontSize: 12 },
        link: { color: colors.accentSoft, marginTop: 16 },
        danger: { marginTop: 28 },
        dangerText: { color: colors.danger, fontWeight: "700" },
      }),
    [colors]
  );

  return (
    <View style={styles.root}>
      <Text style={styles.label}>How should SKONGA call you?</Text>
      <TextInput
        style={styles.input}
        value={settings.preferredName}
        onChangeText={(preferredName) => updateSettings({ preferredName })}
        placeholder="Preferred name"
        placeholderTextColor={colors.muted}
      />
      <Text style={styles.label}>Theme</Text>
      <View style={styles.row}>
        {(["dark", "light", "auto"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, settings.theme === t && styles.chipOn]}
            onPress={() => updateSettings({ theme: t })}
          >
            <Text style={styles.chipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>Active: {scheme} (saved preference: {settings.theme})</Text>
      <Text style={styles.label}>Response style</Text>
      <View style={styles.row}>
        {(["balanced", "concise", "detailed"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, settings.responseStyle === s && styles.chipOn]}
            onPress={() => updateSettings({ responseStyle: s })}
          >
            <Text style={styles.chipText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => Linking.openURL(TERMS)}>
        <Text style={styles.link}>Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(PRIVACY)}>
        <Text style={styles.link}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.danger} onPress={wipeHistory}>
        <Text style={styles.dangerText}>Clear all history</Text>
      </TouchableOpacity>
    </View>
  );
}
