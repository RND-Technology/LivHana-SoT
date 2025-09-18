import React, { useState, useEffect } from "react";

// Type for a single todo item
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const STORAGE_KEY = "livhana-todos";

function getStoredTodos(): Todo[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  // Load todos from localStorage on mount
  useEffect(() => {
    setTodos(getStoredTodos());
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  function addTodo() {
    if (input.trim() === "") return;
    setTodos([
      ...todos,
      { id: Date.now(), text: input.trim(), completed: false },
    ]);
    setInput("");
  }

  function toggleTodo(id: number) {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  function removeTodo(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Liv Hana To-Do List</h2>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTodo} style={{ marginLeft: 8, padding: "8px 16px" }}>
          Add
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              textDecoration: todo.completed ? "line-through" : "none",
              opacity: todo.completed ? 0.6 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ marginRight: 8 }}
            />
            <span style={{ flex: 1 }}>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)} style={{ marginLeft: 8 }}>
              ❌
            </button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p>No tasks yet. Add something above!</p>}
    </div>
  );
}