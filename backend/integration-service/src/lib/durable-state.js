// Simple in-memory state management for development
const state = new Map();

export default {
  get: (key) => state.get(key),
  set: (key, value) => state.set(key, value),
  delete: (key) => state.delete(key),
  has: (key) => state.has(key),
  clear: () => state.clear()
};
