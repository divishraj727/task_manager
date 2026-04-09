// ── API switcher ──────────────────────────────────────────────────────────────
// VITE_MOCK=true  → uses mockApi.js (localStorage, no backend needed)
// VITE_MOCK=false → uses api.js     (real Django backend)
//
// To switch: change VITE_MOCK in your .env or Netlify/Railway env vars.
// No other file needs to change.

import * as real from "./api.js";
import * as mock from "./mockApi.js";

const isMock = import.meta.env.VITE_MOCK === "true";
const source = isMock ? mock : real;

export const authApi     = source.authApi;
export const taskApi     = source.taskApi;
export const categoryApi = source.categoryApi;
