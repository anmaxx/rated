/* Rated Tattoo — Landing UI kit sections (editorial / single-screen redesign)
   Full-viewport scroll-snap panels, entrance reveals, photo marquee works
   showcase, film grain. Composes design-system primitives from the bundle. */

const NS = window.RatedTattooDesignSystem_04b525;
const { Button, StarRating, Input, Accordion } = NS;

const LOGO = "./assets/logos/rated-logo-white.png";
const MAXW = "1240px";

const WORKS = [
  ["./assets/img/work-wolf.jpg", "Реалистичный волк", "реализм"],
  ["./assets/img/work-angel-sleeve.jpg", "Ангел · рукав", "реализм"],
  ["./assets/img/work-geisha.jpg", "Гейша", "ориентал"],
  ["./assets/img/work-mandala.jpg", "Геометрический орнамент", "орнамент"],
  ["./assets/img/work-oni-mask.jpg", "Маска они", "ориентал"],
  ["./assets/img/work-gaze.jpg", "Взгляд", "реализм"],
  ["./assets/img/work-warrior.jpg", "Северный воин", "реализм"],
  ["./assets/img/work-rat.jpg", "Уголовное дело", "нео-традишн"],
  ["./assets/img/work-catrina.jpg", "Катрина", "реализм"],
  ["./assets/img/work-bear-realism.webp", "Медведь — угроза", "реализм"],
  ["./assets/img/work-hourglass.jpg", "Песочные часы", "трэш-полька"],
  ["./assets/img/work-samurai.jpg", "Самурай", "ориентал"],
  ["./assets/img/work-girl-rose.jpg", "Девушка с розой", "реализм"],
  ["./assets/img/work-sphinx.webp", "Сфинкс", "графика"],
  ["./assets/img/work-robber.jpg", "Налётчик", "чикано"],
  ["./assets/img/work-sphynx-cat.jpg", "Кот сфинкс", "реализм"],
  ["./assets/img/work-tiger-sleeve.jpg", "Тигриный рукав", "реализм"],
  ["./assets/img/work-clown.jpg", "Клоун", "хоррор"],
  ["./assets/img/work-chief.jpg", "Вождь", "реализм"],
  ["./assets/img/work-bear-graphic.jpg", "Графический медведь", "графика"],
  ["./assets/img/work-portrait-peony.jpg", "Портрет с пионами", "реализм"],
  ["./assets/img/work-eagle-clock.jpg", "Орёл и время", "реализм"],
  ["./assets/img/work-eye.jpg", "Реалистичный глаз", "реализм"],
  ["./assets/img/work-lips.webp", "Перманентный татуаж", "татуаж"],
];

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
  const links = [["#about", "Мастер"], ["#works", "Работы"], ["#benefits", "Преимущества"], ["#faq", "Вопросы"]];
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
  return (
    <section id="hero" className="rt-snap" style={{ position: "relative", minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <video autoPlay muted loop playsInline poster="./assets/img/work-wolf.jpg"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "grayscale(0.6) contrast(1.08) brightness(0.8)" }}>
          <source src="./assets/video/hero.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "var(--scrim-hero)" }}></div>
      </div>

      <div className="rt-edge-label" style={{ position: "absolute", left: "32px", top: "50%", transform: "rotate(180deg)", writingMode: "vertical-rl", zIndex: 2, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        Rated Tattoo · Moscow · с 2015
      </div>

      <div className="rt-reveal rt-in" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: MAXW, margin: "0 auto", padding: "150px 32px 150px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: "26px" }}><Kicker index="ТОП-10" label="Тату-мастеров Москвы 2023" /></div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(46px, 7vw, 104px)", lineHeight: 0.9, letterSpacing: "-0.01em", margin: 0 }}>
          Элитные<br />татуировки<span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "20px" }}>
          — от мастера Тимура Тэда
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "36px", alignItems: "flex-end", justifyContent: "space-between", marginTop: "36px" }}>
          <p style={{ fontSize: "var(--fs-lead)", color: "var(--gray-200)", maxWidth: "42ch", lineHeight: 1.55, margin: 0 }}>
            Авторские татуировки в центре Москвы. Реализм, графика, орнаменты — каждая работа создаётся лично под клиента.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" onClick={onBook} iconRight="fas fa-arrow-right">Записаться</Button>
            <Button as="a" href="#works" variant="glass" size="lg">Работы</Button>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1, borderTop: "1px solid var(--border-hair)", background: "rgba(10,10,12,0.4)", backdropFilter: "blur(8px)" }}>
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
  const reasons = [
    ["Мировой уровень", "Участник международных тату-конвенций и лауреат премий. Постоянно совершенствую навыки."],
    ["Безопасность", "Только одноразовые материалы и стерилизация в автоклавах класса B."],
    ["Индивидуальный подход", "Каждый эскиз создаю лично, учитывая ваши пожелания и особенности тела."],
  ];
  const gallery = [
    ["./assets/img/about-stencil.jpg", "Процесс", "center"],
    ["./assets/img/studio.jpg", "Студия", "center 28%"],
  ];
  return (
    <section id="about" className="rt-snap" style={{ position: "relative", background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 0", overflow: "hidden" }}>
      {/* atmospheric oversize wordmark */}
      <div aria-hidden="true" style={{ position: "absolute", right: "-2.5%", top: "6%", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(140px, 23vw, 360px)", lineHeight: 0.8, color: "var(--bone)", opacity: 0.028, textTransform: "uppercase", letterSpacing: "-0.03em", pointerEvents: "none", userSelect: "none" }}>Тэд</div>

      <div className="rt-reveal rt-about-grid" style={{ position: "relative", maxWidth: MAXW, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "0.94fr 1.06fr", gap: "72px", alignItems: "center", width: "100%" }}>
        {/* ----- portrait ----- */}
        <div className="rt-about-media" style={{ position: "relative" }}>
          <div className="rt-edge-label" style={{ position: "absolute", left: "-30px", top: "50%", transform: "translateY(-50%) rotate(180deg)", writingMode: "vertical-rl", zIndex: 2, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--text-faint)" }}>
            Tattoo master · с 2015
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "12px", alignItems: "stretch" }}>
            <div style={{ position: "relative", paddingRight: "20px", paddingBottom: "20px" }}>
              <div style={{ position: "absolute", right: 0, bottom: 0, width: "calc(100% - 44px)", height: "calc(100% - 44px)", border: "1px solid var(--accent)", pointerEvents: "none" }}></div>
              <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3 / 5" }}>
                <img src="./assets/img/about-master.jpg" alt="Тимур Тэд — мастер Rated Tattoo за работой" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 16%", display: "block", filter: "grayscale(0.35) contrast(1.06)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.66), rgba(10,10,12,0) 44%)", pointerEvents: "none" }}></div>
              </div>
              <div style={{ position: "absolute", left: "-2px", bottom: "34px", background: "var(--accent)", color: "var(--white)", padding: "13px 20px 15px" }}>
                <div style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", fontWeight: 600, fontSize: "23px", lineHeight: 0.92, letterSpacing: "0.02em" }}>Тимур Тэд</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.88, marginTop: "5px" }}>основатель · мастер</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {gallery.map(([src, cap, pos]) => (
                <figure key={cap} style={{ margin: 0, position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
                  <img src={src} alt={cap} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, display: "block", filter: "grayscale(0.4) contrast(1.05)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.72), rgba(10,10,12,0) 52%)", pointerEvents: "none" }}></div>
                  <figcaption style={{ position: "absolute", left: "11px", bottom: "9px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--bone)" }}>{cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        {/* ----- profile copy ----- */}
        <div>
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
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Works (marquee) */
function WorkTile({ w }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", flexShrink: 0, width: "clamp(248px, 27vw, 348px)", height: "clamp(330px, 40vw, 500px)", margin: "0 8px", overflow: "hidden", background: "var(--ink-800)" }}>
      <img src={w[0]} alt={w[1]} loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none", pointerEvents: "none", filter: "grayscale(0.5) contrast(1.06)", transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform .7s var(--ease-out), filter .4s" }} />
      <div style={{ position: "absolute", inset: 0, background: "var(--scrim-hover)", opacity: hover ? 1 : 0.5, transition: "opacity .35s" }}></div>
      <div style={{ position: "absolute", top: "14px", left: "14px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--bone)", background: "rgba(10,10,12,.5)", padding: "5px 9px", backdropFilter: "blur(4px)" }}>{w[2]}</div>
      <h3 style={{ position: "absolute", left: "16px", right: "16px", bottom: "16px", fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "18px", fontWeight: 500, margin: 0, transform: hover ? "translateY(0)" : "translateY(6px)", opacity: hover ? 1 : 0.9, transition: "all .35s" }}>{w[1]}</h3>
    </div>
  );
}

function Works({ onBook }) {
  const items = [...WORKS, ...WORKS];
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const progRef = React.useRef(null);
  const S = React.useRef({ offset: 0, setW: 1, paused: false, dragging: false, lastX: 0, tween: 0 });

  React.useEffect(() => {
    const track = trackRef.current;
    const measure = () => { S.current.setW = Math.max(1, track.scrollWidth / 2); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, last = performance.now();
    const loop = (now) => {
      const s = S.current;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (Math.abs(s.tween) > 0.5) {
        const step = s.tween * Math.min(1, dt * 7);
        s.offset += step; s.tween -= step;
      } else {
        s.tween = 0;
        if (!s.paused && !s.dragging && !reduce) s.offset += 34 * dt;
      }
      s.offset = ((s.offset % s.setW) + s.setW) % s.setW;
      track.style.transform = "translate3d(" + (-s.offset) + "px,0,0)";
      if (progRef.current) progRef.current.style.left = ((s.offset / s.setW) * 82) + "%";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const nudge = (dir) => { S.current.tween += dir * ((wrapRef.current ? wrapRef.current.clientWidth : 600) * 0.6); };
  const down = (e) => { const s = S.current; s.dragging = true; s.lastX = e.clientX; s.tween = 0; wrapRef.current.style.cursor = "grabbing"; if (wrapRef.current.setPointerCapture) wrapRef.current.setPointerCapture(e.pointerId); };
  const move = (e) => { const s = S.current; if (!s.dragging) return; s.offset -= (e.clientX - s.lastX); s.lastX = e.clientX; };
  const up = (e) => { const s = S.current; if (!s.dragging) return; s.dragging = false; wrapRef.current.style.cursor = "grab"; try { wrapRef.current.releasePointerCapture(e.pointerId); } catch (_) {} };

  const ctrl = { width: "46px", height: "46px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "var(--text-body)", border: "1px solid var(--border-hair)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "14px", transition: "all .2s" };
  const ctrlOn = (e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--white)"; };
  const ctrlOff = (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-hair)"; e.currentTarget.style.color = "var(--text-body)"; };

  return (
    <section id="works" className="rt-snap" style={{ background: "var(--bg-surface)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 0", overflow: "hidden" }}>
      <div className="rt-reveal" style={{ maxWidth: MAXW, margin: "0 auto 40px", padding: "0 32px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <Kicker index="02" label="Работы" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Избранное</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button aria-label="Предыдущие работы" onClick={() => nudge(-1)} onMouseEnter={ctrlOn} onMouseLeave={ctrlOff} style={ctrl}><i className="fas fa-arrow-left" aria-hidden="true"></i></button>
          <button aria-label="Следующие работы" onClick={() => nudge(1)} onMouseEnter={ctrlOn} onMouseLeave={ctrlOff} style={ctrl}><i className="fas fa-arrow-right" aria-hidden="true"></i></button>
          <div style={{ width: "1px", height: "28px", background: "var(--border-hair)", margin: "0 6px" }}></div>
          <Button variant="ghost" onClick={onBook} iconRight="fas fa-arrow-right">Записаться на сеанс</Button>
        </div>
      </div>
      <div ref={wrapRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onMouseEnter={() => { S.current.paused = true; }} onMouseLeave={() => { S.current.paused = false; }}
        style={{ overflow: "hidden", cursor: "grab", touchAction: "pan-y", userSelect: "none" }}>
        <div ref={trackRef} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
          {items.map((w, i) => <WorkTile key={i} w={w} />)}
        </div>
      </div>
      <div className="rt-reveal" style={{ maxWidth: MAXW, margin: "30px auto 0", padding: "0 32px", width: "100%", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", flex: 1, height: "2px", background: "var(--border-hair)", overflow: "hidden" }}>
          <div ref={progRef} style={{ position: "absolute", top: 0, left: 0, height: "2px", width: "18%", background: "var(--accent)" }}></div>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-faint)", whiteSpace: "nowrap" }}>Потяните или листайте&nbsp;→</span>
      </div>
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
  const [hover, setHover] = React.useState(-1);
  return (
    <section id="services" className="rt-snap" style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", padding: "110px 0" }}>
      <div className="rt-reveal" style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <Kicker index="03" label="Услуги" />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Что я делаю</h2>
          </div>
          <Button variant="ghost" onClick={onBook} iconRight="fas fa-arrow-right">Рассчитать стоимость</Button>
        </div>
        <div style={{ borderTop: "1px solid var(--border-hair)" }}>
          {SERVICES.map(([title, body], i) => (
            <div key={title}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
              style={{ display: "grid", gridTemplateColumns: "70px 1.1fr 1.4fr 40px", gap: "28px", alignItems: "center", padding: "30px 16px", borderBottom: "1px solid var(--border-hair)", background: hover === i ? "rgba(236,231,223,0.03)" : "transparent", transition: "background .25s ease" }} className="rt-svc-row">
              <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600, color: hover === i ? "var(--accent)" : "var(--text-faint)", transition: "color .25s" }}>{String(i + 1).padStart(2, "0")}</span>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--bone)", textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 500, margin: 0 }}>{title}</h3>
              <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6, fontSize: "15px" }} className="rt-svc-desc">{body}</p>
              <span style={{ justifySelf: "end", color: hover === i ? "var(--accent)" : "var(--text-faint)", fontSize: "18px", transform: hover === i ? "translateX(4px)" : "translateX(0)", transition: "transform .25s, color .25s" }}><i className="fas fa-arrow-right"></i></span>
            </div>
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
      <div className="rt-reveal" style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ marginBottom: "48px" }}>
          <Kicker index="04" label="Преимущества" />
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
      <div className="rt-reveal" style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 32px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "44px" }}>
          <div>
            <Kicker index="05" label="Отзывы" />
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
      <div className="rt-reveal rt-faq-grid" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px", width: "100%", display: "grid", gridTemplateColumns: "0.7fr 1.3fr", gap: "64px", alignItems: "start" }}>
        <div>
          <Kicker index="06" label="FAQ" />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(30px, 3.4vw, 46px)", lineHeight: 1, letterSpacing: "-0.01em", margin: "20px 0 0" }}>Частые вопросы</h2>
        </div>
        <Accordion items={FAQ} />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CTA */
function Cta({ onBook }) {
  return (
    <section id="cta" className="rt-snap" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 0" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src="./assets/img/work-mandala.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", filter: "grayscale(0.7) contrast(1.05) brightness(0.5)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,12,.86), rgba(10,10,12,.92))" }}></div>
      </div>
      <div className="rt-reveal" style={{ position: "relative", zIndex: 1, maxWidth: MAXW, margin: "0 auto", padding: "0 32px", textAlign: "center", width: "100%" }}>
        <div style={{ display: "inline-block" }}><Kicker index="—" label="Запись открыта" /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--bone)", textTransform: "uppercase", fontSize: "clamp(40px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.01em", margin: "26px 0 28px" }}>
          Создадим вашу<br />татуировку<span style={{ color: "var(--accent)" }}>.</span>
        </h2>
        <p style={{ fontSize: "var(--fs-lead)", color: "var(--gray-200)", maxWidth: "46ch", margin: "0 auto 40px", lineHeight: 1.55 }}>
          Запишитесь на бесплатную консультацию — обсудим идею, стиль и точную стоимость.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" onClick={onBook} iconRight="fas fa-arrow-right">Записаться сейчас</Button>
          <Button as="a" href="tel:+79689752099" variant="glass" size="lg" iconLeft="fas fa-phone">+7 (968) 975-20-99</Button>
        </div>
      </div>
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

  React.useEffect(() => {
    if (open) { setDone(false); setError(""); setSending(false); setForm({ name: "", phone: "", idea: "" }); }
  }, [open]);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
    if (sending) return;
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

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,5,6,.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Запись на консультацию" style={{ width: "100%", maxWidth: "460px", background: "var(--bg-surface)", border: "1px solid var(--border-hair)", padding: "40px", position: "relative" }}>
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
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Dot nav */
function DotNav() {
  const items = [["hero", "Главная"], ["about", "Мастер"], ["works", "Работы"], ["services", "Услуги"], ["benefits", "Преимущества"], ["reviews", "Отзывы"], ["faq", "Вопросы"], ["cta", "Запись"]];
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
          <a key={id} href={"#" + id} className="rt-dot" title={label} style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end" }}>
            <span className="rt-dot-label" style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: on ? "var(--bone)" : "var(--text-muted)", opacity: 0, transform: "translateX(6px)", transition: "opacity .25s, transform .25s, color .25s", whiteSpace: "nowrap" }}>{label}</span>
            <span style={{ width: on ? "11px" : "7px", height: on ? "11px" : "7px", borderRadius: "50%", background: on ? "var(--accent)" : "transparent", border: "1px solid", borderColor: on ? "var(--accent)" : "var(--text-faint)", transition: "all .25s var(--ease-out)" }}></span>
          </a>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Header, Hero, About, Works, Services, Benefits, Testimonials, Faq, Cta, Footer, BookingModal, DotNav });
