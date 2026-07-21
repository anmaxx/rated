import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Сайт живёт на кастомном домене в корне (ratedtattoo.ru) → base: '/'.
// Статика (styles.css, tokens/, assets/, CNAME, robots и т.д.) лежит в
// public/ и копируется в dist дословно, без трансформации.
//
// _ds_bundle.js — сгенерированный артефакт дизайн-системы. Он зовёт
// глобальный React.createElement и вешается на window, поэтому:
//   1) исключён из React-плагина (никакого Fast Refresh над чужим кодом);
//   2) подключается динамическим импортом в src/main.jsx уже ПОСЛЕ того,
//      как выставлен window.React.
export default defineConfig({
  base: "/",
  plugins: [react({ exclude: [/[\\/]_ds_bundle\.js$/] })],
});
