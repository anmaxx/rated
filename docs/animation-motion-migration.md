# Тех-дизайн: перевод анимаций на Motion for React

**Проект:** Rated Tattoo (ratedtattoo.ru) · **Дата:** 2026-07-22 · **Объём:** Вариант C
**Библиотека:** [Motion for React](https://motion.dev/docs/react) — пакет `motion`, импорт `motion/react` (ранее Framer Motion). Уже в зависимостях (`motion@12.42.2`).

> Статус: **дизайн, не имплементация.** Реализуется фазами через `/sc:implement` (ветка → сборка → сверка в браузере через chrome-devtools → PR → мерж = выкат на прод).
>
> **Ревизия после ревью (3 агента, 2026-07-22):** учтены Hero-исключение, полный инвентарь ховеров, откат Фазы 3, протоколы замера приёмки, гард-рейлы Фазы 3 (`tick`/RM/`sweep`), переформулирован §5.6. Решения владельца: REC/эквалайзер остаются на CSS (§4.2); модалки — анимируем (§4.5).

---

## 1. Цель и объём

Перевести анимации сайта на Motion for React. Владелец выбрал **Вариант C** — «тащить всё», с явными исключениями:

**В объёме:**
1. Входные раскрытия секций (`rt-reveal`) — с carve-out для Hero.
2. Ховеры (полный список — §4.3).
3. Фейд ролика в «03».
4. **Модалки** `WorkLightbox` и `BookingModal` — добавляем вход/выход (`AnimatePresence`). **Это новая анимация**, которой сейчас нет.
5. **Лента работ:** автоскролл + слот-машина + инерция/твины (самый рисковый блок).
6. Единая стратегия `prefers-reduced-motion` через свой `usePrefersReducedMotion` (§3.2).

**Исключения (остаются НЕ на Motion) — осознанно:**
- **Vaul** (видео-лист) — родная анимация листа (решение владельца).
- **REC-точка и эквалайзер «03»** — остаются на CSS (решение владельца, §4.2): бесконечные композиторные лупы, JS-драйвер держал бы main-thread постоянно.
- **Драг/wheel ленты** — единственное техническое сужение «всё на Motion»: у Motion есть `drag`+инерция, но бесшовный modulo-цикл + разотличение клик/драг им без регресса не воспроизвести. Обратимо; подаётся как явный выбор, а не «ввод ≠ анимация».
- scroll-snap / smooth-scroll (браузерный скролл), film-grain (статичный оверлей), `:focus-visible` (доступность), IntersectionObserver-логика (lazy-load плеера «03», активная секция DotNav).

---

## 2. Инвентаризация (сверено с кодом)

| # | Анимация | Механизм сейчас | Место | Судьба |
|---|---|---|---|---|
| 1 | Входные раскрытия `.rt-reveal`→`.rt-in` | IO в `App()` + CSS opacity/translateY | `src/app.jsx:25`, `index.html`, 11 элементов в `sections.jsx` | → Motion (§4.1) |
| — | **Hero** предразвёрнут | `className="rt-reveal rt-in"` (виден сразу, БЕЗ въезда) | `sections.jsx:206` | carve-out (§4.1) |
| 2 | REC-точка (пульс) | CSS `@keyframes rt-pulse` | `index.html:97,99` | **CSS (исключение)** |
| 3 | Эквалайзер «03» | CSS `@keyframes rt-eq` + delays | `index.html:98,100–103` | **CSS (исключение)** |
| 4 | Ховеры (полный список §4.3) | CSS `:hover` + React-state/inline | `index.html`, `sections.jsx` | → Motion, часть на CSS (§4.3) |
| 5 | Фейд ролика «03» | inline `transition: opacity .26s` | `sections.jsx:946` | → Motion (§4.4) |
| 6 | Модалки `WorkLightbox`/`BookingModal` | **нет** (`if(!open) return null`) | `sections.jsx:376,1324` | **+ AnimatePresence (§4.5)** |
| 7 | Лента: автоскролл 34 px/s | кастомный rAF-цикл | `sections.jsx:469–566` | → `useAnimationFrame` (§5) |
| 8 | Лента: слот-машина up/swap/down | тот же цикл, `SPIN_*` | `sections.jsx:521–537,633–644` | → §5 (физика без изменений) |
| 9 | Лента: инерция/твин/wheel/drag | тот же цикл + pointer/wheel | `sections.jsx:538–609,692` | цикл→Motion; drag/wheel — CSS/native |
| — | Кнопка «Смотреть вживую» | **уже Motion** (`motion.button`) | `sections.jsx:398` | — |

**Точные параметры (сверены):**
- Reveal: `opacity 0→1`, `translateY(46px→0)`, `1s`, `--ease-out = cubic-bezier(0.22,1,0.36,1)`, порог `0.15`, `once`.
- Автоскролл: `34 px/s`. Слот-машина: `SPIN_UP=0.24s`, `SPIN_DOWN=1.1s`, `SPIN_VMAX=5000 px/s`, `SPIN_DIST=SPIN_VMAX·SPIN_DOWN/3`.
- REC: `opacity 1→0.3→1`, `1.6s ease-in-out`. Эквалайзер: `scaleY 0.4→1→0.4`, `0.9s ease-in-out`, delays `.2s`/`.4s`.
- Фейд «03»: `opacity .26s ease`. Модалки: сейчас без анимации.

---

## 3. Принципы

1. **Существующее — сохраняем 1:1** (числа переносим дословно, замеряем). **Модалки — исключение:** это осознанное ДОБАВЛЕНИЕ анимации; их критерий — «мягкий вход/выход + reduced-motion = мгновенно, как сейчас».
2. **Reduced-motion:** анимационный RM — в React (свой `usePrefersReducedMotion`, см. ниже); scroll-snap-RM остаётся в CSS. Не «единый React-слой».
   ⚠️ **Не `useReducedMotion()` из `motion/react`.** В Motion 12.42.2 он читает значение ОДИН раз — `useState(prefersReducedMotion.current)` без сеттера, с `TODO` прямо в исходнике (`framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs:37`), хотя JSDoc над ним обещает «actively respond to changes». Прежний CSS-media-query реагировал на переключение мгновенно, поэтому 1:1 требует своей подписки (найдено авто-ревью на Merge-gate Фазы 1):
   ```jsx
   const RM_QUERY = "(prefers-reduced-motion: reduce)";
   let rmMedia = null;
   const rmList = () => (rmMedia ||= window.matchMedia(RM_QUERY));
   const subscribeRM = (cb) => { const m = rmList(); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
   function usePrefersReducedMotion() {
     return React.useSyncExternalStore(subscribeRM, () => rmList().matches, () => false);
   }
   ```
   Это же снимает риск для ленты (§5.4/§5.6), где живой RM — явное требование.
3. **Перф:** бесконечные композиторные лупы (REC/эквалайзер) остаются на CSS — JS-драйвер держал бы main-thread постоянно ради того же результата.
4. **Драг/wheel** — остаются нативными (техническое исключение, §1).

---

## 4. Детальный дизайн: не-ленточные блоки

### 4.1. Входные раскрытия (`rt-reveal`) → `whileInView`

Хук, отдающий пропсы для `motion.<tag>` (без обёртки — не меняем layout):

```jsx
const EASE_OUT = [0.22, 1, 0.36, 1];   // = var(--ease-out), тот же, что на motion.button
function useReveal({ y = 46 } = {}) {
  const reduced = usePrefersReducedMotion();       // своя живая подписка, НЕ useReducedMotion() — см. §3.2
  return {
    initial: reduced ? false : { opacity: 0, y },  // при RM старта нет → нет и въезда
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },        // amount прокидывается как IO threshold → ТОЧНО = нынешний 0.15, margin не нужен
    transition: { duration: reduced ? 0 : 1, ease: EASE_OUT },
  };
}
// было:  <div className="rt-reveal" style={…}>
// стало: <motion.div {...useReveal()} style={…}>
```

- **Hero — carve-out.** `sections.jsx:206` сейчас `rt-reveal rt-in` → виден сразу, без въезда (первый экран, LCP). Единый `useReveal()` добавил бы ему fade-up, которого на проде НЕТ. Hero оставляем без `whileInView`/с `initial={false}` (без входной анимации). В приёмке: «Hero — мгновенно».
- **11 reveal-элементов** в ~8 секциях (`:206,251,714,745,931,936,1034,1072,1115,1174,1193`), из них 2 внутри `Works` (`:714,745`).
- **Удаляем:** IO + логику `rt-in` из `src/app.jsx`; правила `.rt-reveal`/`.rt-reveal.rt-in` и их RM-ветку из `index.html`. Проверка: грепнуть, что `rt-in` и `.rt-reveal` больше нигде не читаются.

### 4.2. REC-точка и эквалайзер — ИСКЛЮЧЕНИЕ, остаются на CSS

**Решение владельца (2026-07-22):** не переводим. Причина: это единственные вечно-активные аниматоры; CSS-keyframes крутятся на компоситоре бесплатно, Motion гнал бы их через JS каждый кадр — постоянная нагрузка на main-thread без выигрыша. `@keyframes rt-pulse`/`rt-eq` и их RM-ветка в `index.html` **остаются как есть**.

### 4.3. Ховеры → Motion — только «чистые» цели (variant-propagation)

**Решение (2026-07-22, после 3-агентного ревью ×2):** на Motion переводим ТОЛЬКО ховеры с реальной многоэлементной хореографией и собственным `transition` (variant-propagation). Простые/мгновенные/сцеплённые/`<a>`-ховеры **остаются как есть** — их перевод либо не 1:1, либо ловушка (см. ниже).

**Мигрируем (variant-propagation через `variants`, родитель→дети):**
| Цель | Дети / значения | Где | ease |
|---|---|---|---|
| **Карточка работы** | img `scale(1.06)` `.7s` + scrim `opacity` `.35s` + подпись `translateY`+`opacity` `.35s` | `sections.jsx:316–319` | scale — **EASE_OUT**; scrim/подпись — `[0.25,0.1,0.25,1]` |
| **Строка услуги** | фон + номер (color) + стрелка (`translateX`+color), все `.25s` | `sections.jsx:1046–1050` | `[0.25,0.1,0.25,1]` |
| **Точка DotNav → подпись** | подпись `opacity`+`translateX`(+color) `.25s` | `sections.jsx:1375–1376` (база + инлайн-`transition` тут, не только `index.html:94`) | `[0.25,0.1,0.25,1]` |

`EASE_OUT=[0.22,1,0.36,1]` в коде стоит ТОЛЬКО на `scale` карточки (`:316`); все прочие свойства — CSS-дефолт `ease=cubic-bezier(0.25,0.1,0.25,1)`, задавать явно (Motion-дефолт даёт другую кривую). Карточный `filter .4s` на ховере не меняется (grayscale статичен) — no-op, не переносим.

**Остаются как есть (НЕ Motion) — по техпричине:**
| Цель | Почему |
|---|---|
| `.rt-clip-item` (`index.html:104` / инлайн `:996`) | инлайн-`transition` ведёт ещё и фейд АКТИВНОГО ролика — снять нельзя без регресса |
| `.rt-lb-nav` (`index.html:115`) | мгновенный сегодня (нет `transition`) — whileHover добавил бы сглаживание, не 1:1 |
| `.rt-lb-live` (`index.html:118`) | shared class на `motion.button` (`:398`) И Vaul `Drawer.Close` (`:438`) + `!important` — whileHover либо no-op, либо ломает `Drawer.Close` |
| Навлинки шапки (`:176`), ссылка отзывов (`:1123`), соц-иконки (`:1228`) | `<a>`-цвет-ховеры: глобальный `a{transition:color}` (`index.html:79`) транзишенит покадровые записи Motion → конфликт |
| Стрелки ленты (`:708`) | инлайн React-state ховер с var()-мульти-свойствами — оставляем |
| Кнопки стилей (`:754–758`) | активное состояние `s===style`, не ховер |
| «Затвердевание» шапки (`:163–167`) | скролл-триггер, не ховер |
| `a{}`, `:focus-visible` | базовые CSS-примитивы |

**Оговорки для мигрируемых трёх:**
- Снять инлайн-`transition:` с переводимых элементов (`sections.jsx:316/318/319/1046/1047/1050/1376`) — иначе дерётся с покадровыми записями Motion. Убрать CSS `.rt-dot:hover .rt-dot-label` (`index.html:94`).
- `backgroundColor`/цвет — резолвить `var()`→конкретное значение.
- Через `variants` на родителе + `variants`-детях, а не `whileHover`-однострочник.

### 4.4. Фейд ролика «03» → `motion` opacity

`sections.jsx:946`: `opacity: fade?0:1, transition:"opacity .26s ease"` → `motion.div` `animate={{opacity: fade?0:1}}` `transition={{duration:.26, ease:[0.25,0.1,0.25,1]}}` (CSS `ease` = cubic-bezier(.25,.1,.25,1); Motion-дефолт иной — задать явно для 1:1). Снять старый инлайн-`transition`.

### 4.5. Модалки → `AnimatePresence` (новая анимация)

`WorkLightbox` (`:376`) и `BookingModal` (`:1324`) сейчас монтируются мгновенно (`if(!open) return null`). Добавляем мягкий вход/выход. **Реструктуризация обязательна:** чтобы отыграть exit до размонтирования, `AnimatePresence` должен быть родителем условного `motion`-ребёнка — компонент больше НЕ возвращает `null`, а всегда рендерит `<AnimatePresence>{open && (<motion…/>)}</AnimatePresence>`.

```jsx
<AnimatePresence>
  {open && (
    <motion.div /* overlay */ initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      transition={{duration: reduced ? 0 : .2}}>
      <motion.div /* panel */ initial={{opacity:0, scale:.96, y:8}} animate={{opacity:1, scale:1, y:0}}
        exit={{opacity:0, scale:.98, y:6}} transition={{duration: reduced ? 0 : .24, ease: EASE_OUT}}>
        …контент…
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

- **Reduced-motion:** `reduced` → `duration: 0` (мгновенно, как сейчас) — деградация в текущее поведение.
- **Body-overflow.** Сейчас `WorkLightbox` вешает `document.body.style.overflow="hidden"` в эффекте по `open`. При exit-анимации разлочка скролла произойдёт в начале выхода (пока панель ещё видна ~0.24s) — приемлемо; при желании привязать сброс к `onExitComplete`.
- **Фокус.** Логику фокуса/Esc `WorkLightbox` (`closeRef`, гейт Esc, видео-лист Vaul внутри) НЕ ломать — `AnimatePresence` оборачивает разметку, не трогая обработчики.
- Vaul-лист внутри лайтбокса — со своей анимацией, не через это.

---

## 5. Детальный дизайн: лента работ (главный риск)

Ядро — один rAF-цикл (`sections.jsx:515–563`): конечный автомат над `S.current` (ref), пишет `track.style.transform` каждый кадр. **Физику не трогаем — меняем драйвер кадров и источник reduced-motion.**

### 5.1. Драйвер: `requestAnimationFrame` → `useAnimationFrame`

```jsx
import { useAnimationFrame } from "motion/react";
const reduced = usePrefersReducedMotion();   // своя подписка (§3.2) — useReducedMotion() не живой
useAnimationFrame((time, delta) => {
  const dt = Math.min(0.05, delta / 1000);   // delta в мс → заменяет (now-last)/1000
  /* … тело АВТОМАТА из sections.jsx:519–561 … */
});
```

**Переносится тело автомата** (up/swap/down, tween, vel-выбег, автоскролл, modulo-wrap, sweep, ведение стиля). **Заменяется драйвер:** строка `dt`/`last`, само-`requestAnimationFrame`, `cancelAnimationFrame`-cleanup — уходят в хук. Формулировка «дословно» относится только к автомату.

**Гард-рейлы (иначе тонкий регресс):**
- `tick` (счётчик `sweep` раз в 10 кадров) — сделать `useRef`. Плоский `let tick` в колбэке сбрасывался бы каждый кадр → `sweep()` ломается → «пустые прямоугольники» у редких стилей (баг, от которого и стоит `sweep`).
- `sweep`, `track`/`wrap` — вынести в scope компонента / читать через `trackRef.current`/`wrapRef.current`.
- **Живой reduced-motion сохраняется только** если колбэк — свежее замыкание каждого рендера (Motion пере-подписывает его и берёт свежий `reduced`). **НЕ** оборачивать в `useCallback([])` и **НЕ** прятать цикл в `useEffect([])` с захваченным `reduced` — заморозит значение и сломает живое переключение (сейчас `motion.matches` читается каждый кадр).

### 5.2. Привязка transform

- **(a) дефолт, низкий риск:** прямая запись `track.style.transform = translate3d(-offset,0,0)` внутри `useAnimationFrame`. Ноль изменений в геометрии/sweep.
- **(b) идиоматичнее:** `useMotionValue(0)` → `<motion.div style={{ x }}>`, `x.set(-offset)`. Но `x` даёт `translateX`, а не `translate3d(…,0,0)` — теряется явный Z-хинт (перф-незначимо). Дефолт — **(a)**.

### 5.3. Слот-машина

Фазы `up/swap/down` и `SPIN_*` — **без изменений**. Ветка reduced-motion в `sortByStyle` (`:637`) → `reduced`.

### 5.4. Reduced-motion в ленте

- `sections.jsx:513` `const motion = window.matchMedia(...)` → удалить.
- `:546` `!s.paused && !motion.matches` → `!s.paused && !reduced`.
- `:637` `matchMedia(...).matches` → `reduced`.

### 5.5. Драг/wheel — нативные (см. §1)

Pointer-обработчики (`DRAG_SLOP=8`, `s.moved`, `open()` по `detail===0`), `wheel`/`scroll` — остаются на нативных событиях, пишут в тот же `S.current`, который читает `useAnimationFrame`.

### 5.6. Заметка про `const motion` (уточнено после ревью)

`sections.jsx:513` `const motion = window.matchMedia(...)` объявлен **внутри `useEffect`-замыкания** (эффект 469–566), а НЕ в теле `Works`. Поэтому `<motion.div>` в return-е `Works` (`:714/745`) ссылается на импорт — **сборка НЕ падает** (это не blocker). Реальный (узкий) риск: при переносе тела цикла, если оставить `!motion.matches` дословно, `motion` станет импортированным namespace → `motion.matches === undefined` → автоскролл молча перестанет глушиться под reduced-motion. **§5.4 это закрывает** (удаляет строку 513, заменяет на `reduced`). Отдельного «предусловия» не требуется — достаточно выполнить §5.4.

---

## 6. Reduced-motion — стратегия

`usePrefersReducedMotion()` (свой, §3.2 — `useReducedMotion()` из Motion читает значение один раз) в каждом анимированном компоненте. Убираем: RM-ветку reveal из `index.html` (`.rt-reveal` в `@media`), `matchMedia` в `sections.jsx:513,637`. **Остаётся на CSS:** RM для REC/эквалайзера (они на CSS) и для scroll-snap (`index.html:121`). Формулировка: «анимационный RM — в React, скролл-RM — в CSS». Проверка: грепнуть удаляемые селекторы.

---

## 7. Что НЕ переводится

| Что | Почему | Механизм |
|---|---|---|
| Vaul (видео-лист) | решение владельца | Vaul |
| **REC-точка, эквалайзер** | решение владельца; перф бесконечных лупов (§4.2) | CSS |
| Драг/wheel ленты | техническое исключение (§1) — Motion `drag` не даёт бесшовный modulo без регресса | native events |
| scroll-snap / smooth-scroll | браузерный скролл | CSS |
| film-grain | статичный оверлей | CSS |
| lazy-load плеера «03», активная секция DotNav | IntersectionObserver-логика | IO |
| `:focus-visible` | доступность | CSS |

---

## 8. Риски и снятие

1. **Регресс ленты (главный).** Физику переносим дословно, меняем только драйвер; сверяем замерами (§10). Плюс гард-рейлы §5.1 (`tick`→ref, живой RM).
2. **Hero.** Легко потерять 1:1, добавив несуществующий fade-in → carve-out §4.1, отдельный пункт приёмки.
3. **`const motion`** (§5.6) — не blocker; закрывается §5.4.
4. **Модалки** — НЕ 1:1 (добавляем анимацию); критерий — «мягкий вход/выход, RM=мгновенно». Не сломать фокус/Esc/скролл-лок (§4.5).
5. **Ховеры** — var()-резолв и variant-propagation (§4.3), иначе часть не сгладится / не сработает.
6. **Откат.** Пуш в master = сразу прод (`mem:rated-tattoo-live-prod`). Репо в squash-only → откат каждой фазы = кнопка «Revert» на PR (или `git revert <squash-sha>` без `-m`). Preview-гейт «владелец подтвердил» — на ВСЕ фазы (Фаза 3 усиленно). Откат НЕ мгновенный (concurrency-очередь + пересборка) — детали в блоке Merge-gate плана.
7. **Мобайл** — трафик мобильный; тач-драг/passive/RM на iOS проверять отдельно (§10).

---

## 9. План внедрения (фазы; каждая — PR + сверка)

**Фаза 1 — reveal.** `useReveal` (§4.1) с carve-out Hero; удалить IO из `App()` и CSS `.rt-reveal`. Приёмка: 10 reveal-элементов появляются как раньше (opacity+translateY, 1000мс), **Hero — мгновенно**; `once` (повторный скролл не переигрывает); RM — статично; консоль чистая.

**Фаза 2 — ховеры + фейд «03» + модалки.** `whileHover` по списку §4.3 (с var()-резолвом/вариантами; часть остаётся CSS), фейд «03» (§4.4), `AnimatePresence` модалок (§4.5). **REC/эквалайзер НЕ трогаем.** Приёмка: ховеры визуально как раньше; модалки — мягкий вход/выход, RM=мгновенно, фокус/Esc/скролл-лок целы.

**Фаза 3 — лента.** `useAnimationFrame` + перенос автомата + гард-рейлы §5.1 + `reduced` §5.4. Приёмка — замеры §10; откат/gate §8.6. Прогон на проде после мержа.

Конвейер каждой фазы: ветка → `npm run build` → `vite preview` + chrome-devtools → PR → мерж.

---

## 10. Критерии приёмки (с методами и допусками)

**Общее:** консоль без ошибок ПО НАШЕМУ КОДУ — базлайн шума: Vaul/Radix (aria-hidden), Яндекс-плеер (CORS/deprecated) — их отделять. Мобильный прогон (реальный iOS Safari/Android Chrome) — на КАЖДОЙ фазе (Фаза 2 — модалки/Vaul-жест обязательно).

**Reveal (Фаза 1):**
- ease — зафиксировано `[0.22,1,0.36,1]`; длительность `1000 ± 50 мс`; порог видимости `amount 0.15`.
- `once`: повторный скролл к элементу не переигрывает.
- Hero: виден сразу, без движения.

**Модалки (Фаза 2):** вход/выход отыгрывается (не мгновенный скачок), при `prefers-reduced-motion` — мгновенно; фокус садится как раньше, Esc/скролл-лок работают.

**Лента (Фаза 3) — замеры, не «на глаз»:**
- Автоскролл: сэмплить `x` из `getComputedStyle(track).transform` (или `s.offset`) дважды через известный интервал при `paused=false` → `Δpx/Δs = 34 ± 2 px/s`.
- Слот-машина: покадрово сэмплить `s.offset` в фазе `swap` → пик `5000 ± 200 px/s`; в центре кадра — оригинал, не двойник (`aria-hidden` у второго прохода); после прогона по «Готике» (4 работы: Вампирша/Череп и розы/Батори/Лилит) стиль под лентой ведётся верно.
- Драг/wheel/инерция и клавиатурный фокус (`glideIntoView`) — как раньше.

**Reduced-motion (чек-лист конечных состояний, эмуляция в chrome-devtools):** reveal статичен; REC/эквалайзер без анимации (на CSS — уже так); модалки мгновенно; лента не автоскроллит и переставляет мгновенно (`sortByStyle` идёт веткой `:637`); **живое переключение RM во время автоскролла** — лента замирает немедленно.

---

## 11. Журнал решений

- **REC-точка/эквалайзер → остаются на CSS** (исключение). Решено 2026-07-22.
- **Модалки → анимируем** (`AnimatePresence`, новая анимация; RM=мгновенно). Решено 2026-07-22.
- Привязка transform ленты — вариант **(a)** прямая запись (дефолт).
- Драг/wheel — нативные (техническое исключение).
