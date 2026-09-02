import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppState } from "../context/AppState";
import { colors } from "../theme";

export function NotesScreen() {
  const { notes, addNote, updateNote, deleteNote } = useAppState();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setBody("");
    setEditingId(null);
  }

  function onSave() {
    if (!title.trim() && !body.trim()) {
      Alert.alert("Empty note", "Write a title or body first.");
      return;
    }
    if (editingId) updateNote(editingId, title, body);
    else addNote(title, body);
    resetForm();
  }

  function onEdit(id: string) {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    setEditingId(id);
    setTitle(n.title);
    setBody(n.body);
  }

  function onDelete(id: string) {
    Alert.alert("Delete note", "Remove this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(id);
          if (editingId === id) resetForm();
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <Text style={styles.h}>My Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={colors.muted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.body]}
        placeholder="Write a note for revision..."
        placeholderTextColor={colors.muted}
        value={body}
        onChangeText={setBody}
        multiline
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={onSave}>
          <Text style={styles.btnText}>{editingId ? "Update" : "Add note"}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={styles.ghost} onPress={resetForm}>
            <Text style={styles.ghostText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={{ marginTop: 16 }}>
        {notes.length === 0 && <Text style={styles.muted}>No notes yet. Tap Add note.</Text>}
        {notes.map((n) => (
          <View key={n.id} style={styles.card}>
            <TouchableOpacity onPress={() => onEdit(n.id)}>
              <Text style={styles.cardTitle}>{n.title}</Text>
              <Text style={styles.cardBody} numberOfLines={3}>
                {n.body || "(empty)"}
              </Text>
              <Text style={styles.muted}>{n.updatedAt.slice(0, 10)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(n.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  h: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  body: { minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  btn: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  btnText: { color: "white", fontWeight: "700" },
  ghost: { padding: 10 },
  ghostText: { color: colors.muted },
  muted: { color: colors.muted },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { color: colors.text, fontWeight: "700", marginBottom: 4 },
  cardBody: { color: colors.muted, marginBottom: 6 },
  delete: { color: colors.danger, marginTop: 8, fontWeight: "600" },
});
