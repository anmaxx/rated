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
- **Браузерная сверка (chrome-devtools MCP)** — основной инструмент, с измеримыми допусками (§10 доки): reveal `1000±50мс`/`amount 0.15`/`once`; автоскролл `34±2 px/s`; пик слот-машины `5000±200 px/s`; RM-чек-лист конечных состояний; базлайн шума консоли (Vaul/Radix/Яндекс отделять). Мобильный прогон (iOS Safari/Android Chrome) — на КАЖДОЙ фазе (Фаза 2 — модалки/Vaul-жест обязательно).
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

## Merge-gate (обязателен перед мержем КАЖДОЙ фазы)
Мерж = мгновенный прод, CI на PR нет — гейт явный, часть обращена к владельцу (жмёт merge). **Ветку фазы N+1 резать ТОЛЬКО от master со смердженной И прод-сверенной фазой N** (сериализация: все три фазы правят один `sections.jsx`). Бэкстоп: в `static.yml` `deploy: needs: build` — красная сборка НЕ деплоится, прод остаётся на последней рабочей версии.
**Предусловие (один раз):** перевести репо в **squash-only** (в Settings отключить merge-commit и rebase), чтобы владелец не мог создать merge-коммит → откат = простой `git revert <sha>` без `-m`.
1. **`npm ci` (Node 22) → `npm run build`** зелёный — зеркалит CI (тёплый локальный build может пройти там, где CI падает на lockfile/Node/платформе).
2. `vite preview` + chrome-devtools: §10 фазы зелёный — **десктоп И мобильный** (реальный iOS Safari / Android Chrome).
3. Консоль-дифф чист против базлайна (снят раз до Фазы 1; шум Vaul/Radix/Яндекс отделён).
4. Размер `dist`-JS в бюджете (сравнение до/после; Motion теперь в бандле).
5. Авто-ревью (Codex) отработано.
6. **Владелец подтвердил `vite preview`** до мержа — ВСЕ фазы (Фаза 3 усиленно).
7. Мерж — **squash** (кнопкой). Откат: кнопка **«Revert» на PR** (создаёт revert-PR, корректно ревертит squash-коммит, уважает protection) — предпочтительно; либо `git revert <squash-sha>` без `-m` (SHA появляется ТОЛЬКО после мержа — брать из `git fetch && git log -1 master`). Способ отката вписать в описание PR.
8. После мержа: `gh run watch $(gh run list --branch master --workflow static.yml -L1 --json databaseId -q '.[0].databaseId') --exit-status` (без `--exit-status` вернёт 0 даже на падении). Дождаться зелёного → сверять по **версии, а не рефрешу**: отданный `index.html` ссылается на НОВЫЙ хэш бандла (edge/CDN может отдавать старый) → прод-сверка ratedtattoo.ru → только ЗАТЕМ ветка следующей фазы.
9. **CI-ран красный** → немедленно revert squash-коммита (master в зелёное; прод и так на старой версии из-за `needs:build`), разбор офлайн; master красным не оставлять.
10. Откат НЕ мгновенный: `concurrency: cancel-in-progress:false` ставит revert-деплой в очередь (≈ остаток текущего + build+deploy, минуты); после отката — своя прод-сверка (что откат реально вернул рабочий прод).

## Implementation Steps

### Task 1: Reveal-система — `useReveal`, Hero carve-out, снятие IO/CSS
**Files:**
- Modify: `sections.jsx`, `src/app.jsx`, `index.html`

- [x] снять базлайн шума консоли на текущем ratedtattoo.ru (эталон для пофазной сверки «консоль по нашему коду чистая»; отделить Vaul/Radix/Яндекс) — **базлайн = пустая консоль**: загрузка, прокрутка всех секций, лайтбокс и Яндекс-плеер не дали ни одного сообщения (шум Vaul/Radix/Яндекс на главном таргете не проявился)
- [x] завести ветку `motion-phase1-reveal` (до правок — master = прод)
- [x] вверху `sections.jsx`: `EASE_OUT=[0.22,1,0.36,1]` и `useReveal()` (через `useReducedMotion`+`whileInView`, `viewport:{once:true,amount:0.15}`, `duration:1`). Отдельный файл НЕ заводим — `EASE_OUT` нужен ещё модалкам (Task 5) и фейду (Task 4)
- [x] заменить 10 не-Hero reveal-элементов на `<motion.div {...useReveal()} …>`; **убрать ТОЛЬКО классы `rt-reveal`/`rt-in`, прочие классы сохранить** — они несут медиа-адаптив (`rt-about-grid` :251, `rt-work-styles` :745, `rt-faq-grid` :1174 → `index.html:113,132`) + сохранить инлайн-`style`
- [x] Hero (`sections.jsx:206`) — carve-out: снять `rt-reveal rt-in`, оставить обычный `<div>` (без motion-обёртки; виден сразу, без въезда)
- [x] удалить reveal-`IntersectionObserver` и логику `rt-in` из `src/app.jsx`
- [x] в `index.html` удалить правила `.rt-reveal`/`.rt-reveal.rt-in`; **в RM-`@media` (`:120-124`) удалить ТОЛЬКО строку `.rt-reveal` (122), сохранить scroll-snap (121) и REC/эквалайзер (123)**; грепнуть, что `rt-in`/`.rt-reveal` больше нигде не читаются (в репо чисто; остались только мёртвые вхождения внутри артефакта `_ds_bundle.js`, чья копия секций не рендерится)
- [x] браузерная сверка (§10 reveal): 10 элементов появляются opacity+translateY `1000±50мс`, Hero мгновенно, `once`, RM статично, **адаптив сеток цел**, консоль чистая

**Замеры Task 1 (vite preview, 1440×900):** длительность `1007.5 мс`; кривая совпала с `cubic-bezier(0.22,1,0.36,1)` (отклонение ≤0.05 — в пределах ±8 мс неопределённости старта); старт `opacity 0 / translateY(46px)` = дословно прежний CSS; порог: при видимости 7.9% и 13% элемент скрыт, при 25.7% — раскрыт (`amount 0.15`); `once` — возврат к элементу не переигрывает; 10 скрытых при загрузке → все 10 в `opacity 1 / transform none` после прохода; Hero `opacity 1, transform none` сразу; RM (подменённый `matchMedia`) — статично, без инлайновых `opacity/transform`; при 900px `.rt-about-grid`/`.rt-faq-grid` в одну колонку, `gap 40px`; консоль пуста (= базлайн).

### Task 2: Фаза 1 — PR + Merge-gate
**Files:**
- Modify: (без правок кода — сборка/PR)

- [ ] коммит + `gh pr create` → master (мерж — squash-кнопкой; репо squash-only); в PR — Hero-исключение и способ отката (кнопка «Revert» на PR / `git revert <squash-sha>`, SHA после мержа)
- [ ] пройти **Merge-gate** (см. блок выше): §10 reveal (десктоп+мобайл), консоль-дифф, бюджет JS, авто-ревью, preview-гейт владельца, после мержа `gh run watch` + cache-bust + прод-сверка

### Task 3: Ховеры → Motion — 3 variant-propagation цели (§4.3)
**Files:**
- Modify: `sections.jsx`, `index.html`

- [ ] завести ветку `motion-phase2-hover-modals` — **от master со смердженной И прод-сверенной Фазой 1** (несёт `EASE_OUT`)
- [ ] **variant-propagation через `variants`** (родитель→дети) для ТРЁХ целей: карточка работы (`:316–319`: img `scale .7s` **EASE_OUT** + scrim `opacity .35s` + подпись `y+opacity .35s`), строка услуги (`:1046–1050`: фон+номер+стрелка `.25s`), DotNav точка→подпись (`:1375–1376`: `opacity`+`translateX` `.25s`)
- [ ] **ease по свойству:** `EASE_OUT` только для `scale` карточки; всё остальное — `[0.25,0.1,0.25,1]` (CSS-дефолт `ease`, Motion-дефолт иной); цвет/`backgroundColor` — резолвить `var()`→конкретное значение
- [ ] снять инлайн-`transition:` с переведённых (`:316/318/319/1046/1047/1050/1376`); убрать CSS `.rt-dot:hover .rt-dot-label` (`index.html:94`)
- [ ] **НЕ трогать** (остаются как есть, §4.3): `.rt-clip-item` (сцеплён с активным состоянием, инлайн `:996`), `.rt-lb-nav` (мгновенный), `.rt-lb-live` (shared class + `!important`), `<a>`-цвет-ховеры навлинки/отзывы/соц (конфликт с глобальным `a{}`), стрелки ленты, кнопки стилей, шапка, `a{}`/`:focus-visible`
- [ ] браузерная сверка **с допусками**: карточка `.7s` scale (EASE_OUT) / `.35s` scrim+подпись; услуги/DotNav `.25s`; сверять И длительность, И кривую (ease); дети variant-propagation анимируются ВСЕ; RM корректно; консоль чистая

### Task 4: Фейд ролика «03» → `motion`
**Files:**
- Modify: `sections.jsx`

- [ ] заменить инлайн `transition:opacity .26s ease` (`:946`) на `motion.div` `animate={{opacity:fade?0:1}}` `transition={{duration:.26, ease:[0.25,0.1,0.25,1]}}` (CSS `ease` = cubic-bezier(.25,.1,.25,1); Motion-дефолт другой — задать явно для 1:1); снять старый инлайн-`transition` с элемента
- [ ] браузерная сверка: смена ролика в «03» фейдит как раньше (`~.26s`)

### Task 5: Модалки → `AnimatePresence` (новая анимация)
**Files:**
- Modify: `sections.jsx`

- [ ] `WorkLightbox` (`:376`): реструктуризация — вместо `if(!open) return null` рендерить `<AnimatePresence>{open && <motion overlay/panel …/>}</AnimatePresence>`; вход/выход (opacity + scale/y), panel ease `EASE_OUT` (объявлен в Task 1), `duration=reduced?0:~.24`
- [ ] **Vaul `Drawer.Root`** (сейчас СИБЛИНГ overlay во `<Fragment>`, `:375–445`): разместить ВНЕ `AnimatePresence` как сиблинг (AP хочет один motion-ребёнок), либо вложить в поддерево overlay-`motion.div`. Беречь `w[1]` в `Drawer.Title` (при закрытом лайтбоксе `w=null`, но `videoOpen` только при open — безопасно)
- [ ] `BookingModal` (`:1324`): то же (у него тоже `body.overflow`-лок `:1276` и `return null` `:1322`)
- [ ] сохранить фокус/Esc/скролл-лок; сброс `body.overflow` привязать к `onExitComplete` (иначе скролл разлочится в начале выхода)
- [ ] браузерная сверка: вход/выход отыгрывается, RM=мгновенно, фокус/Esc целы, Vaul-лист работает; **после закрытия overlay размонтирован полностью** (нет слоя, перехватывающего клики; `body.overflow` восстановлен)

### Task 6: Фаза 2 — PR + Merge-gate
**Files:**
- Modify: (сборка/PR)

- [ ] коммит + `gh pr create` → master (мерж — squash-кнопкой; репо squash-only); в PR — способ отката (кнопка «Revert» на PR / `git revert <squash-sha>`, SHA после мержа)
- [ ] спец-проверки Фазы 2 (в дополнение к общему §10): ховеры с таймингами (Task 3), фейд «03», **модалки + мобильный прогон** (вход/выход, scroll-lock, жест Vaul, фокус/Esc — тач-хрупкое); REC/эквалайзер НЕ трогали — живы
- [ ] пройти **Merge-gate** (см. блок выше)

### Task 7: Лента — подготовка RM/`const motion` (§5.4/§5.6)
**Files:**
- Modify: `sections.jsx`

- [ ] завести ветку `motion-phase3-carousel` — **от master со смердженной И прод-сверенной Фазой 2** (до правок)
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
- [ ] **НЕ трогать (§5.5): pointer/wheel-обработчики и паузу-на-ховере (`:729` `S.current.paused`)** — это ввод, остаётся нативным
- [ ] НЕ оборачивать колбэк в `useCallback([])`, НЕ прятать в `useEffect([])` (сохранить живой RM)
- [ ] браузерная сверка (§10 лента): автоскролл `34±2 px/s`, пик слот-машины `5000±200 px/s`, «Готика» без двойника + **ведение подписи-стиля** + **после перестановки и короткого автоскролла у плиток на/у экрана нет висящего `data-src`** (гард-рейл `tick`/sweep — нет пустых прямоугольников); **пауза при наведении на ленту**; драг/wheel/инерция; клавиатурный `glideIntoView`; живое переключение RM

### Task 9: Фаза 3 — PR + Merge-gate
**Files:**
- Modify: (сборка/PR)

- [ ] коммит + `gh pr create` → master (мерж — squash-кнопкой; репо squash-only); в PR — способ отката (кнопка «Revert» на PR / `git revert <squash-sha>`, SHA после мержа)
- [ ] спец-проверки Фазы 3: полный §10 лента (десктоп + мобильный тач-драг), замеры скоростей, гард-рейлы (sweep/пустые прямоугольники, пауза-на-ховере, живой RM)
- [ ] пройти **Merge-gate** (см. блок выше) — с усиленным preview-гейтом владельца (самый рисковый diff)

### Task 10: Финальная сквозная проверка (все фазы вместе)
- [ ] сквозной прогон §10 на проде после всех трёх фаз: reveal, ховеры (тайминги), фейд, модалки (+RM), лента (замеры)
- [ ] reduced-motion чек-лист конечных состояний во всех блоках сразу
- [ ] (пофазная прод-сверка, мобайл и откат — уже в Merge-gate каждой фазы)

### Task 11: [Финал] Документация и завершение
- [ ] обновить `docs/animation-motion-migration.md` при отклонениях реализации от дизайна
- [ ] обновить `CLAUDE.md`: новые паттерны (напр. `useReveal`) + **сверить секцию деплоя** (сейчас описывает Babel-в-браузере/`_ds_bundle.js`/`.nojekyll` — устарело под Vite; откат-инструкции должны быть верны)
- [ ] синхронизировать §8.6/§10/§4.4 дизайн-доки с финальными правками (уже частично сделано)
- [ ] обновить Serena-память `mem:session_state_2026_07_20` (через инструменты Serena, не руками)
- [ ] переместить этот план в `docs/plans/completed/`

## Post-Completion
*Требует внешнего действия — без чекбоксов, информационно*

**Мерж и прод:**
- Мерж каждого PR = выкат на прод (ratedtattoo.ru) — действие/подтверждение владельца. Preview-гейт «владелец подтвердил» — на ВСЕ фазы (см. Merge-gate).
- Прод-сверка после КАЖДОГО мержа (ждать зелёного деплой-рана + сверять хэш бандла). Откат — кнопка «Revert» на PR (репо squash-only) → пересборка+деплой (не мгновенно, очередь) → своя прод-сверка.

**Чистка:**
- Удалить смерженные ветки (`motion-phase1-reveal`, `motion-phase2-hover-modals`, `motion-phase3-carousel`), а также ранее смерженные `build-vite`, `works-video-lightbox`.

**Ручная проверка:**
- Мобильные жесты (тач-драг ленты, passive-listeners) на реальных устройствах.
- Перф-наблюдение после Фазы 3 (лента на среднем устройстве) — если просядет, вариант (b)/откат драйвера известен.
