# План реализации: перевод анимаций на Motion for React

## Overview
Перевести анимации сайта Rated Tattoo на **Motion for React** (`motion` / `motion/react`, уже установлен) по Варианту C. Источник истины по дизайну, обоснованиям и параметрам — **`docs/animation-motion-migration.md`** (прошёл ревью 3 агентами 2026-07-22). Этот файл — исполняемый список задач.

Ключевое:
- **Сохраняем поведение 1:1** для существующих анимаций (числа переносим дословно, замеряем в браузере). Исключение — **модалки**: им ДОБАВЛЯЕМ вход/выход (сейчас анимации нет), критерий — «мягко + reduced-motion=мгновенно».
- **Исключения (не на Motion):** Vaul (родная анимация), REC-точка/эквалайзер (остаются на CSS — перф бесконечных лупов), драг/wheel ленты (нативные — Motion `drag` не даёт бесшовный modulo без регресса), scroll-snap/grain/`:focus-visible`.
- 3 фазы, каждая — отдельная ветка/PR/выкат. Пуш в master = сразу прод (`mem:rated-tattoo-live-prod`).

## Context (from discovery)
- **Проект:** статический одностраничник, Vite 8 + React 18, деплой `dist/` на GitHub Pages. Тест-раннера НЕТ.
- **Файлы:** `sections.jsx` (все секции, лента, модалки), `src/app.jsx` (`App()` + reveal-IO), `index.html` (инлайновый `<style>`: `.rt-reveal`, `@keyframes`, RM-media), `public/tokens/spacing.css` (`--ease-out`).
- **Уже на Motion:** кнопка «Смотреть вживую» (`sections.jsx:398`) — паттерн-образец.
- **Свереные факты (ревью):** 11 reveal-элементов (`:206`(Hero, вшит `rt-in`)`,251,714,745,931,936,1034,1072,1115,1174,1193`); `--ease-out = cubic-bezier(0.22,1,0.36,1)`; `SPIN_UP/DOWN/VMAX=0.24/1.1/5000`, автоскролл 34 px/s; RM в 3 местах (`index.html:120`, `sections.jsx:513,637`); `const motion=matchMedia` (`:513`) — внутри `useEffect`-замыкания, сборку НЕ роняет.

## Development Approach
- **Верификация (адаптировано — тест-раннера нет):** вместо юнит-тестов — **браузерная сверка через chrome-devtools MCP по протоколам §10 дизайн-доки**. Это обязательная часть каждой задачи, не опция.
- Полностью завершать задачу до перехода к следующей; маленькие фокусные изменения.
- **Каждая задача заканчивается браузерной проверкой; следующая не начинается, пока текущая не сверена зелёной.**
- Сохранять поведение 1:1 (кроме модалок — осознанное добавление).
- **Обновлять этот план по ходу** при изменении объёма.

## Testing Strategy
- **Юнит-тестов нет** (для визуальных/тайминговых анимаций малополезны; тест-фреймворк не заводим — решение владельца).
- **Браузерная сверка (chrome-devtools MCP)** — основной инструмент, с измеримыми допусками (§10 доки): reveal `1000±50мс`/`amount 0.15`/`once`; автоскролл `34±2 px/s`; пик слот-машины `5000±200 px/s`; RM-чек-лист конечных состояний; базлайн шума консоли (Vaul/Radix/Яндекс отделять). Мобильный прогон (iOS Safari/Android Chrome) для Фаз 1 и 3.
- Каждая фаза сверяется на `vite preview`, затем на живом ratedtattoo.ru после мержа.

## Progress Tracking
- `[x]` сразу по завершении; ➕ — новые задачи; ⚠️ — блокеры; синхронизировать план с фактом.

## Solution Overview
- **Reveal** → хук `useReveal()` (`whileInView`+`useReducedMotion`), Hero — carve-out (без входа). Удаляем IO из `App()` и CSS `.rt-reveal`.
- **Ховеры** → `whileHover` (подмножество; var()→конкретика; DotNav — variants; часть остаётся на CSS).
- **Фейд «03»** → `motion` opacity.
- **Модалки** → `AnimatePresence` (реструктуризация: без `return null`), RM=мгновенно.
- **Лента** → `useAnimationFrame` (физика дословно), гард-рейлы (`tick`→ref, `sweep` в scope, живой RM), RM через `useReducedMotion`.

## Technical Details
- `EASE_OUT = [0.22, 1, 0.36, 1]`. `useReveal` возвращает `{}` при `reduced` (статично) либо `{initial, whileInView, viewport:{once,amount:0.15}, transition:{duration:1, ease:EASE_OUT}}`.
- Модалки: `<AnimatePresence>{open && <motion.div overlay …><motion.div panel …/></motion.div>}</AnimatePresence>`; `transition.duration = reduced ? 0 : …`.
- Лента: `useAnimationFrame((time,delta)=>{ const dt=Math.min(0.05,delta/1000); …тело автомата… })`; `tick`→`useRef`; `sweep`/`track`/`wrap` в scope компонента/через refs; НЕ оборачивать колбэк в `useCallback([])` и НЕ прятать в `useEffect([])` (заморозит живой RM).
- Детали, границы и полный инвентарь ховеров — в `docs/animation-motion-migration.md` (§4–§8).

## What Goes Where
- **Implementation Steps** (`[ ]`): правки кода + браузерная сверка + открытие PR.
- **Post-Completion** (без чекбоксов): мерж PR (= выкат на прод, действие/подтверждение владельца), прод-сверка после мержа, удаление веток.

## Implementation Steps

### Task 1: Reveal-система — `useReveal`, Hero carve-out, снятие IO/CSS
**Files:**
- Modify: `sections.jsx`, `src/app.jsx`, `index.html`

- [ ] завести ветку `motion-phase1-reveal` (до правок — master = прод)
- [ ] вверху `sections.jsx`: `EASE_OUT=[0.22,1,0.36,1]` и `useReveal()` (через `useReducedMotion`+`whileInView`, `viewport:{once:true,amount:0.15}`, `duration:1`). Отдельный файл НЕ заводим — `EASE_OUT` нужен ещё модалкам (Task 5) и фейду (Task 4)
- [ ] заменить 10 не-Hero reveal-элементов на `<motion.div {...useReveal()} …>`; **убрать ТОЛЬКО классы `rt-reveal`/`rt-in`, прочие классы сохранить** — они несут медиа-адаптив (`rt-about-grid` :251, `rt-work-styles` :745, `rt-faq-grid` :1174 → `index.html:113,132`) + сохранить инлайн-`style`
- [ ] Hero (`sections.jsx:206`) — carve-out: снять `rt-reveal rt-in`, оставить обычный `<div>` (без motion-обёртки; виден сразу, без въезда)
- [ ] удалить reveal-`IntersectionObserver` и логику `rt-in` из `src/app.jsx`
- [ ] в `index.html` удалить правила `.rt-reveal`/`.rt-reveal.rt-in`; **в RM-`@media` (`:120-124`) удалить ТОЛЬКО строку `.rt-reveal` (122), сохранить scroll-snap (121) и REC/эквалайзер (123)**; грепнуть, что `rt-in`/`.rt-reveal` больше нигде не читаются
- [ ] браузерная сверка (§10 reveal): 10 элементов появляются opacity+translateY `1000±50мс`, Hero мгновенно, `once`, RM статично, **адаптив сеток цел**, консоль чистая

### Task 2: Фаза 1 — сборка, сверка, PR
**Files:**
- Modify: (без правок кода — сборка/PR)

- [ ] `npm run build` зелёный (ветка `motion-phase1-reveal` заведена в Task 1)
- [ ] `vite preview` + chrome-devtools: полный прогон §10 reveal (вкл. мобильный вьюпорт)
- [ ] коммит + `gh pr create` → master; в PR отметить Hero-исключение
- [ ] дождаться авто-ревью (Codex), отработать замечания при наличии

### Task 3: Ховеры → `whileHover`
**Files:**
- Modify: `sections.jsx`, `index.html`

- [ ] завести ветку `motion-phase2-hover-modals` (до правок)
- [ ] перевести на `whileHover` цели из инвентаря §4.3 (карточка работы, строки услуг, соц-иконки, ссылка отзывов, стрелки ленты, кнопки стилей)
- [ ] `backgroundColor`-ховеры: резолвить `var(--accent)`→конкретное значение (иначе тван не сгладится)
- [ ] DotNav «точка→подпись» (`index.html:94`) — через `variants` (propagation родитель→ребёнок), либо оставить на CSS с пометкой
- [ ] оставить на CSS осознанно: глобальный `a{transition:color}`, `:focus-visible`, `.rt-lb-nav:hover` (`index.html:115`), `.rt-clip-item:hover` (`:104`); «затвердевание» шапки (`sections.jsx:163-167`) — **остаётся на JS, вне объёма** (скролл-триггер, не ховер)
- [ ] вычистить перенесённые `:hover`-правила из `index.html`
- [ ] браузерная сверка: ховеры визуально как раньше, RM корректно, консоль чистая

### Task 4: Фейд ролика «03» → `motion`
**Files:**
- Modify: `sections.jsx`

- [ ] заменить инлайн `transition:opacity .26s` (`:946`) на `motion.div` `animate={{opacity:fade?0:1}}` `transition={{duration:.26}}`
- [ ] браузерная сверка: смена ролика в «03» фейдит как раньше (`.26s`)

### Task 5: Модалки → `AnimatePresence` (новая анимация)
**Files:**
- Modify: `sections.jsx`

- [ ] `WorkLightbox` (`:376`): реструктуризация — вместо `if(!open) return null` рендерить `<AnimatePresence>{open && <motion overlay/panel …/>}</AnimatePresence>`; вход/выход (opacity + scale/y), panel ease `EASE_OUT` (объявлен в Task 1 вверху `sections.jsx`), `duration=reduced?0:~.24`
- [ ] `BookingModal` (`:1324`): то же
- [ ] сохранить фокус/Esc/скролл-лок и вложенный Vaul-лист (обёртка не трогает обработчики); body-overflow при желании привязать к `onExitComplete`
- [ ] браузерная сверка: вход/выход отыгрывается, при `prefers-reduced-motion` — мгновенно; фокус/Esc/скролл-лок целы; видео-лист Vaul работает

### Task 6: Фаза 2 — сборка, сверка, PR
**Files:**
- Modify: (сборка/PR)

- [ ] `npm run build` зелёный (ветка заведена в Task 3)
- [ ] `vite preview` + chrome-devtools: ховеры, фейд «03», модалки (вкл. RM); REC/эквалайзер НЕ трогали — проверить, что живы
- [ ] **мобильный прогон модалок** (тач): вход/выход, scroll-lock (`body.overflow`), жест Vaul-листа, фокус/Esc — на тач-устройствах это ломается чаще всего
- [ ] коммит + PR → master; отработать авто-ревью

### Task 7: Лента — подготовка RM/`const motion` (§5.4/§5.6)
**Files:**
- Modify: `sections.jsx`

- [ ] завести ветку `motion-phase3-carousel` (до правок)
- [ ] вызвать `const reduced = useReducedMotion()` на верхнем уровне `Works`
- [ ] удалить `const motion = window.matchMedia(...)` (`:513`); заменить `!motion.matches` (`:546`) → `!reduced`
- [ ] заменить `matchMedia(...).matches` в `sortByStyle` (`:637`) → `reduced`
- [ ] `npm run build` зелёный (убедиться, что импорт `motion` больше ничем не затенён)
- [ ] браузерная сверка (промежуточная): лента/слот-машина как раньше; проверять **только СТАТИЧЕСКИЙ RM** — цикл ещё в `useEffect([])` с захваченным `reduced`, живое переключение RM восстановится в Task 8

### Task 8: Лента — драйвер `useAnimationFrame` + гард-рейлы
**Files:**
- Modify: `sections.jsx`

- [ ] `measure()`, `ResizeObserver` и регистрацию `S.current.sweep = sweep` ОСТАВИТЬ в отдельном `useEffect([])`; из него убрать только rAF-цикл; **`ro.disconnect()` в cleanup сохранить**
- [ ] `tick` → `useRef`; `sweep`/`track`/`wrap` доступны новому колбэку (scope компонента / через refs)
- [ ] заменить `requestAnimationFrame`-цикл на `useAnimationFrame((time,delta)=>{ dt=Math.min(0.05,delta/1000); …тело автомата дословно… })`; убрать `last`/само-rAF/`cancelAnimationFrame(raf)`
- [ ] привязка transform — вариант (a): прямая запись `track.style.transform=translate3d(-offset,0,0)`
- [ ] НЕ оборачивать колбэк в `useCallback([])`, НЕ прятать в `useEffect([])` (сохранить живой RM)
- [ ] браузерная сверка (§10 лента): автоскролл `34±2 px/s`, пик слот-машины `5000±200 px/s`, «Готика» без двойника, драг/wheel/инерция, клавиатурный `glideIntoView`, живое переключение RM

### Task 9: Фаза 3 — сборка, сверка, PR (+ готовность отката)
**Files:**
- Modify: (ветка/сборка/PR)

- [ ] `npm run build` зелёный (ветка `motion-phase3-carousel` заведена в Task 7)
- [ ] `vite preview` + chrome-devtools: полный §10 (десктоп + мобильный тач-драг)
- [ ] коммит + PR → master; в описании — план отката (`git revert` merge → авто-redeploy) и просьба подтвердить preview до мержа
- [ ] отработать авто-ревью

### Task 10: Проверка критериев приёмки (все фазы)
- [ ] пройтись по §10 доки целиком: reveal, ховеры, фейд, модалки (+RM), лента (замеры)
- [ ] reduced-motion чек-лист конечных состояний во всех блоках
- [ ] прод-сверка ratedtattoo.ru после каждого мержа (Babel убран, 0 CDN, консоль по нашему коду чистая)
- [ ] мобильный прогон (iOS Safari / Android Chrome) для Фаз 1 и 3

### Task 11: [Финал] Документация и завершение
- [ ] обновить `docs/animation-motion-migration.md` при отклонениях реализации от дизайна
- [ ] обновить `CLAUDE.md`, если появились новые паттерны (напр. `useReveal`)
- [ ] обновить Serena-память `mem:session_state_2026_07_20` (через инструменты Serena, не руками)
- [ ] переместить этот план в `docs/plans/completed/`

## Post-Completion
*Требует внешнего действия — без чекбоксов, информационно*

**Мерж и прод:**
- Мерж каждого PR = выкат на прод (ratedtattoo.ru) — действие/подтверждение владельца. Для Фазы 3 — gate «владелец подтвердил `vite preview`» до мержа.
- Прод-сверка сразу после мержа; при регрессе Фазы 3 — `git revert` merge-коммита → авто-redeploy.

**Чистка:**
- Удалить смерженные ветки (`motion-phase1-reveal`, `motion-phase2-hover-modals`, `motion-phase3-carousel`), а также ранее смерженные `build-vite`, `works-video-lightbox`.

**Ручная проверка:**
- Мобильные жесты (тач-драг ленты, passive-listeners) на реальных устройствах.
- Перф-наблюдение после Фазы 3 (лента на среднем устройстве) — если просядет, вариант (b)/откат драйвера известен.
