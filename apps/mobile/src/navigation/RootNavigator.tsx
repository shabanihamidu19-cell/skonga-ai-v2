import { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ChatScreen } from "../screens/ChatScreen";
import { NotesScreen } from "../screens/NotesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PayScreen } from "../screens/PayScreen";
import { DrawerContent } from "./DrawerContent";
import { useTheme } from "../context/ThemeContext";
import type { DrawerParamList } from "./types";

const Drawer = createDrawerNavigator<DrawerParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        proBtn: { marginRight: 12 },
        proText: { color: colors.accentSoft, fontWeight: "800" },
      }),
    [colors]
  );

  return (
    <Drawer.Navigator
      drawerContent={(p) => <DrawerContent {...p} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        sceneContainerStyle: { backgroundColor: colors.bg },
        drawerStyle: { backgroundColor: colors.panel, width: 280 },
        headerRight: () => (
          <TouchableOpacity style={styles.proBtn} onPress={() => navigation.navigate("Pay")}>
            <Text style={styles.proText}>Pro</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="Chat" component={ChatScreen} options={{ title: "SKONGA AI" }} />
      <Drawer.Screen name="Notes" component={NotesScreen} options={{ title: "My Notes" }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Pay" component={PayScreen} options={{ title: "SKONGA Pro" }} />
    </Drawer.Navigator>
  );
}
