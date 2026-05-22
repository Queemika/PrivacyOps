// Lightweight todo store. Auto-populated from transcripts/emails when
// the system detects action items assigned to the current user.
export interface Todo {
  id: string;
  text: string;
  source: "Transcript" | "Email" | "Manual" | "PIA";
  sourceRef?: string;
  owner?: string;
  done: boolean;
  createdAt: string;
}

const KEY = "pa_todos";

export function loadTodos(): Todo[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveTodos(list: Todo[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}
export function addTodos(items: Omit<Todo, "id" | "createdAt" | "done">[]) {
  const all = loadTodos();
  const now = new Date().toISOString();
  const created = items.map((i, idx) => ({
    ...i,
    id: `TODO-${Date.now()}-${idx}`,
    done: false,
    createdAt: now,
  }));
  saveTodos([...created, ...all]);
  return created;
}
export function toggleTodo(id: string) {
  const all = loadTodos();
  const i = all.findIndex(t => t.id === id);
  if (i >= 0) { all[i].done = !all[i].done; saveTodos(all); }
}
export function removeTodo(id: string) {
  saveTodos(loadTodos().filter(t => t.id !== id));
}
