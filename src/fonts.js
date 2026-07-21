/* Self-hosted шрифты и иконки — заменяют внешние CDN (fonts.googleapis.com и
   cdnjs FontAwesome). Для РФ-аудитории надёжнее, плюс всё уезжает в dist и
   версионируется через npm.

   Семейства регистрируются как "Oswald" и "Manrope" — ровно те имена, что
   используют токены --font-display / --font-body. Facon (логотип) остаётся
   @font-face в public/tokens/fonts.css. Веса — те же, что запрашивал прежний
   Google Fonts @import (Oswald 300–700, Manrope 400–800). */
import "@fontsource/oswald/300.css";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

/* FontAwesome 6.7.2 — та же версия, что была на CDN. Только core + solid +
   brands: используются лишь классы fas (19 иконок) и fab (fa-yandex, fa-vk),
   far в проекте нет, поэтому fa-regular не тянем. */
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";
