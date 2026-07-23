/* Rated Tattoo — Landing UI kit sections (editorial / single-screen redesign)
   Full-viewport scroll-snap panels, entrance reveals, photo marquee works
   showcase, film grain. Composes design-system primitives from the bundle. */

import React from "react";
import { Drawer } from "vaul";
import { AnimatePresence, motion, useAnimationFrame } from "motion/react";

const NS = window.RatedTattooDesignSystem_04b525;
const { Button, StarRating, Input, Accordion } = NS;

const LOGO = "./assets/logos/rated-logo-white.png";
const MAXW = "1240px";

/* = var(--ease-out) из tokens/spacing.css. Регистр ОТКЛИКА: ховеры и
   служебные переходы, где резкость уместна. */
const EASE_OUT = [0.22, 1, 0.36, 1];

/* = var(--ease-heavy). Регистр СОБЫТИЯ: вход секций и лайтбокс работы.
   EASE_OUT сюда не годится — она отдаёт 43% пути за первые 18 мс (замерено
   на входе модалки), поэтому читается как подстановка, а не как движение,
   при любой длительности. Эта распределена ровнее, движение видно. */
const EASE_HEAVY = [0.33, 1, 0.68, 1];

/* = CSS-ключевое слово `ease` (cubic-bezier(0.25,0.1,0.25,1)). У Motion
   дефолтная кривая другая, поэтому там, где мы заменяем прежний
   `transition: … .25s` без явной кривой, ease задаём руками — иначе не 1:1. */
const EASE_CSS = [0.25, 0.1, 0.25, 1];

/* Цвета ховеров, переведённых на Motion: покадровая интерполяция не понимает
   var(), поэтому токены резолвим в конкретные значения (public/tokens/colors.css). */
const C_ACCENT = "#9b1d30";     /* --accent  = --ox-500  */
const C_FAINT = "#5f5d57";      /* --text-faint = --gray-500 */
const C_MUTED = "#88857d";      /* --text-muted = --gray-400 */
const C_BONE = "#ece7df";       /* --bone */

/* Живой prefers-reduced-motion. Не `useReducedMotion()` из motion/react:
   в Motion 12 он читает значение один раз (`useState` без сеттера, в
   исходнике на этом месте TODO), а прежний CSS-media-query реагировал на
   переключение сразу — своя подписка возвращает это поведение. */
const rmMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
const subscribeRM = (cb) => {
  rmMedia.addEventListener("change", cb);
  return () => rmMedia.removeEventListener("change", cb);
};
const getRM = () => rmMedia.matches;

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(subscribeRM, getRM);
}

/* Скролл-лок — один на обе модалки. Лайтбокс не запирает фокус: с него можно
   уйти табом на «Записаться на сеанс» и открыть запись поверх. Пока владельцы
   были независимы, закрытие верхней модалки снимало лок, поставленный нижней,
   и страница ехала под ещё открытым лайтбоксом. */
const scrollLockOwners = new Set();
const setScrollLock = (id, on) => {
  if (on) scrollLockOwners.add(id);
  else scrollLockOwners.delete(id);
  document.body.style.overflow = scrollLockOwners.size ? "hidden" : "";
};

/* Клавиши document-уровня принадлежат ВЕРХНЕЙ модалке. Запись рисуется выше
   лайтбокса всегда (тот же zIndex 100, но позже в дереве App), поэтому пока
   она открыта — Esc и ←/→ её: без этого один Esc схлопывал обе модалки, а
   ←/→ на кнопке формы листали ленту под ней.
   Флаг модульный, а не проп: читается прямо в обработчике лайтбокса, так что
   открытие записи не тянет лишний рендер тяжёлого Works (198 плиток).
   Гейт по `e.target` был бы дырявым: клик по фону формы уводит фокус на body,
   и событие тогда не принадлежит ни одному её элементу — а закрыть надо всё
   равно запись. Порядок безопасен в обе стороны: слушатели document идут в
   порядке навешивания, а флаг гасит useEffect уже ПОСЛЕ диспатча события,
   поэтому тот же Esc не достаётся второй модалке ни при каком порядке
   открытия. Снимаем флаг на закрытии, а НЕ в onExitComplete (в отличие от
   лока скролла): следующий Esc в ~0.24s окне выхода должен закрывать
   лайтбокс, как и до фикса. */
let bookingOnTop = false;
const setBookingOnTop = (on) => { bookingOnTop = on; };

/* Вход/выход модалок — ДОБАВЛЕННАЯ анимация: раньше обе модалки монтировались
   мгновенно (`if(!open) return null`). При prefers-reduced-motion длительности
   нули, то есть прежнее мгновенное появление и есть RM-поведение. */
/* `event: true` — регистр СОБЫТИЯ (лайтбокс работы: экспонат выходит на
   крупный план). По умолчанию регистр ОТКЛИКА — служебное окно записи.
   Разводить их нужно: одинаковая анимация у обоих уравнивала показ работы
   с формой заявки, а под выбранную интонацию это разные по весу события. */
function useModalMotion({ event = false } = {}) {
  const reduced = usePrefersReducedMotion();
  return {
    overlay: {
      /* initial:false при RM — иначе первый кадр рисуется прозрачным (нулевая
         длительность гасит анимацию, но не стартовое состояние), и вместо
         прежнего мгновенного появления получается проблеск в ~8 мс. */
      initial: reduced ? false : { opacity: 0 },
      /* pointerEvents — не косметика: до `AnimatePresence` оверлей исчезал в тот
         же кадр (`if(!open) return null`), а теперь висит в DOM все ~0.2 s выхода
         и всё это время ловит клики (стрелки внутри успели бы открыть лайтбокс
         заново). Значение неанимируемое — Motion выставляет его сразу. */
      animate: { opacity: 1, pointerEvents: "auto" },
      exit: { opacity: 0, pointerEvents: "none" },
      transition: { duration: reduced ? 0 : (event ? 0.35 : 0.2), ease: EASE_CSS },
    },
    /* Амплитуда поднята с scale 0.96 / y 8: прежняя была за гранью различимости
       (замер входа: 43% пути за 18 мс на EASE_OUT — глаз видел подстановку). */
    panel: {
      initial: reduced ? false : { opacity: 0, scale: event ? 0.94 : 0.96, y: event ? 14 : 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.98, y: 6 },
      transition: { duration: reduced ? 0 : (event ? 0.5 : 0.3), ease: EASE_HEAVY },
    },
    /* Панель БЕЗ масштаба — для ряда с картинкой, когда та растёт из плитки
       (FLIP): свой scale панели наложился бы на FLIP-трансформ картинки. */
    panelFlat: {
      initial: reduced ? false : { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0, scale: 0.98, y: 6 },
      transition: { duration: reduced ? 0 : 0.5, ease: EASE_HEAVY },
    },
    /* Кнопка «Смотреть вживую» — единственная анимация лайтбокса, доставшаяся
       от прежнего кода мимо RM-гейта; заводим её сюда, чтобы гейт был один. */
    live: {
      initial: reduced ? false : { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.12, ease: EASE_OUT },
    },
  };
}

/* Входное раскрытие секции: пропсы для motion.<tag> (без обёртки — layout
   не меняется). amount 0.15 = прежний IO threshold, once — как прежний
   unobserve. При prefers-reduced-motion старта нет и длительность 0:
   элемент просто оказывается в конечном состоянии.
   Вызывать ТОЛЬКО в начале компонента (`const reveal = useReveal()`), а не
   внутри JSX: это хук, и условный элемент со спредом сломал бы порядок хуков —
   линтера с rules-of-hooks в репозитории нет. */
/* y уменьшен с 46 до 24 и добавлен масштаб: большое смещение читается как
   «прилетело», малое смещение с масштабом — как «проявилось на месте». Это и
   есть разница между дефолтным входом и весомым. */
function useReveal(delay = 0) {
  const reduced = usePrefersReducedMotion();
  return {
    initial: reduced ? false : { opacity: 0, y: 24, scale: 0.98 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduced ? 0 : 1, delay: reduced ? 0 : delay, ease: EASE_HEAVY },
  };
}

/* Ступенчатый вход: обёртка ведёт, дети входят по очереди. Motion протягивает
   имена вариантов вниз сам — тот же приём, что у трёх ховеров.
   Дети ОБЯЗАНЫ быть `motion.*` со спредом `child`: обычный `div` вариант не
   получит, просто останется в конечном состоянии и не анимируется вовсе —
   молча, без ошибки. Длительность лежит в варианте ребёнка, а не в transition
   обёртки: та отвечает только за задержку между детьми. */
function useRevealGroup(stagger = 0.1) {
  const reduced = usePrefersReducedMotion();
  return {
    group: {
      initial: reduced ? false : "hidden",
      whileInView: "shown",
      viewport: { once: true, amount: 0.15 },
      transition: { staggerChildren: reduced ? 0 : stagger },
      variants: { hidden: {}, shown: {} },
    },
    child: {
      variants: {
        hidden: reduced ? {} : { opacity: 0, y: 24, scale: 0.98 },
        shown: { opacity: 1, y: 0, scale: 1, transition: { duration: reduced ? 0 : 1, ease: EASE_HEAVY } },
      },
    },
  };
}

/* Обвязка первого экрана. Заголовок и фоновое видео в ней НЕ участвуют: h1 —
   LCP-элемент, и анимация прозрачности на нём сдвинула бы метрику на всю свою
   длительность. Всё остальное входит ступенькой сразу после первой отрисовки —
   поэтому `animate`, а не `whileInView`: элементы и так в кадре, ждать нечего.
   Хук возвращает функцию: порядковый номер задаёт задержку. */
function useHeroEntry() {
  const reduced = usePrefersReducedMotion();
  return (i) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.12 * i, ease: EASE_HEAVY },
  });
}

/* [путь, название, стиль, пропорция кадра ш/в]
   Пропорция снята с исходников — плитки в ленте строятся по ней, чтобы
   работы не обрезались под общий бокс. */
const WORKS = [
  ["./assets/img/work-wolf.jpg", "Реалистичный волк", "реализм", 0.706],
  ["./assets/img/work-angel-sleeve.jpg", "Ангел · рукав", "реализм", 0.869],
  ["./assets/img/work-geisha.jpg", "Гейша", "ориентал", 0.644],
  ["./assets/img/work-mandala.jpg", "Геометрический орнамент", "орнамент", 0.664],
  ["./assets/img/work-oni-mask.jpg", "Маска", "ориентал", 0.547],
  ["./assets/img/work-gaze.jpg", "Взгляд", "чикано", 0.989],
  ["./assets/img/work-warrior.jpg", "Северный воин", "реализм", 0.750],
  ["./assets/img/work-rat.jpg", "Уголовное дело", "нео-традишн", 0.750],
  ["./assets/img/work-catrina.jpg", "Катрина", "чикано", 0.750],
  ["./assets/img/work-bear-realism.webp", "Гризли", "реализм", 0.750, "vplv63sw637q4xgtjwjc"],
  ["./assets/img/work-hourglass.jpg", "Песочные часы", "трэш-полька", 0.562],
  ["./assets/img/work-samurai.jpg", "Самурай", "ориентал", 0.799],
  ["./assets/img/work-girl-rose.jpg", "Девушка с розой", "реализм", 0.750],
  ["./assets/img/work-sphinx.webp", "Анубис", "ориентал", 0.715],
  ["./assets/img/work-robber.jpg", "Налётчик", "реализм", 0.592],
  ["./assets/img/work-sphynx-cat.jpg", "Кот сфинкс", "реализм", 0.664],
  ["./assets/img/work-tiger-sleeve.jpg", "Тигриный рукав", "реализм", 0.712],
  ["./assets/img/work-clown.jpg", "Клоун", "хоррор", 0.924, "vplvuapkkbbpheyzvrbw"],
  ["./assets/img/work-chief.jpg", "Вождь", "реализм", 0.776],
  ["./assets/img/work-bear-graphic.jpg", "Графический медведь", "графика", 0.722],
  ["./assets/img/work-portrait-peony.jpg", "Анна", "чикано", 0.562],
  ["./assets/img/work-eagle-clock.jpg", "Орёл и время", "реализм", 0.750],
  ["./assets/img/work-eye.jpg", "Реалистичный глаз", "реализм", 0.750],
  ["./assets/img/work-lips.webp", "Перманентный татуаж", "татуаж", 1.810],
  ["./assets/img/work-samurai-armor.webp", "Самурай в доспехах", "реализм", 0.8],
  ["./assets/img/work-chief-feathers.webp", "Вождь в уборе", "реализм", 0.776],
  ["./assets/img/work-peonies-hip.webp", "Пионы", "графика", 0.671],
  ["./assets/img/work-dynamite.webp", "Динамит", "нео-традишн", 0.692],
  ["./assets/img/work-mandala-sternum.webp", "Мандала под грудью", "орнамент", 1.385],
  ["./assets/img/work-girl-city.webp", "Вампирша", "Готика", 0.625, "vplvhsvigv4bgohwi45v"],
  ["./assets/img/work-girl-revolver.webp", "Берета", "чикано", 0.694],
  ["./assets/img/work-samurai-sakura.webp", "Самурай и сакура", "ориентал", 0.664],
  ["./assets/img/work-antique-statue.webp", "Античная статуя", "реализм", 0.715],
  ["./assets/img/work-mountain-geometry.webp", "Гора и геометрия", "графика", 0.664],
  ["./assets/img/work-peony-pattern.webp", "Пионовый узор", "графика", 0.664],
  ["./assets/img/work-lizard.webp", "Ящерица", "графика", 0.696],
  ["./assets/img/work-elephant.webp", "Слон", "графика", 1.505],
  ["./assets/img/work-wolf-girl.webp", "Девушка — Волчица", "реализм", 0.671, "vplv4i6vmqnttvts7epq"],
  ["./assets/img/work-gorillas.webp", "Гориллы", "реализм", 0.97],
  ["./assets/img/work-girl-lilies.webp", "Девушка с лилиями", "реализм", 0.644],
  ["./assets/img/work-snake-color.webp", "Питон", "нео-традишн", 0.75, "vplvrja4qp3ps3fonejk"],
  ["./assets/img/work-bear-roar.webp", "Медведь", "реализм", 0.75],
  ["./assets/img/work-jester.webp", "Смерть", "нео-традишн", 0.827],
  ["./assets/img/work-centurion.webp", "Центурион", "реализм", 0.601],
  ["./assets/img/work-anubis-graphic.webp", "Инпу", "графика", 0.75],
  ["./assets/img/work-scorpion.webp", "Скорпион", "графика", 0.75],
  ["./assets/img/work-girl-roses.webp", "Химена", "чикано", 0.75],
  ["./assets/img/work-tiger-lotus.webp", "Тигр и лотос", "ориентал", 0.681],
  ["./assets/img/work-anubis-mech.webp", "Анубис и Ра", "ориентал", 0.684],
  ["./assets/img/work-harley.webp", "Харли — Джокер", "нео-традишн", 0.75, "vplvhsuvqkpjpl65bay7"],
  ["./assets/img/work-hourglass-skull.webp", "Часы и череп", "нео-традишн", 0.671],
  ["./assets/img/work-fox-cat.webp", "Лиса и кошка", "нео-традишн", 0.692],
  ["./assets/img/work-bird-peach.webp", "Птичка с персиками", "нео-традишн", 0.545, "vplvql3ud6lpffedk4lj"],
  ["./assets/img/work-matryoshka-gzhel.webp", "Матрёшка «Свои»", "нео-традишн", 0.818],
  ["./assets/img/work-deer-compass.webp", "Вендиго", "ориентал", 0.75],
  ["./assets/img/work-portrait-rose.webp", "Портрет с розой", "реализм", 1.005],
  ["./assets/img/work-koi-set.webp", "Карпы кои", "ориентал", 1.691],
  ["./assets/img/work-girl-blue-hair.webp", "Девушка с синими волосами", "чикано", 0.691],
  ["./assets/img/work-grizzly.webp", "Волчий оскал", "реализм", 0.819],
  ["./assets/img/work-fire-sleeve.webp", "Феникс", "ориентал", 1.114],
  ["./assets/img/work-skulls-roses.webp", "Череп и розы", "Готика", 1.108],
  ["./assets/img/work-warrior-wolf.webp", "Берсерк", "ориентал", 0.75],
  ["./assets/img/work-paws-lettering.webp", "Лапы и надпись", "графика", 1.333],
  ["./assets/img/work-koi-lotus.webp", "Кои и лотос", "ориентал", 0.722],
  ["./assets/img/work-crowned-skulls.webp", "Коронованные черепа", "реализм", 1.0],
  ["./assets/img/work-samurai-mask.webp", "Самурай в маске", "реализм", 0.705],
  ["./assets/img/work-feet-ornament.webp", "Орнамент на стопах", "орнамент", 1.0],
  ["./assets/img/work-dark-portrait.webp", "Тёмный демон", "реализм", 0.799],
  ["./assets/img/work-lion-egypt.webp", "Лев", "графика", 0.722],
  ["./assets/img/work-raccoon.webp", "Енот", "нео-традишн", 0.722],
  ["./assets/img/work-bear-shadow.webp", "Кинг Конг", "реализм", 0.585],
  ["./assets/img/work-via-the-end.webp", "Via the End", "биомеханика", 0.586, "vplvgq57pvyskz2gs2bb"],
  ["./assets/img/work-japan-landscape.webp", "Японский пейзаж", "ориентал", 0.505],
  ["./assets/img/work-roses-color.webp", "Розы", "реализм", 0.676],
  ["./assets/img/work-armor.webp", "Доспехи", "реализм", 0.739],
  ["./assets/img/work-lion-crown.webp", "Лев в короне", "реализм", 0.695],
  ["./assets/img/work-warrior-statue.webp", "Ассасин", "реализм", 0.783],
  ["./assets/img/work-geisha-smoke.webp", "Батори", "Готика", 0.724],
  ["./assets/img/work-gunslinger.webp", "Стрелок", "реализм", 0.729],
  ["./assets/img/work-cat-geometry.webp", "Кот-геометрия", "графика", 0.722],
  ["./assets/img/work-roses-bird.webp", "Розы и птица", "реализм", 1.415],
  ["./assets/img/work-matryoshka-color.webp", "Матрёшка в цветах", "нео-традишн", 0.714],
  ["./assets/img/work-buddha.webp", "Будда", "ориентал", 0.707],
  ["./assets/img/work-portrait-flowers.webp", "Эсперанса", "чикано", 0.666],
  ["./assets/img/work-vampiress.webp", "Лилит", "Готика", 0.714],
  ["./assets/img/work-girl-roses-2.webp", "Девушка и розы", "реализм", 0.664],
  ["./assets/img/work-viking.webp", "Викинг", "реализм", 0.857],
  ["./assets/img/work-crying-girl.webp", "Плачущая", "реализм", 0.667],
  ["./assets/img/work-music-soul.webp", "Music of my soul", "трэш-полька", 1.154],
  ["./assets/img/work-snake-roses.webp", "Змея и розы", "графика", 0.669],
  ["./assets/img/work-capricorn.webp", "Козерог", "ориентал", 1.025],
  ["./assets/img/work-fox-trash.webp", "Лиса", "трэш-полька", 0.722],
  ["./assets/img/work-dreamcatcher.webp", "Ловец снов", "орнамент", 0.707],
  ["./assets/img/work-girl-ornament.webp", "Девушка в орнаменте", "реализм", 0.722],
  ["./assets/img/work-wolf-flag.webp", "Волк и флаг", "графика", 0.722],
  ["./assets/img/work-sculptor.webp", "Скульптор", "реализм", 0.722],
  ["./assets/img/work-mandala-underbust.webp", "Мандала", "орнамент", 1.385],
  ["./assets/img/work-lotus.webp", "Лотос", "графика", 0.722],
  ["./assets/img/work-biomech-sleeve.webp", "Биомеханика · рукав", "биомеханика", 0.75],
];

/* Стили в порядке первого появления — служат индексом ленты. */
const WORK_STYLES = WORKS.map((w) => w[2]).filter((s, i, a) => a.indexOf(s) === i);

/* Высота плитки одна на всю ленту; ширина — производная от пропорции.
   Крайние пропорции подрезаем, чтобы одна работа не заняла весь экран. */
const TILE_H = "clamp(320px, 38vw, 480px)";
const tileRatio = (r) => Math.min(1.35, Math.max(0.52, r));
/* Порог, за которым нажатие считается протяжкой, а не кликом по работе. */
const DRAG_SLOP = 8;

/* Смена стиля: набор уезжает ВНИЗ за кадр, порядок меняется в пустом кадре,
   новый набор опускается сверху на своё место.

   Почему вниз, а не вбок: лента бесшовная и бесконечная, увести её за кадр по
   горизонтали нельзя — сдвиг влево просто показывает следующие плитки. По
   вертикали кадр пустеет за один рост плитки.

   Что это заменило. Раньше был разгон до пика, подмена на скорости и
   торможение к цели — «слот-машина». У неё два врождённых дефекта, оба
   держались на высокой скорости: перед торможением лента телепортировалась на
   длину тормозного пути (скачок ~1300 px, невидимый только в смазе), а коммит
   198 плиток (~50 мс) приходился на самое быстрое движение и читался
   подвисанием. Здесь обоих нет: коммит идёт в пустом кадре, а позиция
   выставляется сразу конечной, пока лента невидима. Прятать нечего, поэтому
   и маскирующий смаз больше не нужен. */
const SWAP_OUT = 0.3;      /* с — уход вниз, с разгоном */
const SWAP_IN = 0.45;      /* с — приход сверху, с торможением */

/* Скорость холостого хода ленты. Была 34 px/s — темп бегущей строки, который
   задавал ритм всему сайту и спорил с редким весомым движением. 11 px/s
   читается как дыхание: движение есть, взгляд оно не тянет. */
const DRIFT_VMAX = 11;     /* px/s */

/* Затухание инерции после протяжки: vel *= INERTIA_K^dt. Меньше — дольше
   выбег. 0.06 давало ~53 кадра, 0.035 даёт ~90: ленту толкнули, и она едет,
   а не встаёт — у неё появляется масса. */
const INERTIA_K = 0.035;

/* ---------------------------------------------------------------- helpers */
function Kicker({ index, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
      <span style={{ color: "var(--accent)" }}>{index}</span>
      <span style={{ width: "28px", height: "1px", background: color === "dark" ? "rgba(10,10,12,.25)" : "var(--border-hair)" }}></span>
      <span style={{ color: color === "dark" ? "rgba(10,10,12,.6)" : "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

/* ----------------------------------------------------------------- Header */
function Header({ onBook }) {
  const [solid, setSolid] = React.useState(false);
  React.useEffect(() => {
    const sc = document.querySelector(".rt-scroll") || window;
    const onScroll = () => setSolid((sc.scrollTop || window.scrollY) > 40);
    sc.addEventListener("scroll", onScroll);
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["#about", "Мастер"], ["#works", "Работы"], ["#process", "Вживую"], ["#benefits", "Преимущества"], ["#faq", "Вопросы"]];
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: solid ? "rgba(10,10,12,0.82)" : "transparent",
      backdropFilter: solid ? "blur(14px)" : "none",
      borderBottom: solid ? "1px solid var(--border-hair)" : "1px solid transparent",
      transition: "background .35s ease, border-color .35s ease",
    }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={LOGO} alt="Rated Tattoo" style={{ height: "38px", width: "auto" }} />
          <span style={{ fontFamily: "var(--font-logo)", color: "var(--bone)", fontSize: "20px", letterSpacing: "0.16em" }}>RATED</span>
        </a>
        <nav style={{ display: "flex", gap: "36px" }} className="rt-nav">
          {links.map(([href, label]) => (
            <a key={href} href={href} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-body)", transition: "color .2s" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bone)")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}>{label}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <a href="tel:+79689752099" className="rt-phone" style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--bone)", letterSpacing: "0.02em" }}>+7 (968) 975-20-99</a>
          <Button size="sm" variant="outline" onClick={onBook}>Записаться</Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------- Hero */
function Hero({ onBook }) {
  const entry = useHeroEntry();
  const reduced = usePrefersReducedMotion();
  return (
    <section id="hero" className="rt-snap" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <video autoPlay muted loop playsInline poster="./assets/img/work-wolf.jpg"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "grayscale(0.6) contrast(1.08) brightness(0.8)" }}>
          <source src="./assets/video/hero.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "var(--scrim-hero)" }}></div>
      </div>

      {/* «Проявление из темноты»: занавес поверх видео гаснет за ~0.9с. Само
          видео при этом НЕ анимируется — оно рисуется сразу на полной
          непрозрачности, поэтому LCP не сдвигается (в отличие от фейда самого
          видео). Заодно движение видео на старте прикрыто чернотой и не
          перебивает более тонкие reveal'ы секций. zIndex 0, но в DOM после
          фонового слоя → красится над видео/скримом и под контентом (zIndex 1).
          Под reduced-motion занавес не играем: initial:false рисует его сразу
          прозрачным, без вспышки черноты. */}
      <motion.div aria-hidden="true"
        initial={reduced ? false : { opacity: 1 }} animate={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: EASE_HEAVY }}
        style={{ position: "absolute", inset: 0, zIndex: 0, background: "#0a0a0c", pointerEvents: "none" }} />

      {/* Боковая метка входит последней: она периферийная, и ведущей роли
          в первом кадре у неё нет. `transform` тут несёт раскладку (поворот),
          поэтому анимируем только opacity — иначе Motion перезапишет rotate. */}
      <motion.div className="rt-edge-label"
        initial={entry(3).initial ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={entry(3).transition}
        style={{ position: "absolute", left: "32px", top: "50%", transform: "rotate(180deg)", writingMode: "vertical-rl", zIndex: 2, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        Rated Tattoo · Moscow · с 2015
      </motion.div>

      {/* carve-out: первый экран (LCP) виден сразу, без входной анимации */}
      <div style={{ position: "relative", zIndex: 1, flex: "1 1 auto", width: "100%", maxWidth: MAXW, margin: "0 auto", padding: "150px 32px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <motion.div {...entry(0)} style={{ marginBottom: "26px" }}><Kicker index="ТОП-10" label="Тату-мастеров Москвы 2023" /></motion.div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(46px, 7vw, 104px)", lineHeight: 0.9, letterSpacing: "-0.01em", margin: 0 }}>
          Элитные<br />татуировки<span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <motion.div {...entry(1)} style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "20px" }}>
          — от мастера Тимура Тэда
        </motion.div>
        <motion.div {...entry(2)} style={{ display: "flex", flexWrap: "wrap", gap: "36px", alignItems: "flex-end", justifyContent: "space-between", marginTop: "36px" }}>
          <p style={{ fontSize: "var(--fs-lead)", color: "var(--gray-200)", maxWidth: "42ch", lineHeight: 1.55, margin: 0 }}>
            Авторские татуировки в центре Москвы. Реализм, графика, орнаменты — каждая работа создаётся лично под клиента.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" onClick={onBook} iconRight="fas fa-arrow-right">Записаться</Button>
            <Button as="a" href="#works" variant="glass" size="lg">Работы</Button>
          </div>
        </motion.div>
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: "0 0 auto", borderTop: "1px solid var(--border-hair)", background: "rgba(10,10,12,0.4)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="rt-stats">
          {[["10+", "лет практики"], ["150+", "работ в портфолио"], ["150+", "отзывов · 5.0"], ["100%", "стерильность"]].map(([n, l], i) => (
            <div key={l} style={{ padding: "20px 24px", borderLeft: i === 0 ? "none" : "1px solid var(--border-hair)", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 600, color: "var(--bone)", lineHeight: 1 }}>{n}</span>
              <span style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ About */
function About() {
  const { group, child } = useRevealGroup();
  const reasons = [
    ["Мировой уровень", "Участник международных тату-конвенций и лауреат премий. Постоянно совершенствую навыки."],
    ["Безопасность", "Только одноразовые материалы и стерилизация в автоклавах класса B."],
    ["Индивидуальный подход", "Каждый эскиз создаю лично, учитывая ваши пожелания и особенности тела."],
  ];
  return (
    <section id="about" className="rt-snap" style={{ position: "relative", background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 0", overflow: "hidden" }}>
      {/* atmospheric oversize wordmark */}
      <div aria-hidden="true" style={{ position: "absolute", right: "-2.5%", top: "6%", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(140px, 23vw, 360px)", lineHeight: 0.8, color: "var(--bone)", opacity: 0.028, textTransform: "uppercase", letterSpacing: "-0.03em", pointerEvents: "none", userSelect: "none" }}>Тэд</div>

      <motion.div {...group} className="rt-about-grid" style={{ position: "relative", maxWidth: MAXW, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "0.94fr 1.06fr", gap: "72px", alignItems: "center", width: "100%" }}>
        {/* ----- portrait ----- */}
        {/* Портрет ведёт: у секции о мастере он и есть главное, текст следом. */}
        <motion.div {...child} className="rt-about-media" style={{ position: "relative" }}>
          <div className="rt-edge-label" style={{ position: "absolute", left: "-30px", top: "50%", transform: "translateY(-50%) rotate(180deg)", writingMode: "vertical-rl", zIndex: 2, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--text-faint)" }}>
            Tattoo master · с 2015
          </div>
          {/* Фон у фото вырезан (webp с альфой) — мастер стоит прямо на фоне
              секции, без прямоугольной подложки. Потому ни overflow, ни cover. */}
          <div style={{ position: "relative" }}>
            {/* Растворяем прямые кромки в фоне секции: низ (подлокотник) и левый
                край (коробка) упираются в край кадра прямым резом. Две маски,
                пересечение — гаснет там, где гасит любая. Контур головы и плеч
                уже вырезан в самом webp, его маски не трогают. */}
            <img src="./assets/img/about-master-work.webp" alt="Тимур Тэд за работой — Rated Tattoo" style={{ width: "100%", height: "auto", display: "block", filter: "grayscale(0.55) contrast(1.05) brightness(0.85)", WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 98%), linear-gradient(to right, transparent 1%, #000 13%)", maskImage: "linear-gradient(to bottom, #000 78%, transparent 98%), linear-gradient(to right, transparent 1%, #000 13%)", WebkitMaskComposite: "source-in", maskComposite: "intersect" }} />
          </div>
        </motion.div>

        {/* ----- profile copy ----- */}
        <motion.div {...child}>
          <Kicker index="01" label="О мастере" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 0.96, letterSpacing: "-0.01em", margin: "24px 0 0" }}>
            Эталон<br />качества<span style={{ color: "var(--accent)" }}>.</span>
          </h2>
          <p style={{ fontSize: "var(--fs-lead)", color: "var(--text-body)", lineHeight: 1.6, margin: "22px 0 0", maxWidth: "50ch" }}>
            Я создаю не просто татуировки, а произведения искусства, которые будут радовать вас всю жизнь. Реализм, графика и орнаменты — авторский подход к каждому эскизу.
          </p>
          <div style={{ display: "flex", margin: "32px 0 8px", borderTop: "1px solid var(--border-hair)", borderBottom: "1px solid var(--border-hair)" }}>
            {[["10+", "лет практики"], ["ТОП-10", "Москвы 2023"], ["∞", "гарантия"]].map(([n, l], i) => (
              <div key={l} style={{ flex: 1, padding: "18px 0", paddingLeft: i === 0 ? 0 : "24px", borderLeft: i === 0 ? "none" : "1px solid var(--border-hair)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "29px", fontWeight: 600, color: "var(--bone)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "6px" }}>{l}</div>
              </div>
            ))}
          </div>
          <div>
            {reasons.map(([h, p], i) => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: "4px 18px", padding: "20px 0", borderBottom: "1px solid var(--border-hair)" }}>
                <span style={{ gridRow: "span 2", fontFamily: "var(--font-display)", color: "var(--accent)", fontSize: "18px", fontWeight: 600, paddingTop: "3px" }}>{String(i + 1).padStart(2, "0")}</span>
                <h4 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.02em", fontSize: "18px", fontWeight: 500, margin: 0 }}>{h}</h4>
                <p style={{ color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.55, fontSize: "14px" }}>{p}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------- Works (карусель) */
/* clone — второй проход ленты, нужный только для бесшовной прокрутки.
   Он скрыт от скринридера и выключен из таб-порядка, иначе каждая работа
   объявляется и обходится дважды.

   memo обязателен: в ленте 198 плиток, у каждой четыре motion-элемента, а
   кадровый цикл дёргает setStyle — без мемоизации каждая смена стиля в центре
   кадра прогоняла бы ~800 VisualElement'ов. Обработчики Works держит
   стабильными (useCallback), иначе memo не сработает.
   Пропа с индексом здесь НЕТ намеренно: при перестановке индекс менялся почти
   у всех плиток, memo падал на всех 198 и кадр подмены длился 77 мс. Работа
   передаётся сама — все пропы становятся стабильными по ссылке, и перестановка
   сводится к переносу узлов без единого ререндера. */
const WorkTile = React.memo(function WorkTile({ w, onOpen, onFocus, clone }) {
  return (
    <motion.button type="button" className="rt-work-tile"
      onClick={(e) => onOpen(w, e)} onFocus={() => onFocus(w)}
      initial="rest" animate="rest" whileHover="hover"
      aria-hidden={clone ? "true" : undefined} tabIndex={clone ? -1 : undefined}
      aria-label={w[1] + " — " + w[2] + ". Открыть крупно"}
      style={{ position: "relative", flexShrink: 0, height: TILE_H, width: "calc(" + TILE_H + " * " + tileRatio(w[3]) + ")", margin: "0 5px", overflow: "hidden", background: "var(--ink-800)", padding: 0, border: 0, display: "block", cursor: "pointer" }}>
      {/* src проставляет цикл ленты, когда плитка подходит к экрану — см. sweep().
          Штатный loading="lazy" здесь не работает: React вставляет плитки после
          отрисовки, и Chrome успевает счесть их близкими к экрану.
          Плитка обязана оставаться ПЕРВЫМ ребёнком кнопки — sweep() берёт её
          через firstElementChild. */}
      <motion.img data-src={w[0]} alt={w[1] + " — " + w[2]} draggable={false}
        variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none", pointerEvents: "none", filter: "grayscale(0.5) contrast(1.06)" }} />
      {/* Заливка держит читаемость подписи и на светлых кадрах — плашки под текстом нет. */}
      <motion.div variants={{ rest: { opacity: 0.82 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.35, ease: EASE_CSS }}
        style={{ position: "absolute", inset: 0, background: "var(--scrim-hover)" }}></motion.div>
      <motion.div variants={{ rest: { opacity: 0.9, y: 6 }, hover: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.35, ease: EASE_CSS }}
        style={{ position: "absolute", left: "16px", right: "16px", bottom: "16px", textAlign: "left" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent-soft)", marginBottom: "6px" }}>{w[2]}</div>
        <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "18px", fontWeight: 500, margin: 0 }}>{w[1]}</h3>
      </motion.div>
    </motion.button>
  );
});

/* Просмотр работы крупно: Esc — закрыть, ←/→ — соседние работы. */
/* fromRect — getBoundingClientRect нажатой плитки (или null): картинка лайтбокса
   вырастает из неё через ручной FLIP. Почему НЕ layoutId: тот не строит связку,
   когда источник вложен в motion-элемент (тайл — motion.button ради ховера), а у
   цели такого предка нет — деревья проекции асимметричны (подтверждено замером).
   FLIP этого ограничения не касается: он не связывает два элемента, а один раз
   сдвигает цель в прямоугольник источника и анимирует к нулю. */
function WorkLightbox({ index, works, onClose, onStep, fromRect }) {
  const closeRef = React.useRef(null);
  const closeBtnRef = React.useRef(null);        /* кнопка «Закрыть» в видео-листе */
  const anim = useModalMotion({ event: true });  /* показ работы — событие, не служебное окно */
  const imgRef = React.useRef(null);
  const reduced = usePrefersReducedMotion();
  const [videoOpen, setVideoOpen] = React.useState(false);
  const videoOpenRef = React.useRef(false);
  videoOpenRef.current = videoOpen;              /* всегда актуален на момент keydown */
  const escSuppressUntilRef = React.useRef(0);   /* окно подавления Esc после закрытия листа */
  const open = index >= 0;
  const openRef = React.useRef(open);
  openRef.current = open;                        /* всегда актуален на момент клика: гейт у «Смотреть вживую» */
  const w = open ? works[index] : null;
  /* 5-й элемент строки WORKS — id связанного ролика; сцену берём из CLIPS. */
  const clip = w && w[4] ? CLIPS.find((c) => c[0] === w[4]) : null;

  /* Лок скролла ставим при открытии, а СНИМАЕМ в onExitComplete: сними его на
     смене open — и страница поехала бы под ещё видимой панелью все ~0.24s
     выхода. Отдельный эффект-страховка возвращает скролл при размонтировании. */
  React.useEffect(() => {
    if (open) setScrollLock("lightbox", true);
  }, [open]);
  React.useEffect(() => () => setScrollLock("lightbox", false), []);

  /* FLIP-вход картинки из плитки. useLayoutEffect — до отрисовки: замеряем
     конечное (естественное) положение картинки и проигрываем её из
     прямоугольника плитки к нему.
     Через Web Animations API напрямую на элементе, НЕ через Motion-контроллер:
     контроллер подписывается в собственном эффекте, и `set()` из этого
     useLayoutEffect уходил бы раньше подписки — картинка появлялась на месте.
     WAA срабатывает сразу, а `fill:"both"` рисует первый кадр уже в плитке, без
     проблеска. Формула каноническая, от левого-верхнего угла (transformOrigin
     0 0): translate(Δ) scale(w0/w1) точно накладывает цель на источник.
     Только на открытии со связкой; шаг ←/→ её рвёт (fromRect → null), там
     обычное появление. Под reduced-motion FLIP не играем. */
  React.useLayoutEffect(() => {
    const el = imgRef.current;
    if (!open || !fromRect || reduced || !el) return;
    const t = el.getBoundingClientRect();
    if (!t.width || !t.height) return;
    const s = fromRect.width / t.width;
    const dx = fromRect.left - t.left;
    const dy = fromRect.top - t.top;
    const anim = el.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: "none" }],
      { duration: 500, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "both" }
    );
    return () => anim.cancel();
  }, [open, fromRect, reduced]);

  /* Смена работы или закрытие лайтбокса — гасим видео-лист. */
  React.useEffect(() => { setVideoOpen(false); }, [index]);

  /* Фокус на крестик при открытии. */
  React.useEffect(() => {
    if (open && closeRef.current) closeRef.current.focus();
  }, [open]);

  /* Esc/стрелки лайтбокса. Слушатель держим прикреплённым всё время, а гейтим
     ВНУТРИ по ref: когда лист открыт — Esc/стрелки принадлежат Vaul, лайтбокс
     их игнорит. Radix закрывает лист синхронно (flushSync) и тот же Esc успел
     бы долистать сюда, поэтому после закрытия листа ещё 400мс глушим Esc —
     иначе одно нажатие схлопнуло бы и лист, и лайтбокс. */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      /* Запись открывается ПОВЕРХ лайтбокса (фокус тот не запирает, см.
         scrollLockOwners) — пока она открыта, клавиши её, см. bookingOnTop. */
      if (videoOpenRef.current || bookingOnTop || Date.now() < escSuppressUntilRef.current) return;
      /* Второй рубеж, поверх bookingOnTop: событие из редактируемого поля
         принадлежит полю. Не мёртвый код — он держит окно ~0.24s выхода
         записи, когда флаг уже снят, а поля формы ещё в DOM и в фокусе: без
         него ←/→ в них получали бы preventDefault и листали ленту вместо
         движения каретки. */
      const t = e.target;
      if (t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") { e.preventDefault(); onStep(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onStep]);

  const nav = { width: "50px", height: "50px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,12,.55)", color: "var(--bone)", border: "1px solid var(--border-hair)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "15px", flexShrink: 0 };
  const arNum = clip ? clip[5] / clip[6] : 1;

  /* Компонент больше НЕ возвращает null при закрытом лайтбоксе: чтобы отыграть
     выход до размонтирования, условным должен быть ребёнок AnimatePresence. */
  return (
    <React.Fragment>
      <AnimatePresence onExitComplete={() => setScrollLock("lightbox", false)}>
        {open ? (
          <motion.div key="lightbox" role="dialog" aria-modal="true" aria-label={"Работа: " + w[1]} onClick={onClose} {...anim.overlay}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,5,6,.92)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px", padding: "20px" }}>
            <button ref={closeRef} type="button" aria-label="Закрыть просмотр" onClick={onClose}
              style={{ position: "absolute", top: "20px", right: "20px", width: "50px", height: "50px", background: "transparent", color: "var(--bone)", border: "1px solid var(--border-hair)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "16px" }}>
              <i className="fas fa-xmark" aria-hidden="true"></i>
            </button>

            {/* Панель — это два существующих ряда, а не новая обёртка: лишний
                flex-контейнер пришлось бы повторять центровкой, gap и maxWidth,
                а раскладка лайтбокса на мобильном — самое хрупкое место. */}
            {/* Со связкой ряд картинки идёт без масштаба (FLIP несёт картинку сам),
                иначе panel.scale наложился бы на FLIP-трансформ. */}
            <motion.div {...(fromRect ? anim.panelFlat : anim.panel)} onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 3vw, 28px)", maxWidth: "100%" }}>
              <button type="button" aria-label="Предыдущая работа" onClick={() => onStep(-1)} style={nav} className="rt-lb-nav">
                <i className="fas fa-arrow-left" aria-hidden="true"></i>
              </button>
              {/* Обычный img: FLIP-вход идёт через WAA на самом элементе (см.
                  useLayoutEffect), Motion тут только помешал бы, переписывая
                  transform. transformOrigin 0 0 — под каноническую формулу FLIP. */}
              <img ref={imgRef} src={w[0]} alt={w[1] + " — " + w[2]}
                style={{ maxHeight: "72vh", maxWidth: "min(1100px, 78vw)", objectFit: "contain", display: "block", border: "1px solid var(--border-hair)", transformOrigin: "0 0" }} />
              <button type="button" aria-label="Следующая работа" onClick={() => onStep(1)} style={nav} className="rt-lb-nav">
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </button>
            </motion.div>

            <motion.div {...anim.panel} onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-soft)", marginBottom: "8px" }}>{w[2]}</div>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 500, margin: 0, letterSpacing: "0.01em" }}>{w[1]}</h3>
              {/* Гейт по openRef у кнопки ниже — третий в паре к `pointerEvents:"none"`
                  (см. step и submit): мышь тот глушит, но выходящее поддерево живёт в
                  DOM ~0.24s, и Enter на сфокусированной кнопке всё это время даёт click.
                  Без гейта videoOpen залипал в true (эффект сброса по [index] уже
                  отработал) — и следующее открытие любой работы монтировало лист Vaul:
                  кадр выехавшей панели, увод фокуса и загрузка стороннего iframe. Читаем
                  ref, а не проп: поддерево заморожено и `open` в замыкании навсегда true. */}
              {clip ? (
                <motion.button type="button" onClick={() => { if (openRef.current) setVideoOpen(true); }} className="rt-lb-live" {...anim.live}
                  style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "9px", padding: "10px 20px", background: "transparent", color: "var(--bone)", border: "1px solid var(--accent)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  <i className="fas fa-play" aria-hidden="true" style={{ fontSize: "10px" }}></i>
                  Смотреть вживую
                </motion.button>
              ) : null}
              <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "0.14em", color: "var(--text-muted)", marginTop: "12px" }}>
                {index + 1} / {works.length}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Видео-лист (Vaul): выезжает снизу с нативным плеером связанного ролика.
          Открывается только у работ с парой; Radix даёт фокус-ловушку и Esc.
          Живёт СИБЛИНГОМ, вне AnimatePresence: у листа своя анимация, а AP
          ждёт один условный motion-ребёнок. Гейт по `w` — при закрытом
          лайтбоксе работы нет, а `w[1]` в заголовке читается при создании
          элемента (лист при этом закрыт: videoOpen гасится на смене index). */}
      {w ? (
      <Drawer.Root open={videoOpen} direction="bottom" autoFocus
        onOpenChange={(o) => { if (!o) escSuppressUntilRef.current = Date.now() + 400; setVideoOpen(o); }}>
        {/* autoFocus + onOpenAutoFocus (у Content): начальный фокус садим на
            «Закрыть», а не в iframe. Так Esc работает (фокус на родительском
            элементе), aria-hidden warning нет, а плеер остаётся доступным с
            клавиатуры (Tab) — не выключаем его из таб-порядка. */}
        <Drawer.Portal>
          <Drawer.Overlay style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(5,5,6,.72)", backdropFilter: "blur(3px)" }} />
          <Drawer.Content aria-describedby={undefined}
            onOpenAutoFocus={(e) => { e.preventDefault(); if (closeBtnRef.current) closeBtnRef.current.focus(); }}
            style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 111, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", maxHeight: "94vh", padding: "10px 16px 26px", background: "var(--bg-base)", borderTopLeftRadius: "var(--radius-lg)", borderTopRightRadius: "var(--radius-lg)", borderTop: "1px solid var(--border-hair)", outline: "none" }}>
            <Drawer.Handle style={{ width: "44px", height: "5px", borderRadius: "3px", background: "var(--ink-600)", flexShrink: 0 }} />
            <Drawer.Title style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-soft)", margin: 0 }}>
              {w[1]} · вживую
            </Drawer.Title>
            {clip ? (
              <div style={{ width: "min(92vw, calc(72vh * " + arNum.toFixed(4) + "))", aspectRatio: clip[5] + " / " + clip[6], background: "var(--ink-900)", border: "1px solid var(--border-hair)", overflow: "hidden", flexShrink: 1 }}>
                {/* Плеер остаётся в таб-порядке (управляем с клавиатуры). Начальный
                    фокус сажаем на «Закрыть» через onOpenAutoFocus у Drawer.Content,
                    поэтому Esc не проваливается в кросс-доменный iframe. */}
                <iframe title={w[1] + " — вживую"} src={clipSrcNative(clip[0])} frameBorder="0" scrolling="no"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  style={{ width: "100%", height: "100%", display: "block", border: 0 }}></iframe>
              </div>
            ) : null}
            <Drawer.Close ref={closeBtnRef} className="rt-lb-live"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 18px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-hair)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", flexShrink: 0 }}>
              Закрыть
            </Drawer.Close>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      ) : null}
    </React.Fragment>
  );
}

function Works({ onBook }) {
  /* Порядок ленты живёт в состоянии: клик по стилю не прячет работы, а
     переставляет их — работы выбранного стиля собираются подряд, и первая
     встаёт в середину кадра. Набор всегда полный, меняется только очередь. */
  const [order, setOrder] = React.useState(WORKS);
  const orderRef = React.useRef(order);
  orderRef.current = order;
  const items = [...order, ...order];
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const [style, setStyle] = React.useState(WORK_STYLES[0]);
  const [shot, setShot] = React.useState(-1);   /* индекс работы в просмотре */
  /* Прямоугольник нажатой плитки для FLIP-входа лайтбокса; null — связки нет
     (клик с клавиатуры, reduced-motion, шаг ←/→). */
  const [fromRect, setFromRect] = React.useState(null);
  /* Якорь на время перестановки: какую работу вывести в центр после неё. */
  const anchor = React.useRef(null);
  const reduced = usePrefersReducedMotion();
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;                   /* нужен в dep-free openTile */
  const reveal = useReveal();
  const { group, child } = useRevealGroup();

  const S = React.useRef({
    offset: 0, setW: 1, paused: false, dragging: false, swap: null, swapPending: null,
    lastX: 0, lastT: 0, tween: 0, vel: 0, moved: 0, geo: [], mid: -1,
    /* Заглушка до регистрации в эффекте: реальный sweep кладётся туда раньше,
       чем стартует кадровый цикл, — гейт на месте вызова не нужен. */
    sweep: () => {},
  });

  /* Счётчик кадров для sweep — в ref, а не в замыкании эффекта: колбэк
     useAnimationFrame пересоздаётся каждым рендером, локальная переменная
     обнулялась бы вместе с ним и sweep бежал бы чаще, чем раз в 10 кадров. */
  const tickRef = React.useRef(0);

  React.useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    /* Геометрия первого набора — по ней ищем работу в центре кадра. */
    const measure = () => {
      const s = S.current;
      s.setW = Math.max(1, track.scrollWidth / 2);
      s.geo = Array.prototype.slice.call(track.children, 0, orderRef.current.length)
        .map((el) => ({ left: el.offsetLeft, w: el.offsetWidth }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    /* Подгрузка кадров: src получают только плитки, подошедшие к экрану на
       PRELOAD пикселей. Позиции считаем из geo и offset, без чтения DOM —
       196 замеров на кадр стоили бы дороже самой ленты. Раз в 10 кадров хватает:
       при 34 px/s запас в экран шириной вырабатывается минуты за полторы. */
    const PRELOAD = 1200;
    const sweep = () => {
      const s = S.current;
      if (!s.geo.length) return;
      const view = wrap.clientWidth;
      const kids = track.children;
      for (let k = 0; k < kids.length; k++) {
        const img = kids[k].firstElementChild;
        if (!img || !img.dataset.src) continue;
        const n = orderRef.current.length;
        const g = s.geo[k % n];
        if (!g) continue;
        const left = g.left + (k >= n ? s.setW : 0) - s.offset;
        if (left < view + PRELOAD && left + g.w > -PRELOAD) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
      }
    };
    /* Кладём в S, чтобы перестановка могла подгрузить кадры синхронно: она
       меняет offset мгновенно, а цикл дошёл бы до sweep только через 10 кадров
       — и работы редких стилей, ни разу не подходившие к экрану, показались бы
       пустыми прямоугольниками. */
    S.current.sweep = sweep;

    return () => { ro.disconnect(); };
  }, []);

  /* Цикл ленты — на кадровом шедулере Motion (общий с остальными анимациями,
     свой requestAnimationFrame больше не заводим). Колбэк намеренно НЕ обёрнут
     в useCallback и не спрятан в useEffect([]): useAnimationFrame переподписывает
     его на каждый рендер, и только поэтому `reduced` читается живым — иначе
     переключение prefers-reduced-motion на открытой странице ленту бы не
     остановило. Физика перенесена дословно; отличие одно: delta приходит от
     Motion уже подрезанной сверху 40 мс (наш Math.min(0.05, …) остаётся как был,
     но на просевших кадрах верхняя граница теперь 40, а не 50 мс). */
  useAnimationFrame((time, delta) => {
    const s = S.current;
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    const dt = Math.min(0.05, delta / 1000);

    if (s.dragging) {
      /* offset двигает обработчик move */
    } else if (s.swap) {
      /* Горизонталь на время смены стиля замирает: ведёт вертикаль. */
      const sw = s.swap;
      sw.t += dt;
      if (sw.phase === "out") {
        /* Уход вниз с разгоном (t²): начинается мягко, за кадр уходит быстро. */
        const u = Math.min(1, sw.t / SWAP_OUT);
        sw.y = sw.h * u * u;
        if (u >= 1) { sw.phase = "hold"; setOrder(buildOrder(sw.st)); }
      } else if (sw.phase === "hold") {
        /* Кадр пуст, лента ждёт коммита. Сюда и приходится подвисание на
           ~50 мс — прерывать ему нечего, показывать тоже. Позицию выставит
           useLayoutEffect: там есть геометрия нового порядка. */
        sw.y = sw.h;
      } else {
        /* Приход сверху с торможением. */
        const u = Math.min(1, sw.t / SWAP_IN);
        const e = 1 - Math.pow(1 - u, 3);
        sw.y = -sw.h * (1 - e);
        if (u >= 1) {
          /* Клик, пришедший пока лента возвращалась, отрабатываем теперь. */
          s.swap = s.swapPending ? startSwap(s.swapPending) : null;
          s.swapPending = null;
        }
      }
    } else if (Math.abs(s.tween) > 0.5) {
      const step = s.tween * Math.min(1, dt * 6);
      s.offset += step; s.tween -= step; s.vel = 0;
    } else if (Math.abs(s.vel) > 12) {
      s.offset += s.vel * dt;              /* выбег после броска */
      s.vel *= Math.pow(INERTIA_K, dt);
    } else {
      s.tween = 0; s.vel = 0;
      if (!s.paused && !reduced) s.offset += DRIFT_VMAX * dt;
    }

    s.offset = ((s.offset % s.setW) + s.setW) % s.setW;
    /* Вертикаль ненулевая только на смене стиля. Пишем её в тот же transform:
       отдельная обёртка со своим слоем стоила бы дороже, а обрезает всё равно
       overflow:hidden у обёртки ленты. */
    const y = s.swap ? Math.round(s.swap.y) : 0;
    track.style.transform = "translate3d(" + (-s.offset) + "px," + y + "px,0)";

    /* Стиль работы, попавшей в центр кадра, ведёт индекс под лентой. */
    if (s.geo.length) {
      const focus = (s.offset + wrap.clientWidth / 2) % s.setW;
      let i = s.geo.length - 1;
      for (let k = 0; k < s.geo.length; k++) {
        if (focus >= s.geo[k].left && focus < s.geo[k].left + s.geo[k].w) { i = k; break; }
      }
      if (i !== s.mid) { s.mid = i; setStyle(orderRef.current[i][2]); }
    }
    if (tickRef.current++ % 10 === 0) s.sweep();
  });

  /* Горизонтальный трекпад листает ленту; вертикаль оставляем скроллу страницы. */
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const s = S.current;
      s.offset += e.deltaX; s.tween = 0; s.vel = 0;
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });

    /* Контейнер с overflow:hidden всё равно прокручивается программно, и браузер
       делает это сам, подтягивая элемент под фокусом. Позицию ленты держит
       transform, поэтому чужую прокрутку возвращаем в ноль — иначе смещения
       складываются и плитка уезжает за кадр. */
    const unscroll = () => { if (wrap.scrollLeft !== 0) wrap.scrollLeft = 0; };
    wrap.addEventListener("scroll", unscroll);

    return () => { wrap.removeEventListener("wheel", onWheel); wrap.removeEventListener("scroll", unscroll); };
  }, []);

  React.useEffect(() => { S.current.paused = shot >= 0; }, [shot]);

  /* Подводит работу i к центру кадра кратчайшим путём по кольцу. */
  /* Показ работы, получившей фокус с клавиатуры. Целимся к левому краю, а не
     к центру: так offset остаётся в [0, setW), и видимой оказывается именно та
     плитка, на которой фокус, а не её двойник из второго прохода.
     Оба обработчика плитки — useCallback без зависимостей (всё нужное лежит в
     ref'ах): их идентичность и держит memo на WorkTile.
     Принимают саму работу, а не индекс: индекс менялся у почти всех плиток при
     перестановке и в одиночку ронял memo — 198 плиток по 4 motion-элемента
     перерисовывались заново, и кадр подмены длился 77 мс. Кортежи работ в
     `order` те же по ссылке, поэтому indexOf находит позицию за один проход,
     и он тут разовый — на клик, а не на кадр. */
  const focusTile = React.useCallback((w) => {
    const s = S.current;
    const g = s.geo[orderRef.current.indexOf(w)];
    const wrap = wrapRef.current;
    if (!g || !wrap) return;
    const x = g.left - s.offset;
    if (x >= 0 && x + g.w <= wrap.clientWidth) return;   /* уже на виду */
    s.tween = Math.max(0, g.left - 24) - s.offset;
    s.vel = 0;
  }, []);

  const nudge = (dir) => { const s = S.current; s.tween += dir * (wrapRef.current ? wrapRef.current.clientWidth : 600) * 0.6; s.vel = 0; };
  /* i < 0 — лайтбокс уже закрыт. Пара к `pointerEvents:"none"`: он глушит мышь,
     но выходящее поддерево висит в DOM ~0.24s, и Enter на сфокусированной
     стрелке всё ещё даёт click, а (-1 + 1 + N) % N === 0 открывал лайтбокс
     заново на первой работе. Гейт в апдейтере, а не в обработчике: поддерево
     заморожено и обработчик держит замыкание последнего открытого рендера —
     свежий shot виден только апдейтеру. */
  const step = (d) => {
    setFromRect(null);                            /* шаг рвёт связку: работа уже не та, что в плитке */
    setShot((i) => (i < 0 ? i : (i + d + order.length) % order.length));
  };
  /* detail === 0 — нажатие с клавиатуры: там протяжки не было и порог не применим. */
  const openTile = React.useCallback((w, e) => {
    if (!((e && e.detail === 0) || S.current.moved < DRAG_SLOP)) return;
    /* FLIP-вход только для клика мышью по видимой плитке: снимаем её картинку
       (первый ребёнок кнопки, как в sweep). С клавиатуры (detail 0) и под
       reduced-motion связки нет — обычное появление. Прямоугольник картинки, а
       не кнопки: у кнопки есть заливка-подпись, летит именно изображение. */
    const img = e && e.detail !== 0 && !reducedRef.current && e.currentTarget.firstElementChild;
    setFromRect(img ? img.getBoundingClientRect() : null);
    setShot(orderRef.current.indexOf(w));
  }, []);

  /* Клик по стилю: работы этого стиля собираются подряд, и первая из них встаёт
     в середину кадра. Ничего не скрывается — набор тот же, меняется очередь.

     Блок ставим не в самое начало ленты, а за несколькими работами — ровно
     столько, чтобы он начинался правее середины кадра. Иначе offset уходит в
     конец набора: визуально верно (лента бесшовная), но в центре оказывается
     плитка-двойник из второго прохода — а он скрыт от скринридера, и фокус с
     клавиатуры улетает к оригиналу через всю ленту. См. focusTile. */
  const buildOrder = (st) => {
    const s = S.current, wrap = wrapRef.current, cur = orderRef.current;
    const tagged = cur.filter((w) => w[2] === st);
    const others = cur.filter((w) => w[2] !== st);
    const half = wrap ? wrap.clientWidth / 2 : 0;
    let lead = 0;
    for (let acc = 0; lead < others.length && acc <= half; lead++) {
      const g = s.geo[cur.indexOf(others[lead])];
      acc += g ? g.w : 0;
    }
    anchor.current = tagged[0];
    return others.slice(0, lead).concat(tagged, others.slice(lead));
  };

  /* Высота ухода — рост кадра плюс запас: лента должна выйти за обрезку
     целиком, иначе снизу останется полоска плиток. */
  const startSwap = (st) => ({ phase: "out", t: 0, y: 0, h: wrapRef.current.clientHeight + 24, st });

  const sortByStyle = (st) => {
    const s = S.current;
    if (!wrapRef.current || !order.some((w) => w[2] === st)) return;
    /* При выключенной анимации возить нечего — переставляем сразу. */
    if (reduced) {
      setOrder(buildOrder(st));
      return;
    }
    /* Повторный клик по ходу смены не начинает её заново — перезапуск дал бы
       рывок из-за кадра. Пока набор ещё уходит, просто меняем цель; если он
       уже внизу или возвращается, кладём в очередь и подхватываем на выходе. */
    if (s.swap) {
      if (s.swap.phase === "out") s.swap.st = st;
      else s.swapPending = st;
      return;
    }
    s.swap = startSwap(st);
    s.tween = 0; s.vel = 0;
  };

  /* Пересчёт после перестановки. Геометрию снимаем заново — ResizeObserver тут
     молчит: ширина ленты не изменилась, изменился только порядок. */
  React.useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const s = S.current, track = trackRef.current, wrap = wrapRef.current;
    if (!track || !wrap) return;
    s.setW = Math.max(1, track.scrollWidth / 2);
    s.geo = Array.prototype.slice.call(track.children, 0, order.length)
      .map((el) => ({ left: el.offsetLeft, w: el.offsetWidth }));
    const j = order.indexOf(a);
    if (j >= 0 && s.geo[j]) {
      /* Куда лента должна встать: якорная плитка центром в центр кадра.
         Плитки разной ширины, поэтому целимся центром, а не краем. */
      const final = s.geo[j].left + s.geo[j].w / 2 - wrap.clientWidth / 2;
      /* Позицию выставляем сразу конечной — и в анимированном случае тоже:
         кадр сейчас пуст, лента внизу, ставить её можно куда угодно без
         единого видимого скачка. Ровно то, ради чего затеян уход за кадр. */
      s.offset = ((final % s.setW) + s.setW) % s.setW;
      s.tween = 0; s.vel = 0;
      if (s.swap && s.swap.phase === "hold") { s.swap.phase = "in"; s.swap.t = 0; }
      const y = s.swap ? Math.round(s.swap.y) : 0;
      track.style.transform = "translate3d(" + (-s.offset) + "px," + y + "px,0)";
    }
    s.mid = -1;
    s.sweep();
  }, [order]);

  const down = (e) => {
    const s = S.current;
    s.dragging = true; s.lastX = e.clientX; s.lastT = performance.now();
    s.tween = 0; s.vel = 0; s.moved = 0; s.held = false;
    wrapRef.current.style.cursor = "grabbing";
  };
  const move = (e) => {
    const s = S.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const now = performance.now();
    const dt = Math.max(8, now - s.lastT) / 1000;
    s.offset -= dx; s.moved += Math.abs(dx);
    s.vel = s.vel * 0.7 + (-dx / dt) * 0.3;
    s.lastX = e.clientX; s.lastT = now;
    /* Захват включаем только после порога: иначе click уходит обёртке, а не плитке. */
    if (!s.held && s.moved >= DRAG_SLOP && wrapRef.current.setPointerCapture) {
      try { wrapRef.current.setPointerCapture(e.pointerId); s.held = true; } catch (_) {}
    }
  };
  const up = (e) => {
    const s = S.current;
    if (!s.dragging) return;
    s.dragging = false;
    wrapRef.current.style.cursor = "grab";
    if (s.held) { try { wrapRef.current.releasePointerCapture(e.pointerId); } catch (_) {} s.held = false; }
  };

  const ctrl = { width: "46px", height: "46px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-body)", border: "1px solid var(--border-hair)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "14px", transition: "all .2s" };
  const ctrlOn = (e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--white)"; };
  const ctrlOff = (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-hair)"; e.currentTarget.style.color = "var(--text-body)"; };

  return (
    <section id="works" className="rt-snap" style={{ background: "var(--bg-surface)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 0", overflow: "hidden" }}>
      <motion.div {...group} style={{ maxWidth: MAXW, margin: "0 auto 40px", padding: "0 32px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        {/* Заголовок ведёт, органы управления идут следом. Сама лента входа не
            получает: она и так в движении, вход поверх дрейфа читался бы шумом. */}
        <motion.div {...child}>
          <Kicker index="02" label="Работы" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Избранное</h2>
        </motion.div>
        <motion.div {...child} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button aria-label="Предыдущие работы" onClick={() => nudge(-1)} onMouseEnter={ctrlOn} onMouseLeave={ctrlOff} style={ctrl}><i className="fas fa-arrow-left" aria-hidden="true"></i></button>
          <button aria-label="Следующие работы" onClick={() => nudge(1)} onMouseEnter={ctrlOn} onMouseLeave={ctrlOff} style={ctrl}><i className="fas fa-arrow-right" aria-hidden="true"></i></button>
          <div style={{ width: "1px", height: "28px", background: "var(--border-hair)", margin: "0 6px" }}></div>
          <Button variant="ghost" onClick={onBook} iconRight="fas fa-arrow-right">Записаться на сеанс</Button>
        </motion.div>
      </motion.div>

      <div ref={wrapRef} role="group" aria-label="Лента работ"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onMouseEnter={() => { S.current.paused = true; }} onMouseLeave={() => { S.current.paused = false; }}
        onFocusCapture={() => { S.current.paused = true; }} onBlurCapture={() => { S.current.paused = shot >= 0; }}
        style={{ overflow: "hidden", cursor: "grab", touchAction: "pan-y", userSelect: "none" }}>
        <div ref={trackRef} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
          {/* Ключ по пути файла, а не по индексу: при перестановке React должен
              переносить готовые плитки, а не переписывать их содержимое на месте —
              иначе уже загруженные картинки сбрасываются и лента моргает. */}
          {items.map((w, i) => (
            <WorkTile key={w[0] + (i >= order.length ? "~2" : "~1")} w={w} clone={i >= order.length}
              onOpen={openTile} onFocus={focusTile} />
          ))}
        </div>
      </div>

      {/* Стили: подсвечен стиль работы в центре, клик — собрать этот стиль подряд. */}
      <motion.div {...reveal} className="rt-work-styles" style={{ maxWidth: MAXW, margin: "28px auto 0", padding: "0 32px", width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 22px" }}>
        {WORK_STYLES.map((s) => {
          const on = s === style;
          return (
            /* Подчёркивание живёт на внутреннем span, поэтому кнопке можно
               задать крупную область нажатия, не отрывая линию от текста. */
            /* Гасим на время просмотра: лайтбокс не запирает фокус, и Shift+Tab
               с кнопки закрытия уходит сюда. Перестановка сменила бы работу под
               открытым просмотром — индекс тот же, работа уже другая. */
            <button key={s} type="button" onClick={() => sortByStyle(s)} disabled={shot >= 0}
              aria-current={on ? "true" : undefined}
              style={{ background: "none", border: 0, padding: "13px 0", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: on ? "var(--bone)" : "var(--text-muted)", transition: "color .25s" }}>
              <span style={{ display: "inline-block", paddingBottom: "4px", borderBottom: "1px solid " + (on ? "var(--accent)" : "transparent"), transition: "border-color .25s" }}>{s}</span>
            </button>
          );
        })}
      </motion.div>

      <WorkLightbox index={shot} works={order} onClose={() => { setShot(-1); setFromRect(null); }} onStep={step} fromRect={fromRect} />
    </section>
  );
}

/* ---------------------------------------------------------------- Процесс */
/* [id ролика в Cloud Video, название, категория, обложка, сек, ширина, высота] */
const CLIPS = [
  ["vplveewfxat7z3sqekdv", "Тимур за работой", "процесс", "./assets/img/video/v10.webp", 23, 528, 960],
  ["vplvrja4qp3ps3fonejk", "Питон", "процесс", "./assets/img/video/v01.webp", 22, 540, 960],
  ["vplvxwh3dnpgcnqcxzrj", "Медведь", "процесс", "./assets/img/video/v02.webp", 12, 540, 960],
  ["vplvp4tgzzga2un52nna", "Терминатор", "процесс", "./assets/img/video/v03.webp", 28, 764, 960],
  ["vplvhiavnn74sa3ad2hz", "Портрет", "процесс", "./assets/img/video/v04.webp", 33, 768, 960],
  ["vplv63sw637q4xgtjwjc", "Гризли", "процесс", "./assets/img/video/v05.webp", 17, 540, 960],
  ["vplvn7i2a6l6b2y3xzeq", "Демон", "процесс", "./assets/img/video/v06.webp", 23, 576, 720],
  ["vplvxwfyyymbucdbuzn2", "It's alive !!!", "процесс", "./assets/img/video/v07.webp", 28, 576, 720],
  ["vplvmsh2zy23inmeyaxv", "Скорпион", "процесс", "./assets/img/video/v08.webp", 36, 576, 720],
  ["vplvovbcxpfwrrtqifjh", "Пленница", "процесс", "./assets/img/video/v09.webp", 22, 576, 720],
  ["vplvql3ud6lpffedk4lj", "Птичка с персиками", "процесс", "./assets/img/video/v11.webp", 32, 540, 960],
  ["vplvuapkkbbpheyzvrbw", "Клоун", "процесс", "./assets/img/video/v12.webp", 22, 576, 720],
  ["vplvxwcmg67sld53q7sz", "Взгляд", "процесс", "./assets/img/video/v13.webp", 17, 720, 720],
  ["vplvrmu6ndlyfzpuizmj", "Демонический самурай", "процесс", "./assets/img/video/v14.webp", 29, 576, 720],
  ["vplvdepowfldj4muyxv4", "Ларс Ульрих", "процесс", "./assets/img/video/v15.webp", 37, 768, 960],
  ["vplvnmmmdtnjf32tzesl", "Череп", "процесс", "./assets/img/video/v16.webp", 22, 540, 960],
  ["vplv7dm2fazospgd5sjx", "Зверь", "процесс", "./assets/img/video/v17.webp", 16, 720, 720],
  ["vplvy4urfrwgh2sps5sl", "Triangle", "финал", "./assets/img/video/v18.webp", 12, 540, 960],
  ["vplv34slx5lve5p7j4tm", "Шаманка", "финал", "./assets/img/video/v19.webp", 14, 540, 960],
  ["vplv2hpr4stl3yklrnuw", "Сова", "процесс", "./assets/img/video/v20.webp", 13, 560, 960],
  ["vplvhsvigv4bgohwi45v", "Вампирша", "процесс", "./assets/img/video/v21.webp", 18, 540, 960],
  ["vplvgq57pvyskz2gs2bb", "Via the End", "процесс", "./assets/img/video/v22.webp", 13, 540, 960],
  ["vplvhsuvqkpjpl65bay7", "Харли — Джокер", "процесс", "./assets/img/video/v23.webp", 11, 540, 960],
  ["vplv4i6vmqnttvts7epq", "Девушка — Волчица", "финал", "./assets/img/video/v24.webp", 29, 1707, 960],
];

/* Пропорция сцены. В передаче было 16:10, но под неё подходит один ролик из 24 —
   остальные вертикальные, их резало на 65%. 4:5 садится на основную массу, а что
   не совпало, вписывается целиком: рамку добирает размытая обложка того же кадра. */
const STAGE_AR = 0.8;
const STAGE_H = "clamp(340px, 60vh, 600px)";

/* Родной интерфейс плеера убран (hidden=*) — вся обвязка своя, как в макете.
   mute=1 обязателен: без него браузеры не дают автозапуск. */
const clipSrc = (id) =>
  "https://runtime.video.cloud.yandex.net/player/video/" + id +
  "?autoplay=1&mute=1&hidden=*&preload=false&background_color=0A0A0C";

/* Вариант для лайтбокса работ: БЕЗ hidden=* — оставляем родные контролы
   Яндекса. Обвязки своей нет, поэтому и постмессадж-логика не нужна. */
const clipSrcNative = (id) =>
  "https://runtime.video.cloud.yandex.net/player/video/" + id +
  "?autoplay=1&mute=1&background_color=0A0A0C";

const mmss = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
};

/* Кадр вписывается в сцену целиком: считаем его коробку внутри 4:5. */
const clipBox = (w, h) => {
  const a = w / h;
  return a > STAGE_AR
    ? { width: "100%", height: (STAGE_AR / a * 100).toFixed(3) + "%" }
    : { width: (a / STAGE_AR * 100).toFixed(3) + "%", height: "100%" };
};

function Process() {
  const [active, setActive] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [time, setTime] = React.useState("00:00");
  const [live, setLive] = React.useState(false);   /* плеер создан только когда секция в кадре */
  const [fade, setFade] = React.useState(false);
  const frameRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const listRef = React.useRef(null);
  const durRef = React.useRef(0);
  const activeRef = React.useRef(0);
  const reveal = useReveal();
  /* Плеер идёт следом за заголовком — тот же приём, что staggerChildren, но
     блоки здесь сиблинги, а не потомки, поэтому задержка задаётся явно. */
  const revealStage = useReveal(0.12);

  const cur = CLIPS[active];
  React.useEffect(() => { activeRef.current = active; }, [active]);

  const send = (method, params) => {
    const f = frameRef.current;
    if (f && f.contentWindow) f.contentWindow.postMessage(Object.assign({ method: method }, params || {}), "*");
  };

  /* Плеер весит около 2 МБ, поэтому создаём его только когда секция доехала до экрана. */
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) setLive(true);
        else if (live) send("pause");
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  /* События плеера приходят через postMessage — строкой JSON, а не объектом.
     В примере из документации Яндекса разбора строки нет, и без него
     event всегда undefined, а вся обвязка стоит на нулях. */
  React.useEffect(() => {
    const onMsg = (e) => {
      /* Реагируем только на СВОЙ iframe. Плеер в лайтбоксе работ (нативный
         Яндекс) тоже шлёт postMessage; без этого фильтра его timeupdate/ended
         дёргали бы таймкод и переключали ролик здесь. */
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      let d = e.data;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch (_) { return; } }
      if (!d || !d.event) return;
      if (d.duration) durRef.current = d.duration;
      if (d.event === "timeupdate" || d.event === "started" || d.event === "resumed" || d.event === "rewound") {
        setTime(mmss(d.time));
        if (durRef.current) setProgress(Math.min(1, (d.time || 0) / durRef.current));
        if (d.event !== "timeupdate") setPlaying(true);
      } else if (d.event === "paused") {
        setPlaying(false); setTime(mmss(d.time));
      } else if (d.event === "ended") {
        step((activeRef.current + 1) % CLIPS.length);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  /* Активный пункт подтягиваем внутри списка вручную: scrollIntoView утянул бы
     за собой и саму страницу. */
  React.useEffect(() => {
    const l = listRef.current;
    if (!l) return;
    const el = l.children[active];
    if (!el) return;
    const top = el.offsetTop - l.clientHeight / 2 + el.clientHeight / 2;
    l.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [active]);

  const step = (i) => {
    if (i === activeRef.current) return;
    setFade(true);
    setTimeout(() => {
      setActive(i); setProgress(0); setTime("00:00"); durRef.current = CLIPS[i][4];
      setFade(false);
      send("updateSource", { id: CLIPS[i][0] });
      send("play");
      setPlaying(true);
    }, 260);
  };

  const toggle = () => {
    if (playing) { send("pause"); setPlaying(false); }
    else { send("play"); setPlaying(true); }
  };

  const seek = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const d = durRef.current || cur[4];
    send("seek", { time: frac * d });
    setProgress(frac);
  };

  const glass = { background: "rgba(10,10,12,.55)", backdropFilter: "blur(4px)" };

  return (
    <section id="process" className="rt-snap" style={{ background: "var(--bg-surface)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "96px 0" }}>
      <motion.div {...reveal} style={{ maxWidth: MAXW, margin: "0 auto 34px", padding: "0 32px", width: "100%" }}>
        <Kicker index="03" label="Вживую" />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Ближе, чем фото</h2>
      </motion.div>

      <motion.div {...revealStage} style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div className="rt-clip-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", border: "1px solid var(--border-hair)", background: "var(--bg-base)" }}>

          {/* Сцена */}
          <div ref={stageRef} onClick={toggle} className="rt-clip-stage"
            style={{ position: "relative", height: STAGE_H, width: "calc(" + STAGE_H + " * " + STAGE_AR + ")", overflow: "hidden", background: "var(--ink-800)", cursor: "pointer" }}>

            {/* Размытая подложка — тот же кадр, чтобы поля не были пустыми */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url(" + cur[3] + ")", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(26px) brightness(0.45) saturate(0.7)", transform: "scale(1.15)" }}></div>

            {/* Перекрёстный фейд при смене ролика: step() гасит кадр, ждёт те же
                260 мс и только потом подменяет источник. */}
            <motion.div initial={false} animate={{ opacity: fade ? 0 : 1 }} transition={{ duration: 0.26, ease: EASE_CSS }}
              style={{ position: "absolute", inset: 0, margin: "auto", ...clipBox(cur[5], cur[6]) }}>
              {live ? (
                <iframe ref={frameRef} title={cur[1]} src={clipSrc(cur[0])} frameBorder="0" scrolling="no"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  style={{ width: "100%", height: "100%", display: "block", border: 0, pointerEvents: "none" }}></iframe>
              ) : (
                <img src={cur[3]} alt={cur[1]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </motion.div>

            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,.55), rgba(10,10,12,0) 45%)", pointerEvents: "none" }}></div>

            <div style={{ position: "absolute", top: "18px", left: "18px", display: "flex", alignItems: "center", gap: "9px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", color: "var(--bone)", padding: "7px 12px", pointerEvents: "none", ...glass }}>
              <span className="rt-rec-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)" }}></span>
              REC {String(active + 1).padStart(2, "0")} · {time} / {mmss(cur[4])}
            </div>

            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(); }}
              aria-label={playing ? "Пауза" : "Смотреть"}
              className="rt-clip-btn"
              style={{ position: "absolute", right: "18px", top: "18px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bone)", fontSize: "12px", border: 0, cursor: "pointer", ...glass }}>
              <i className={playing ? "fas fa-pause" : "fas fa-play"} aria-hidden="true"></i>
            </button>

            <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "22px", pointerEvents: "none" }}>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(20px, 2.2vw, 30px)", fontWeight: 500, margin: 0, letterSpacing: "0.01em" }}>{cur[1]}</h3>
            </div>

            <div onClick={seek} role="slider" aria-label="Перемотка" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "14px", display: "flex", alignItems: "flex-end", cursor: "pointer" }}>
              <div style={{ width: "100%", height: "3px", background: "rgba(236,231,223,0.12)", pointerEvents: "none" }}>
                <div style={{ width: (progress * 100) + "%", height: "100%", background: "var(--accent)", transition: "width .2s linear" }}></div>
              </div>
            </div>
          </div>

          {/* Плейлист */}
          <div className="rt-clip-side" style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border-hair)", height: STAGE_H, minWidth: 0 }}>
            <div style={{ flexShrink: 0, padding: "20px 24px 13px", display: "flex", alignItems: "center", gap: "12px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-hair)" }}>
              <span style={{ color: "var(--accent)" }}>▶</span> Видео из студии
              <span style={{ marginLeft: "auto", color: "var(--text-faint)", letterSpacing: "0.1em" }}>{CLIPS.length}</span>
            </div>
            {/* position: relative обязателен — от него берётся offsetTop пунктов,
                иначе центрирование считает от чужого предка и промахивается. */}
            <div ref={listRef} className="rt-clip-list" style={{ position: "relative", overflowY: "auto", flex: 1, minHeight: 0 }}>
              {CLIPS.map((v, i) => {
                const on = i === active;
                return (
                  <button key={v[0]} type="button" onClick={() => step(i)} aria-current={on ? "true" : undefined}
                    className="rt-clip-item"
                    style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "40px 1fr 24px", gap: "14px", alignItems: "center", textAlign: "left", padding: "14px 24px", background: on ? "rgba(236,231,223,0.04)" : "transparent", border: 0, borderBottom: "1px solid var(--border-hair)", borderLeft: on ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer", transition: "background .25s, border-color .25s" }}>
                    {on ? <span style={{ position: "absolute", left: 0, bottom: "-1px", height: "1px", width: (progress * 100) + "%", background: "var(--accent)", transition: "width .2s linear" }}></span> : null}
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 600, color: on ? "var(--accent)" : "var(--text-faint)", transition: "color .25s" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "var(--font-display)", color: on ? "var(--bone)" : "var(--text-body)", textTransform: "uppercase", letterSpacing: "0.02em", fontSize: "16px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color .25s" }}>{v[1]}</span>
                      <span style={{ display: "block", fontFamily: "var(--font-body)", color: "var(--text-faint)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>{mmss(v[4])}</span>
                    </span>
                    <span style={{ color: on ? "var(--accent)" : "var(--text-faint)", fontSize: "12px", transition: "color .25s" }}>
                      {on ? (
                        <span className="rt-eq" style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
                          <span style={{ height: "60%" }}></span><span style={{ height: "100%" }}></span><span style={{ height: "40%" }}></span>
                        </span>
                      ) : <i className="fas fa-play" aria-hidden="true"></i>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}

/* --------------------------------------------------------------- Services */
const SERVICES = [
  ["Авторские татуировки", "Уникальные художественные работы по вашему эскизу или моему дизайну.", "fas fa-pen-nib"],
  ["Коррекция и перекрытие", "Профессиональное исправление и перекрытие неудачных татуировок.", "fas fa-layer-group"],
  ["Тату на шрамах", "Специальные техники нанесения на рубцовую ткань.", "fas fa-shield-heart"],
  ["Перманентный татуаж", "Микроблейдинг, перманентный макияж бровей, губ и век.", "fas fa-feather"],
];

function Services({ onBook }) {
  return (
    <section id="services" className="rt-snap" style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "110px 0" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <Kicker index="04" label="Услуги" />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Что я делаю</h2>
          </div>
          <Button variant="ghost" onClick={onBook} iconRight="fas fa-arrow-right">Рассчитать стоимость</Button>
        </div>
        <div style={{ borderTop: "1px solid var(--border-hair)" }}>
          {SERVICES.map(([title, body], i) => (
            /* Покоящийся фон — прозрачная ЗАЛИВКА того же тона, а не `transparent`:
               Motion интерполирует rgba покомпонентно и через rgba(0,0,0,0) увёл бы
               подсветку в чёрный. Визуально это тот же «фона нет». */
            <motion.div key={title}
              initial="rest" animate="rest" whileHover="hover"
              variants={{ rest: { backgroundColor: "rgba(236,231,223,0)" }, hover: { backgroundColor: "rgba(236,231,223,0.03)" } }}
              transition={{ duration: 0.25, ease: EASE_CSS }}
              style={{ display: "grid", gridTemplateColumns: "70px 1.1fr 1.4fr 40px", gap: "28px", alignItems: "center", padding: "30px 16px", borderBottom: "1px solid var(--border-hair)" }} className="rt-svc-row">
              <motion.span variants={{ rest: { color: C_FAINT }, hover: { color: C_ACCENT } }}
                transition={{ duration: 0.25, ease: EASE_CSS }}
                style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</motion.span>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 500, margin: 0 }}>{title}</h3>
              <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6, fontSize: "15px" }} className="rt-svc-desc">{body}</p>
              <motion.span variants={{ rest: { color: C_FAINT, x: 0 }, hover: { color: C_ACCENT, x: 4 } }}
                transition={{ duration: 0.25, ease: EASE_CSS }}
                style={{ justifySelf: "end", fontSize: "18px" }}><i className="fas fa-arrow-right"></i></motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Benefits */
const BENEFITS = [
  ["fas fa-shield-halved", "100% стерильность", "Только одноразовые иглы и медицинская стерилизация в автоклаве."],
  ["fas fa-droplet", "Премиальные пигменты", "Eternal Ink, Dynamic Color и Fusion Ink — яркие и долговечные."],
  ["fas fa-gem", "Эксклюзивные эскизы", "Каждый дизайн создаётся специально для вас."],
  ["fas fa-infinity", "Пожизненная гарантия", "Если потребуется коррекция через годы — сделаю бесплатно."],
  ["fas fa-couch", "Максимальный комфорт", "Просторный кабинет, музыка, кино и игры во время сеанса."],
  ["fas fa-location-dot", "Центр Москвы", "Студия рядом со станцией метро «Смоленская»."],
];

function Benefits() {
  return (
    <section id="benefits" className="rt-snap" style={{ background: "var(--bg-surface)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "110px 0" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ marginBottom: "48px" }}>
          <Kicker index="05" label="Преимущества" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0", maxWidth: "16ch" }}>Почему мне доверяют</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border-hair)", border: "1px solid var(--border-hair)" }} className="rt-benefits-grid">
          {BENEFITS.map(([icon, title, body]) => (
            <div key={title} style={{ background: "var(--bg-surface)", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <i className={icon} style={{ color: "var(--accent)", fontSize: "24px" }}></i>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "21px", fontWeight: 500, margin: 0 }}>{title}</h3>
              <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6, fontSize: "15px" }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Testimonials */
const YANDEX_REVIEWS = "https://yandex.ru/maps/org/rated_tattoo/1269715236/reviews/";
const REVIEWS = [
  { name: "Артур", date: "08.05.2026", avatar: "./assets/img/reviews/av-artur.jpg", photo: "./assets/img/reviews/ph-artur.jpg", text: "Очень круто, всё понравилось — лучшее место, где я набивал тату." },
  { name: "Елизавета З.", date: "21.02.2026", avatar: "./assets/img/reviews/av-elizaveta.jpg", photo: "./assets/img/reviews/ph-elizaveta.jpg", text: "Решалась долго, но когда созрела — нашла Тимура и не прогадала. Работы зацепили даже через экран, а в кабинете невероятная атмосфера. Всё аккуратно и стерильно." },
  { name: "Лидия Лукьянова", date: "29.10.2025", avatar: "./assets/img/reviews/av-lidiya.jpg", photo: "./assets/img/reviews/ph-lidiya.jpg", text: "Тимур — профессионал, и при этом с ним кайфово: поболтать, фильм, поржать. Кайфуешь от всего процесса, а не только от результата. Теперь только ему доверяю." },
  { name: "Владимир З.", date: "24.10.2025", avatar: "./assets/img/reviews/av-vladimir.jpg", photo: null, text: "Татуировка огонь, качественная работа, рука мастера. Вайбовая атмосфера, приятное общение." },
  { name: "Елена Пушкина", date: "07.08.2025", avatar: "./assets/img/reviews/av-elena.jpg", photo: null, text: "Всё прошло идеально: профессионально, аккуратно и очень красиво. Тимур внимателен к деталям и создаёт комфортную атмосферу." },
  { name: "Дмитрий Кэт", date: "24.03.2025", avatar: null, photo: "./assets/img/reviews/ph-dmitriy.jpg", text: "Тимур лучший мастер! Судьба свела с ним повторно после долгого перерыва — невероятно круто. Профессионализм и внимание к деталям." },
  { name: "Нина Г.", date: "05.11.2024", avatar: "./assets/img/reviews/av-nina.jpg", photo: "./assets/img/reviews/ph-nina.jpg", text: "Была у Тимура ещё 7 лет назад — и снова знала, к кому ехать. Мои друзья тоже ездили, все остались довольны!" },
  { name: "Юлия В.", date: "26.05.2024", avatar: "./assets/img/reviews/av-yulia.jpg", photo: "./assets/img/reviews/ph-yulia.jpg", text: "Невозможно выразить словами восторг от результата! Тимур — не просто тату-мастер, а художник, реализующий любую фантазию." },
];

function ReviewStars() {
  return (
    <div style={{ display: "flex", gap: "3px", color: "var(--star)", fontSize: "12px" }} aria-label="5 из 5">
      {[0, 1, 2, 3, 4].map((i) => <i key={i} className="fas fa-star" aria-hidden="true"></i>)}
    </div>
  );
}

function Testimonials() {
  return (
    <section id="reviews" className="rt-snap" style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "110px 0", borderTop: "1px solid var(--border-hair)" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "44px" }}>
          <div>
            <Kicker index="06" label="Отзывы" />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Что говорят клиенты</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
            <StarRating value={5} score="5.0" count="160 оценок · Яндекс" size="18px" />
            <a href={YANDEX_REVIEWS} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", transition: "color .2s" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bone)")}
               onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>Все отзывы на Яндексе →</a>
          </div>
        </div>
        <div className="rt-reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", alignItems: "stretch" }}>
          {REVIEWS.map((r) => (
            <div key={r.name + r.date} style={{ border: "1px solid var(--border-hair)", background: "var(--bg-surface)", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {r.avatar
                  ? <img src={r.avatar} alt={r.name} loading="lazy" style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "var(--ink-700)" }} />
                  : <div style={{ width: "46px", height: "46px", borderRadius: "50%", flexShrink: 0, background: "var(--accent)", color: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "20px" }}>{r.name[0]}</div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.03em", fontSize: "16px", fontWeight: 500, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <ReviewStars />
                    <span style={{ color: "var(--text-faint)", fontSize: "12px", letterSpacing: "0.04em" }}>{r.date}</span>
                  </div>
                </div>
              </div>
              <p style={{ color: "var(--text-body)", margin: 0, lineHeight: 1.55, fontSize: "14.5px", minHeight: "67px", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>{r.text}</p>
              <div style={{ marginTop: "auto", overflow: "hidden", height: "188px", border: "1px solid var(--border-hair)" }}>
                {r.photo ? (
                  <a href={YANDEX_REVIEWS} target="_blank" rel="noopener noreferrer" aria-label={"Татуировка — отзыв " + r.name} style={{ display: "block", height: "100%", lineHeight: 0 }}>
                    <img src={r.photo} alt={"Татуировка — отзыв " + r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                  </a>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", position: "relative" }}>
                    <span style={{ fontFamily: "var(--font-display)", color: "var(--accent)", fontSize: "120px", lineHeight: 0.5, opacity: 0.5 }}>”</span>
                    <span style={{ position: "absolute", bottom: "14px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-faint)" }}>Отзыв с Яндекса</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- FAQ */
const FAQ = [
  { q: "Как узнать стоимость татуировки?", a: <p style={{ margin: 0 }}>Стоимость зависит от размера, сложности, места нанесения и деталей. Минимальная стоимость сеанса — 15 000 ₽. Запишитесь на бесплатную консультацию для точного расчёта.</p> },
  { q: "Больно ли делать тату?", a: <p style={{ margin: 0 }}>Ощущения индивидуальны и зависят от зоны тела и болевого порога. Использую обезболивающие гели. Рекомендую выспаться, плотно поесть и не пить алкоголь за 24 часа.</p> },
  { q: "Как ухаживать за татуировкой?", a: <p style={{ margin: 0 }}>Не снимать плёнку 2–4 часа, аккуратно мыть тёплой водой с мылом, наносить мазь 2–3 раза в день, избегать солнца и бассейнов. Мы всегда на связи при заживлении.</p> },
];

function Faq() {
  return (
    <section id="faq" className="rt-snap" style={{ background: "var(--bg-surface)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "110px 0" }}>
      <div className="rt-faq-grid" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px", width: "100%", display: "grid", gridTemplateColumns: "0.7fr 1.3fr", gap: "64px", alignItems: "start" }}>
        <div>
          <Kicker index="07" label="FAQ" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(30px, 3.4vw, 46px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Частые вопросы</h2>
        </div>
        <Accordion items={FAQ} />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CTA */
function Cta({ onBook }) {
  const { group, child } = useRevealGroup();
  return (
    <section id="cta" className="rt-snap" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 0" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src="./assets/img/work-mandala.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", filter: "grayscale(0.7) contrast(1.05) brightness(0.5)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,.86), rgba(10,10,12,.92))" }}></div>
      </div>
      <motion.div {...group} style={{ position: "relative", zIndex: 1, maxWidth: MAXW, margin: "0 auto", padding: "0 32px", textAlign: "center", width: "100%" }}>
        <motion.div {...child} style={{ display: "inline-block" }}><Kicker index="—" label="Запись открыта" /></motion.div>
        <motion.h2 {...child} style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(40px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.01em", margin: "26px 0 28px" }}>
          Создадим вашу<br />татуировку<span style={{ color: "var(--accent)" }}>.</span>
        </motion.h2>
        <motion.p {...child} style={{ fontSize: "var(--fs-lead)", color: "var(--gray-200)", maxWidth: "46ch", margin: "0 auto 40px", lineHeight: 1.55 }}>
          Запишитесь на бесплатную консультацию — обсудим идею, стиль и точную стоимость.
        </motion.p>
        <motion.div {...child} style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" onClick={onBook} iconRight="fas fa-arrow-right">Записаться сейчас</Button>
          <Button as="a" href="tel:+79689752099" variant="glass" size="lg" iconLeft="fas fa-phone">+7 (968) 975-20-99</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ----------------------------------------------------------------- Footer */
function Footer() {
  const socials = [
    ["fab fa-vk", "VK", "https://vk.com/ratedtattoo"],
    ["fab fa-yandex", "Яндекс Услуги", "https://uslugi.yandex.ru/profile/RatedTattoo-sprav1269715236"],
  ];
  return (
    <footer style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-hair)", padding: "72px 0 36px" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "48px" }} className="rt-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <img src={LOGO} alt="" style={{ height: "40px" }} />
              <span style={{ fontFamily: "var(--font-logo)", color: "var(--bone)", fontSize: "22px", letterSpacing: "0.16em" }}>RATED TATTOO</span>
            </div>
            <p style={{ color: "var(--text-muted)", margin: "0 0 22px", maxWidth: "38ch", lineHeight: 1.6 }}>Премиум татуировки в центре Москвы. Авторский подход и абсолютная безопасность.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {socials.map(([s, t, u]) => (
                <a key={s} href={u} title={t} aria-label={t} target="_blank" rel="noopener noreferrer" style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-hair)", color: "var(--text-body)", fontSize: "16px", transition: "all .2s" }}
                   onMouseEnter={(e) => { e.currentTarget.style.color = "var(--bone)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent)"; }}
                   onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-body)"; e.currentTarget.style.borderColor = "var(--border-hair)"; e.currentTarget.style.background = "transparent"; }}><i className={s} aria-hidden="true"></i></a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-body)", color: "var(--text-faint)", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 18px" }}>Навигация</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["#about", "О мастере"], ["#works", "Работы"], ["#benefits", "Преимущества"], ["#faq", "Вопросы"]].map(([h, l]) => (
                <li key={h}><a href={h} style={{ color: "var(--text-body)", fontSize: "15px" }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-body)", color: "var(--text-faint)", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 18px" }}>Контакты</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-body)", fontSize: "15px" }}>
              <li><a href="tel:+79689752099">+7 (968) 975-20-99</a></li>
              <li>Новинский бульвар, 10, стр. 1</li>
              <li>Пн–Вс · 11:00 – 21:00</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: "56px", paddingTop: "24px", borderTop: "1px solid var(--border-hair)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", color: "var(--text-faint)", fontSize: "12px", letterSpacing: "0.04em" }}>
          <span>© 2026 Тимур Тэд · Rated Tattoo</span>
          <span>Москва · с 2015</span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------- Booking modal */
/* Formspree endpoint. Submissions land in the Formspree dashboard / forwarded
   email for form xaqzkbwy. Plain fetch POST (no @formspree/* package — this
   site has no bundler), with loading + error states handled below. */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xaqzkbwy";

function BookingModal({ open, onClose }) {
  const [done, setDone] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({ name: "", phone: "", idea: "" });
  const openRef = React.useRef(open);
  openRef.current = open;                        /* всегда актуален на момент отправки: гейт в submit */
  const anim = useModalMotion();

  React.useEffect(() => {
    if (open) { setDone(false); setError(""); setSending(false); setForm({ name: "", phone: "", idea: "" }); }
  }, [open]);
  /* Как в лайтбоксе: лок ставим на открытии, снимаем в onExitComplete — иначе
     страница поехала бы под ещё видимой панелью. Второй эффект — страховка. */
  React.useEffect(() => {
    if (open) setScrollLock("booking", true);
  }, [open]);
  React.useEffect(() => () => setScrollLock("booking", false), []);
  /* Владение клавишами document-уровня: ставим на открытии, снимаем СРАЗУ на
     закрытии и при размонтировании — в отличие от лока скролла, который висит
     до конца выхода (почему именно так — см. bookingOnTop). */
  React.useEffect(() => {
    setBookingOnTop(open);
    return () => setBookingOnTop(false);
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    /* Гейт по openRef — парный к `pointerEvents:"none"` в useModalMotion: тот
       глушит только мышь, а выходящее поддерево живёт в DOM все ~0.24s, и
       Enter/Space на уже сфокусированной «Отправить заявку» всё это время даёт
       click. Без гейта отменённая по Esc заявка уходила в Formspree — и молча,
       модалки к тому моменту уже нет. Читаем ref, а не проп `open`: выходящее
       поддерево заморожено (AnimatePresence перерисовывает элемент последнего
       открытого рендера), и `open` в замыкании обработчика навсегда true. */
    if (!openRef.current || sending) return;
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Укажите имя и телефон.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          idea: form.idea,
          _subject: "Новая заявка с сайта Rated Tattoo",
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data && data.errors && data.errors.map((x) => x.message).join(", ");
        setError(msg || "Не удалось отправить заявку. Попробуйте позже или позвоните нам.");
      }
    } catch (_) {
      setError("Нет связи с сервером. Проверьте интернет или позвоните по телефону.");
    } finally {
      setSending(false);
    }
  };

  /* Как и лайтбокс, компонент не возвращает null: условный ребёнок AnimatePresence. */
  return (
    <AnimatePresence onExitComplete={() => setScrollLock("booking", false)}>
      {open ? (
        <motion.div key="booking" onClick={onClose} {...anim.overlay} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,5,6,.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <motion.div onClick={(e) => e.stopPropagation()} {...anim.panel} role="dialog" aria-modal="true" aria-label="Запись на консультацию" style={{ width: "100%", maxWidth: "460px", background: "var(--bg-surface)", border: "1px solid var(--border-hair)", padding: "40px", position: "relative" }}>
            <span style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "var(--accent)" }}></span>
            {done ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "44px", color: "var(--accent)", marginBottom: "16px" }}><i className="fas fa-circle-check"></i></div>
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", margin: "0 0 10px", fontSize: "26px", fontWeight: 600 }}>Заявка отправлена</h3>
                <p style={{ color: "var(--text-muted)", margin: "0 0 28px" }}>Тимур свяжется с вами в течение часа.</p>
                <Button variant="primary" block onClick={onClose}>Готово</Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "26px" }}>
                  <div>
                    <Kicker index="—" label="Запись" />
                    <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", margin: "14px 0 0", fontSize: "28px", fontWeight: 600, lineHeight: 1 }}>Бесплатная<br />консультация</h3>
                  </div>
                  <button type="button" onClick={onClose} aria-label="Закрыть" style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}><i className="fas fa-xmark"></i></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Input label="Имя" icon="fas fa-user" name="name" value={form.name} onChange={set("name")} disabled={sending} required placeholder="Как вас зовут?" />
                  <Input label="Телефон" icon="fas fa-phone" type="tel" name="phone" value={form.phone} onChange={set("phone")} disabled={sending} required placeholder="+7 (___) ___-__-__" />
                  <Input label="Опишите идею" as="textarea" name="idea" value={form.idea} onChange={set("idea")} disabled={sending} placeholder="Стиль, размер, место на теле…" />
                  {error ? (
                    <div role="alert" style={{ color: "var(--accent-soft)", fontSize: "13px", lineHeight: 1.5 }}>{error}</div>
                  ) : null}
                  <Button variant="primary" block type="submit" disabled={sending} iconRight={sending ? undefined : "fas fa-arrow-right"}>{sending ? "Отправка…" : "Отправить заявку"}</Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* --------------------------------------------------------------- Dot nav */
function DotNav() {
  const items = [["hero", "Главная"], ["about", "Мастер"], ["works", "Работы"], ["process", "Вживую"], ["services", "Услуги"], ["benefits", "Преимущества"], ["reviews", "Отзывы"], ["faq", "Вопросы"], ["cta", "Запись"]];
  const [active, setActive] = React.useState("hero");
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.5 });
    items.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="rt-dotnav" style={{ position: "fixed", right: "26px", top: "50%", transform: "translateY(-50%)", zIndex: 60, display: "flex", flexDirection: "column", gap: "15px", alignItems: "flex-end" }}>
      {items.map(([id, label]) => {
        const on = active === id;
        return (
          <motion.a key={id} href={"#" + id} className="rt-dot" title={label}
            initial="rest" animate="rest" whileHover="hover"
            style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end" }}>
            {/* Цвет покоя зависит от активной секции — при смене active Motion
                доводит его за те же .25s, что раньше делал CSS-transition. */}
            <motion.span className="rt-dot-label"
              variants={{ rest: { opacity: 0, x: 6, color: on ? C_BONE : C_MUTED }, hover: { opacity: 1, x: 0, color: C_BONE } }}
              transition={{ duration: 0.25, ease: EASE_CSS }}
              style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</motion.span>
            <span style={{ width: on ? "11px" : "7px", height: on ? "11px" : "7px", borderRadius: "50%", background: on ? "var(--accent)" : "transparent", border: "1px solid", borderColor: on ? "var(--accent)" : "var(--text-faint)", transition: "all .25s var(--ease-out)" }}></span>
          </motion.a>
        );
      })}
    </nav>
  );
}

export { Header, DotNav, Hero, About, Works, Process, Services, Benefits, Testimonials, Faq, Cta, Footer, BookingModal };
