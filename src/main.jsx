import React from "react";
import { createRoot } from "react-dom/client";

/* Точка входа. Раньше эту роль играли четыре тега в index.html
   (React UMD + ReactDOM UMD + @babel/standalone + инлайновый App); теперь
   всё собирает Vite, а Babel-в-браузере больше нет.

   Порядок критичен: _ds_bundle.js — precompiled-артефакт дизайн-системы,
   который зовёт ГЛОБАЛЬНЫЙ React.createElement и вешает компоненты на
   window.RatedTattooDesignSystem_04b525. Поэтому window.React выставляем
   ДО его загрузки, а sections.jsx (он на этапе инициализации читает этот
   window-неймспейс) подтягиваем ещё позже — через app.jsx. Цепочка
   динамических импортов гарантирует этот порядок независимо от бандлера. */
window.React = React;

import("../_ds_bundle.js")
  .then(() => import("./app.jsx"))
  .then(({ App }) => {
    createRoot(document.getElementById("root")).render(<App />);
  });
