import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAppState } from "../context/AppState";
import { colors } from "../theme";

export function DrawerContent(props: DrawerContentComponentProps) {
  const { threads, setActiveId, startNewChat, entitlement } = useAppState();
  const { navigation } = props;

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>SKONGA AI</Text>
      <TouchableOpacity
        style={styles.primary}
        onPress={() => {
          startNewChat();
          navigation.navigate("Chat");
        }}
      >
        <Text style={styles.primaryText}>New Chat</Text>
      </TouchableOpacity>
      <ScrollView style={styles.list}>
        {threads.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => {
              setActiveId(t.id);
              navigation.navigate("Chat");
            }}
          >
            <Text style={styles.item}>{t.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("Notes")}>
        <Text style={styles.item}>My Notes</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.item}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.item}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Pay")}>
        <Text style={styles.pro}>{entitlement.isPro ? "Pro" : "Go Pro"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel, paddingTop: 56, paddingHorizontal: 16 },
  brand: { color: colors.text, fontWeight: "800", letterSpacing: 1, marginBottom: 16 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: { color: "white", fontWeight: "700" },
  list: { flex: 1 },
  item: { color: colors.muted, paddingVertical: 12 },
  pro: { color: colors.accentSoft, fontWeight: "700", paddingVertical: 16 },
});
