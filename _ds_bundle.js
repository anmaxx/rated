/* @ds-bundle: {"format":3,"namespace":"RatedTattooDesignSystem_04b525","components":[{"name":"PortfolioCard","sourcePath":"components/content/PortfolioCard.jsx"},{"name":"SectionHeading","sourcePath":"components/content/SectionHeading.jsx"},{"name":"ServiceCard","sourcePath":"components/content/ServiceCard.jsx"},{"name":"StarRating","sourcePath":"components/content/StarRating.jsx"},{"name":"TestimonialCard","sourcePath":"components/content/TestimonialCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Accordion","sourcePath":"components/forms/Accordion.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/content/PortfolioCard.jsx":"41252ec7df43","components/content/SectionHeading.jsx":"e7b98b1f4b73","components/content/ServiceCard.jsx":"cdacfd8c4807","components/content/StarRating.jsx":"2bdc0e642aa9","components/content/TestimonialCard.jsx":"a604f62f2b98","components/core/Badge.jsx":"11c16af52f69","components/core/Button.jsx":"085568cb2f1e","components/core/Card.jsx":"a03072aba70a","components/forms/Accordion.jsx":"7c2f944bad57","components/forms/Input.jsx":"643b266e21ed","ui_kits/landing/sections.jsx":"faf0f2616f86"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RatedTattooDesignSystem_04b525 = window.RatedTattooDesignSystem_04b525 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/PortfolioCard.jsx
try { (() => {
/**
 * Rated Tattoo — PortfolioCard
 * Tattoo photo tile. Scales on hover (bounce easing) and reveals a bottom-up
 * scrim with title + meta, exactly like the portfolio grid.
 */
function PortfolioCard({
  image,
  title,
  meta,
  category,
  className = "",
  style = {}
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      cursor: "pointer",
      transform: hover ? "scale(1.03)" : "scale(1)",
      transition: "transform var(--dur-slow) var(--ease-bounce)",
      ...style
    },
    "data-category": category
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    loading: "lazy",
    style: {
      width: "100%",
      height: "320px",
      objectFit: "cover",
      display: "block",
      filter: "grayscale(0.12) contrast(1.04)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--scrim-hover)",
      opacity: hover ? 1 : 0,
      transition: "opacity var(--dur-base) var(--ease-out)",
      display: "flex",
      alignItems: "flex-end",
      padding: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--white)",
      fontSize: "var(--fs-h4)",
      margin: "0 0 4px"
    }
  }, title), meta ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--gray-300)",
      fontSize: "var(--fs-sm)",
      margin: 0
    }
  }, meta) : null)));
}
Object.assign(__ds_scope, { PortfolioCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PortfolioCard.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionHeading.jsx
try { (() => {
/**
 * Rated Tattoo — SectionHeading
 * Centered (or left) section intro: optional eyebrow, a display title where a
 * highlighted word renders in coral, and a muted lead paragraph.
 */
function SectionHeading({
  eyebrow,
  title,
  highlight,
  lead,
  align = "center",
  className = "",
  style = {}
}) {
  // Render title, replacing `highlight` substring with a colored span.
  let titleNode = title;
  if (highlight && typeof title === "string" && title.includes(highlight)) {
    const [before, after] = title.split(highlight);
    titleNode = /*#__PURE__*/React.createElement(React.Fragment, null, before, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--accent-soft)"
      }
    }, highlight), after);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      textAlign: align,
      maxWidth: align === "center" ? "780px" : "none",
      marginInline: align === "center" ? "auto" : 0,
      ...style
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 700,
      fontSize: "var(--fs-xs)",
      letterSpacing: "var(--ls-eyebrow)",
      textTransform: "uppercase",
      color: "var(--accent)",
      marginBottom: "var(--space-4)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--text-strong)",
      fontSize: "var(--fs-h2)",
      lineHeight: "var(--lh-snug)",
      letterSpacing: "var(--ls-tight)",
      margin: 0
    }
  }, titleNode), lead ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      fontSize: "var(--fs-lead)",
      lineHeight: "var(--lh-normal)",
      margin: "var(--space-5) auto 0",
      maxWidth: "640px"
    }
  }, lead) : null);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/content/ServiceCard.jsx
try { (() => {
/**
 * Rated Tattoo — ServiceCard
 * Icon + title + description tile. Red top accent + hover lift, matching the
 * "Мои услуги" / "Преимущества" grids.
 */
function ServiceCard({
  icon = "fas fa-paint-brush",
  title,
  children,
  className = "",
  style = {}
}) {
  const [lift, setLift] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    onMouseEnter: () => setLift(true),
    onMouseLeave: () => setLift(false),
    style: {
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-lg)",
      borderTop: "var(--border-accent-top) solid var(--accent-soft)",
      padding: "var(--space-8)",
      boxShadow: lift ? "var(--shadow-lift)" : "var(--shadow-sm)",
      transform: lift ? "translateY(-8px)" : "translateY(0)",
      transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--accent-soft)",
      fontSize: "30px",
      marginBottom: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--text-strong)",
      fontSize: "var(--fs-h4)",
      margin: "0 0 var(--space-3)"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      fontSize: "var(--fs-body)",
      margin: 0,
      lineHeight: "var(--lh-normal)"
    }
  }, children));
}
Object.assign(__ds_scope, { ServiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ServiceCard.jsx", error: String((e && e.message) || e) }); }

// components/content/StarRating.jsx
try { (() => {
/**
 * Rated Tattoo — StarRating
 * Row of Font Awesome stars in the brand's review yellow, optional numeric
 * score and count. Display-only.
 */
function StarRating({
  value = 5,
  max = 5,
  score,
  count,
  size = "16px",
  className = "",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--star)",
      fontSize: size,
      letterSpacing: "2px"
    }
  }, Array.from({
    length: max
  }).map((_, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    className: i < value ? "fas fa-star" : "far fa-star",
    "aria-hidden": "true"
  }))), score != null ? /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text-strong)",
      fontSize: "var(--fs-sm)"
    }
  }, score) : null, count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: "var(--fs-sm)"
    }
  }, "(", count, ")") : null);
}
Object.assign(__ds_scope, { StarRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StarRating.jsx", error: String((e && e.message) || e) }); }

// components/content/TestimonialCard.jsx
try { (() => {
/**
 * Rated Tattoo — TestimonialCard
 * Glass review card: stars, italic quote, avatar + name + work. Designed to
 * sit on the coral testimonial band (translucent white) or on dark surfaces.
 */
function TestimonialCard({
  quote,
  name,
  work,
  avatar,
  score = "5.0",
  onDark = false,
  className = "",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      background: onDark ? "var(--bg-raised)" : "rgba(255,255,255,0.10)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-8)",
      border: onDark ? "1px solid var(--border-subtle)" : "1px solid rgba(255,255,255,0.14)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--star)",
      fontSize: "18px",
      letterSpacing: "2px"
    }
  }, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--white)"
    }
  }, score)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontStyle: "italic",
      color: "var(--white)",
      margin: "0 0 var(--space-6)",
      lineHeight: "var(--lh-normal)"
    }
  }, "\u201C", quote, "\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      overflow: "hidden",
      background: "var(--ink-600)",
      flexShrink: 0
    }
  }, avatar ? /*#__PURE__*/React.createElement("img", {
    src: avatar,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--white)",
      margin: 0,
      fontSize: "var(--fs-h4)"
    }
  }, name), work ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.7)",
      fontSize: "var(--fs-sm)",
      margin: 0
    }
  }, work) : null)));
}
Object.assign(__ds_scope, { TestimonialCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TestimonialCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Rated Tattoo — Badge
 * Two flavours: an uppercase tracked "eyebrow" kicker (accent text) and a
 * pill stat-chip with optional icon (the dark glass chips in the hero).
 */
function Badge({
  children,
  variant = "eyebrow",
  icon,
  iconColor,
  className = "",
  style = {},
  ...rest
}) {
  if (variant === "eyebrow") {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: className,
      style: {
        display: "inline-block",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: "var(--fs-xs)",
        letterSpacing: "var(--ls-eyebrow)",
        textTransform: "uppercase",
        color: "var(--accent)",
        ...style
      }
    }, rest), children);
  }

  // pill stat chip
  const pillBg = {
    chip: "rgba(0,0,0,0.5)",
    solid: "var(--accent)",
    soft: "var(--bg-raised)"
  }[variant] || "rgba(0,0,0,0.5)";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "var(--radius-pill)",
      background: pillBg,
      color: variant === "solid" ? "var(--white)" : "var(--text-strong)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-sm)",
      fontWeight: 600,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    style: {
      color: iconColor || "var(--accent)"
    },
    "aria-hidden": "true"
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Rated Tattoo — Button
 * Pill-shaped action with the studio's red accent. Variants mirror the
 * landing site: solid accent, outline (border-2), translucent glass (on
 * imagery), and a quiet ghost. Optionally renders as an <a>.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  href,
  iconLeft,
  iconRight,
  block = false,
  disabled = false,
  className = "",
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "10px 18px",
      fontSize: "12px"
    },
    md: {
      padding: "14px 26px",
      fontSize: "13px"
    },
    lg: {
      padding: "18px 36px",
      fontSize: "15px"
    }
  };
  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: sizes[size].fontSize,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1,
    borderRadius: "var(--radius-sm)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--white)"
    },
    secondary: {
      background: "var(--bone)",
      color: "var(--ink-950)"
    },
    outline: {
      background: "transparent",
      color: "var(--bone)",
      borderColor: "color-mix(in srgb, var(--bone) 45%, transparent)"
    },
    glass: {
      background: "rgba(236,231,223,0.10)",
      color: "var(--bone)",
      borderColor: "rgba(236,231,223,0.25)",
      backdropFilter: "blur(6px)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-body)"
    }
  };
  const hoverByVariant = {
    primary: (e, on) => {
      e.currentTarget.style.background = on ? "var(--accent-hover)" : "var(--accent)";
    },
    secondary: (e, on) => {
      e.currentTarget.style.background = on ? "var(--white)" : "var(--bone)";
    },
    outline: (e, on) => {
      e.currentTarget.style.background = on ? "var(--bone)" : "transparent";
      e.currentTarget.style.color = on ? "var(--ink-950)" : "var(--bone)";
      e.currentTarget.style.borderColor = on ? "var(--bone)" : "color-mix(in srgb, var(--bone) 45%, transparent)";
    },
    glass: (e, on) => {
      e.currentTarget.style.background = on ? "rgba(236,231,223,0.20)" : "rgba(236,231,223,0.10)";
    },
    ghost: (e, on) => {
      e.currentTarget.style.color = on ? "var(--accent)" : "var(--text-body)";
    }
  };
  const onEnter = e => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(-1px)";
    hoverByVariant[variant]?.(e, true);
  };
  const onLeave = e => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(0)";
    hoverByVariant[variant]?.(e, false);
  };
  const Tag = as === "a" || href ? "a" : "button";
  const props = Tag === "a" ? {
    href
  } : {
    disabled
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: className,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onMouseEnter: onEnter,
    onMouseLeave: onLeave
  }, props, rest), iconLeft ? /*#__PURE__*/React.createElement("i", {
    className: iconLeft,
    "aria-hidden": "true"
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement("i", {
    className: iconRight,
    "aria-hidden": "true"
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Rated Tattoo — Card
 * Generic dark surface container. `accentTop` adds the red top border seen on
 * the service cards; `hover` enables the lift used across the site.
 */
function Card({
  children,
  accentTop = false,
  hover = false,
  padding = "var(--space-8)",
  className = "",
  style = {},
  ...rest
}) {
  const [lift, setLift] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    onMouseEnter: () => hover && setLift(true),
    onMouseLeave: () => hover && setLift(false),
    style: {
      background: "var(--bg-raised)",
      borderRadius: "var(--radius-lg)",
      borderTop: accentTop ? "var(--border-accent-top) solid var(--accent)" : "1px solid var(--border-subtle)",
      padding,
      boxShadow: lift ? "var(--shadow-lift)" : "var(--shadow-sm)",
      transform: lift ? "translateY(-8px)" : "translateY(0)",
      transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Accordion.jsx
try { (() => {
/**
 * Rated Tattoo — Accordion
 * FAQ list. Each item is a question button with a +/− toggle that expands a
 * dark answer panel. Single-open by default; controlled internally.
 *
 * items: [{ q: string, a: ReactNode }]
 */
function Accordion({
  items = [],
  allowMultiple = false,
  className = "",
  style = {}
}) {
  const [open, setOpen] = React.useState(() => new Set());
  const toggle = i => {
    setOpen(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);else next.add(i);
      return next;
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, items.map((it, i) => {
    const isOpen = open.has(i);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderTop: "1px solid var(--border-hair)",
        ...(i === items.length - 1 ? {
          borderBottom: "1px solid var(--border-hair)"
        } : {})
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggle(i),
      "aria-expanded": isOpen,
      style: {
        width: "100%",
        textAlign: "left",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-6)",
        padding: "var(--space-6) 0",
        background: "transparent",
        color: isOpen ? "var(--text-strong)" : "var(--text-body)",
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.01em",
        fontSize: "var(--fs-h4)",
        border: "none",
        cursor: "pointer",
        transition: "color var(--dur-fast)"
      }
    }, /*#__PURE__*/React.createElement("span", null, it.q), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--accent)",
        fontSize: "20px",
        lineHeight: 1,
        flexShrink: 0,
        transform: isOpen ? "rotate(45deg)" : "rotate(0)",
        transition: "transform var(--dur-base) var(--ease-out)"
      }
    }, "+")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        transition: "grid-template-rows var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 0 var(--space-6)",
        color: "var(--text-muted)",
        lineHeight: "var(--lh-normal)",
        maxWidth: "62ch"
      }
    }, it.a))));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Rated Tattoo — Input
 * Dark field with optional leading icon and label. Red focus ring. Works for
 * text, tel, email; pass `as="textarea"` for multiline.
 */
function Input({
  label,
  icon,
  as = "input",
  id,
  className = "",
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const Tag = as;
  const fieldId = id || (label ? `rt-${String(label).replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-sm)",
      fontWeight: 600,
      color: "var(--text-body)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true",
    style: {
      position: "absolute",
      left: "16px",
      color: focus ? "var(--accent)" : "var(--text-muted)",
      fontSize: "14px",
      transition: "color var(--dur-fast)"
    }
  }) : null, /*#__PURE__*/React.createElement(Tag, _extends({
    id: fieldId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    rows: as === "textarea" ? 4 : undefined,
    style: {
      width: "100%",
      background: "var(--bg-input)",
      color: "var(--text-strong)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-body)",
      padding: icon ? "14px 16px 14px 42px" : "14px 16px",
      borderRadius: "var(--radius-md)",
      border: `1px solid ${focus ? "var(--accent)" : "var(--border-subtle)"}`,
      boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
      outline: "none",
      resize: as === "textarea" ? "vertical" : undefined,
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, rest))));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/sections.jsx
try { (() => {
/* Rated Tattoo — Landing UI kit sections (editorial / single-screen redesign)
   Full-viewport scroll-snap panels, entrance reveals, photo marquee works
   showcase, film grain. Composes design-system primitives from the bundle. */

const NS = window.RatedTattooDesignSystem_04b525;
const {
  Button,
  StarRating,
  Input,
  Accordion
} = NS;
const LOGO = "../../assets/logos/rated-logo-white.png";
const MAXW = "1240px";
const WORKS = [["../../assets/img/work-wolf.jpg", "Реалистичный волк", "реализм"], ["../../assets/img/work-mandala.jpg", "Геометрический орнамент", "орнамент"], ["../../assets/img/work-bear-realism.webp", "Медведь — угроза", "реализм"], ["../../assets/img/work-sphinx.webp", "Сфинкс", "графика"], ["../../assets/img/work-bear-graphic.jpg", "Графический медведь", "графика"], ["../../assets/img/work-lips.webp", "Перманентный татуаж", "татуаж"]];

/* ---------------------------------------------------------------- helpers */
function Kicker({
  index,
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      fontFamily: "var(--font-body)",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.22em",
      textTransform: "uppercase"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, index), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "28px",
      height: "1px",
      background: color === "dark" ? "rgba(10,10,12,.25)" : "var(--border-hair)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: color === "dark" ? "rgba(10,10,12,.6)" : "var(--text-muted)"
    }
  }, label));
}

/* ----------------------------------------------------------------- Header */
function Header({
  onBook
}) {
  const [solid, setSolid] = React.useState(false);
  React.useEffect(() => {
    const sc = document.querySelector(".rt-scroll") || window;
    const onScroll = () => setSolid((sc.scrollTop || window.scrollY) > 40);
    sc.addEventListener("scroll", onScroll);
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["#about", "Мастер"], ["#works", "Работы"], ["#benefits", "Преимущества"], ["#faq", "Вопросы"]];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: solid ? "rgba(10,10,12,0.82)" : "transparent",
      backdropFilter: solid ? "blur(14px)" : "none",
      borderBottom: solid ? "1px solid var(--border-hair)" : "1px solid transparent",
      transition: "background .35s ease, border-color .35s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      height: "72px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO,
    alt: "Rated Tattoo",
    style: {
      height: "38px",
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-logo)",
      color: "var(--bone)",
      fontSize: "20px",
      letterSpacing: "0.16em"
    }
  }, "RATED")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "36px"
    },
    className: "rt-nav"
  }, links.map(([href, label]) => /*#__PURE__*/React.createElement("a", {
    key: href,
    href: href,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-body)",
      transition: "color .2s"
    },
    onMouseEnter: e => e.currentTarget.style.color = "var(--bone)",
    onMouseLeave: e => e.currentTarget.style.color = "var(--text-body)"
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "22px"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:+79689752099",
    className: "rt-phone",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      fontWeight: 600,
      color: "var(--bone)",
      letterSpacing: "0.02em"
    }
  }, "+7 (968) 975-20-99"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: onBook
  }, "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F"))));
}

/* ------------------------------------------------------------------- Hero */
function Hero({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "hero",
    className: "rt-snap",
    style: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("video", {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    poster: "../../assets/img/work-wolf.jpg",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      filter: "grayscale(0.6) contrast(1.08) brightness(0.8)"
    }
  }, /*#__PURE__*/React.createElement("source", {
    src: "../../assets/video/hero.mp4",
    type: "video/mp4"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--scrim-hero)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "rt-edge-label",
    style: {
      position: "absolute",
      left: "32px",
      top: "50%",
      transform: "rotate(180deg)",
      writingMode: "vertical-rl",
      zIndex: 2,
      fontFamily: "var(--font-body)",
      fontSize: "11px",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Tattoo & Body \xB7 Moscow \xB7 \u0441 2015"), /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal rt-in",
    style: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "150px 32px 150px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "26px"
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    index: "\u0422\u041E\u041F-10",
    label: "\u0422\u0430\u0442\u0443-\u043C\u0430\u0441\u0442\u0435\u0440\u043E\u0432 \u041C\u043E\u0441\u043A\u0432\u044B 2023"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(46px, 7vw, 104px)",
      lineHeight: 0.9,
      letterSpacing: "-0.01em",
      margin: 0
    }
  }, "\u042D\u043B\u0438\u0442\u043D\u044B\u0435", /*#__PURE__*/React.createElement("br", null), "\u0442\u0430\u0442\u0443\u0438\u0440\u043E\u0432\u043A\u0438", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      marginTop: "20px"
    }
  }, "\u2014 \u043E\u0442 \u043C\u0430\u0441\u0442\u0435\u0440\u0430 \u0422\u0438\u043C\u0443\u0440\u0430 \u0422\u044D\u0434\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "36px",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: "36px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-lead)",
      color: "var(--gray-200)",
      maxWidth: "42ch",
      lineHeight: 1.55,
      margin: 0
    }
  }, "\u0410\u0432\u0442\u043E\u0440\u0441\u043A\u0438\u0435 \u0442\u0430\u0442\u0443\u0438\u0440\u043E\u0432\u043A\u0438 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u041C\u043E\u0441\u043A\u0432\u044B. \u0420\u0435\u0430\u043B\u0438\u0437\u043C, \u0433\u0440\u0430\u0444\u0438\u043A\u0430, \u043E\u0440\u043D\u0430\u043C\u0435\u043D\u0442\u044B \u2014 \u043A\u0430\u0436\u0434\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u0451\u0442\u0441\u044F \u043B\u0438\u0447\u043D\u043E \u043F\u043E\u0434 \u043A\u043B\u0438\u0435\u043D\u0442\u0430."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "14px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onBook,
    iconRight: "fas fa-arrow-right"
  }, "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F"), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: "#works",
    variant: "glass",
    size: "lg"
  }, "\u0420\u0430\u0431\u043E\u0442\u044B")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      borderTop: "1px solid var(--border-hair)",
      background: "rgba(10,10,12,0.4)",
      backdropFilter: "blur(8px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)"
    },
    className: "rt-stats"
  }, [["10+", "лет практики"], ["150+", "работ в портфолио"], ["127", "отзывов · 5.0"], ["100%", "стерильность"]].map(([n, l], i) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      padding: "20px 24px",
      borderLeft: i === 0 ? "none" : "1px solid var(--border-hair)",
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "30px",
      fontWeight: 600,
      color: "var(--bone)",
      lineHeight: 1
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, l))))));
}

/* ------------------------------------------------------------------ About */
function About() {
  const reasons = [["Мировой уровень", "Участник международных тату-конвенций и лауреат премий. Постоянно совершенствую навыки."], ["Безопасность", "Только одноразовые материалы и стерилизация в автоклавах класса B."], ["Индивидуальный подход", "Каждый эскиз создаю лично, учитывая ваши пожелания и особенности тела."]];
  return /*#__PURE__*/React.createElement("section", {
    id: "about",
    className: "rt-snap",
    style: {
      background: "var(--bg-base)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "120px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal rt-about-grid",
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      display: "grid",
      gridTemplateColumns: "0.9fr 1.1fr",
      gap: "72px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      paddingRight: "20px",
      paddingBottom: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: "calc(100% - 44px)",
      height: "calc(100% - 44px)",
      border: "1px solid var(--accent)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      aspectRatio: "4 / 5"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/img/studio.jpg",
    alt: "\u0422\u0438\u043C\u0443\u0440 \u0422\u044D\u0434",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center 28%",
      display: "block",
      filter: "grayscale(0.4) contrast(1.05)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "0",
      bottom: "20px",
      background: "var(--accent)",
      color: "#fff",
      padding: "16px 22px",
      fontFamily: "var(--font-display)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      fontWeight: 600,
      fontSize: "15px",
      lineHeight: 1.1
    }
  }, "\u0421\u0442\u0443\u0434\u0438\u044F Rated", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "11px",
      letterSpacing: "0.14em",
      opacity: 0.85
    }
  }, "\u0446\u0435\u043D\u0442\u0440 \u041C\u043E\u0441\u043A\u0432\u044B"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "01",
    label: "\u041E \u043C\u0430\u0441\u0442\u0435\u0440\u0435"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(36px, 4.5vw, 60px)",
      lineHeight: 0.98,
      letterSpacing: "-0.01em",
      margin: "24px 0 22px"
    }
  }, "\u042D\u0442\u0430\u043B\u043E\u043D", /*#__PURE__*/React.createElement("br", null), "\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-lead)",
      color: "var(--text-body)",
      lineHeight: 1.6,
      margin: "0 0 40px",
      maxWidth: "52ch"
    }
  }, "\u042F \u0441\u043E\u0437\u0434\u0430\u044E \u043D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u0442\u0430\u0442\u0443\u0438\u0440\u043E\u0432\u043A\u0438, \u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0431\u0443\u0434\u0443\u0442 \u0440\u0430\u0434\u043E\u0432\u0430\u0442\u044C \u0432\u0430\u0441 \u0432\u0441\u044E \u0436\u0438\u0437\u043D\u044C."), /*#__PURE__*/React.createElement("div", null, reasons.map(([h, p], i) => /*#__PURE__*/React.createElement("div", {
    key: h,
    style: {
      display: "grid",
      gridTemplateColumns: "48px 1fr",
      gap: "8px 20px",
      padding: "24px 0",
      borderTop: "1px solid var(--border-hair)",
      ...(i === reasons.length - 1 ? {
        borderBottom: "1px solid var(--border-hair)"
      } : {})
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--accent)",
      fontSize: "20px",
      fontWeight: 600
    }
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      fontSize: "19px",
      fontWeight: 500,
      margin: 0,
      alignSelf: "center"
    }
  }, h), /*#__PURE__*/React.createElement("p", {
    style: {
      gridColumn: "2",
      color: "var(--text-muted)",
      margin: 0,
      lineHeight: 1.6
    }
  }, p)))))));
}

/* ------------------------------------------------------- Works (marquee) */
function WorkTile({
  w
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      flexShrink: 0,
      width: "clamp(220px, 24vw, 320px)",
      height: "clamp(300px, 34vw, 420px)",
      margin: "0 8px",
      overflow: "hidden",
      background: "var(--ink-800)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: w[0],
    alt: w[1],
    loading: "lazy",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "grayscale(0.5) contrast(1.06)",
      transform: hover ? "scale(1.06)" : "scale(1)",
      transition: "transform .7s var(--ease-out), filter .4s"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--scrim-hover)",
      opacity: hover ? 1 : 0.5,
      transition: "opacity .35s"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "14px",
      left: "14px",
      fontFamily: "var(--font-body)",
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--bone)",
      background: "rgba(10,10,12,.5)",
      padding: "5px 9px",
      backdropFilter: "blur(4px)"
    }
  }, w[2]), /*#__PURE__*/React.createElement("h3", {
    style: {
      position: "absolute",
      left: "16px",
      right: "16px",
      bottom: "16px",
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      fontSize: "18px",
      fontWeight: 500,
      margin: 0,
      transform: hover ? "translateY(0)" : "translateY(6px)",
      opacity: hover ? 1 : 0.9,
      transition: "all .35s"
    }
  }, w[1]));
}
function Works({
  onBook
}) {
  const rowA = [...WORKS, ...WORKS];
  const rowB = [...WORKS.slice().reverse(), ...WORKS.slice().reverse()];
  return /*#__PURE__*/React.createElement("section", {
    id: "works",
    className: "rt-snap",
    style: {
      background: "var(--bg-surface)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "110px 0",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal",
    style: {
      maxWidth: MAXW,
      margin: "0 auto 44px",
      padding: "0 32px",
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "02",
    label: "\u0420\u0430\u0431\u043E\u0442\u044B"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(32px, 4.5vw, 56px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
      margin: "20px 0 0"
    }
  }, "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBook,
    iconRight: "fas fa-arrow-right"
  }, "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u0441\u0435\u0430\u043D\u0441")), /*#__PURE__*/React.createElement("div", {
    className: "rt-marquee",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-marquee-track"
  }, rowA.map((w, i) => /*#__PURE__*/React.createElement(WorkTile, {
    key: "a" + i,
    w: w
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rt-marquee-track rt-marquee-rev"
  }, rowB.map((w, i) => /*#__PURE__*/React.createElement(WorkTile, {
    key: "b" + i,
    w: w
  })))));
}

/* --------------------------------------------------------------- Services */
const SERVICES = [["Авторские татуировки", "Уникальные художественные работы по вашему эскизу или моему дизайну.", "fas fa-pen-nib"], ["Коррекция и перекрытие", "Профессиональное исправление и перекрытие неудачных татуировок.", "fas fa-layer-group"], ["Тату на шрамах", "Специальные техники нанесения на рубцовую ткань.", "fas fa-shield-heart"], ["Перманентный татуаж", "Микроблейдинг, перманентный макияж бровей, губ и век.", "fas fa-feather"]];
function Services({
  onBook
}) {
  const [hover, setHover] = React.useState(-1);
  return /*#__PURE__*/React.createElement("section", {
    id: "services",
    className: "rt-snap",
    style: {
      background: "var(--bg-base)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "110px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal",
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: "56px",
      flexWrap: "wrap",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "03",
    label: "\u0423\u0441\u043B\u0443\u0433\u0438"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(32px, 4vw, 52px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
      margin: "20px 0 0"
    }
  }, "\u0427\u0442\u043E \u044F \u0434\u0435\u043B\u0430\u044E")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBook,
    iconRight: "fas fa-arrow-right"
  }, "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-hair)"
    }
  }, SERVICES.map(([title, body], i) => /*#__PURE__*/React.createElement("div", {
    key: title,
    onMouseEnter: () => setHover(i),
    onMouseLeave: () => setHover(-1),
    style: {
      display: "grid",
      gridTemplateColumns: "70px 1.1fr 1.4fr 40px",
      gap: "28px",
      alignItems: "center",
      padding: "30px 16px",
      borderBottom: "1px solid var(--border-hair)",
      background: hover === i ? "rgba(236,231,223,0.03)" : "transparent",
      transition: "background .25s ease"
    },
    className: "rt-svc-row"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "22px",
      fontWeight: 600,
      color: hover === i ? "var(--accent)" : "var(--text-faint)",
      transition: "color .25s"
    }
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      fontSize: "clamp(22px, 2.4vw, 30px)",
      fontWeight: 500,
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      margin: 0,
      lineHeight: 1.6,
      fontSize: "15px"
    },
    className: "rt-svc-desc"
  }, body), /*#__PURE__*/React.createElement("span", {
    style: {
      justifySelf: "end",
      color: hover === i ? "var(--accent)" : "var(--text-faint)",
      fontSize: "18px",
      transform: hover === i ? "translateX(4px)" : "translateX(0)",
      transition: "transform .25s, color .25s"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-right"
  })))))));
}

/* --------------------------------------------------------------- Benefits */
const BENEFITS = [["fas fa-shield-halved", "100% стерильность", "Только одноразовые иглы и медицинская стерилизация в автоклаве."], ["fas fa-droplet", "Премиальные пигменты", "Eternal Ink, Dynamic Color и Fusion Ink — яркие и долговечные."], ["fas fa-gem", "Эксклюзивные эскизы", "Каждый дизайн создаётся специально для вас."], ["fas fa-infinity", "Пожизненная гарантия", "Если потребуется коррекция через годы — сделаю бесплатно."], ["fas fa-couch", "Максимальный комфорт", "Просторный кабинет, музыка, кино и игры во время сеанса."], ["fas fa-location-dot", "Центр Москвы", "Студия рядом со станцией метро «Смоленская»."]];
function Benefits() {
  return /*#__PURE__*/React.createElement("section", {
    id: "benefits",
    className: "rt-snap",
    style: {
      background: "var(--bg-surface)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "110px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal",
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "48px"
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    index: "04",
    label: "\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(32px, 4vw, 52px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
      margin: "20px 0 0",
      maxWidth: "16ch"
    }
  }, "\u041F\u043E\u0447\u0435\u043C\u0443 \u043C\u043D\u0435 \u0434\u043E\u0432\u0435\u0440\u044F\u044E\u0442")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1px",
      background: "var(--border-hair)",
      border: "1px solid var(--border-hair)"
    },
    className: "rt-benefits-grid"
  }, BENEFITS.map(([icon, title, body]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      background: "var(--bg-surface)",
      padding: "36px 32px",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: icon,
    style: {
      color: "var(--accent)",
      fontSize: "24px"
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      fontSize: "21px",
      fontWeight: 500,
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      margin: 0,
      lineHeight: 1.6,
      fontSize: "15px"
    }
  }, body))))));
}

/* ----------------------------------------------------------- Testimonials */
const REVIEWS = [["Делал масштабный реализм на руке. Результат превзошёл ожидания — тату выглядит живой!", "Алексей", "Реалистичный волк", "https://randomuser.me/api/portraits/men/32.jpg"], ["Пришла с неудачным старым тату. Получилось шедевральное перекрытие!", "Мария", "Перекрытие старого тату", "https://randomuser.me/api/portraits/women/44.jpg"], ["Делал первую татуировку. Атмосфера дружеская, работа аккуратная. Уже планирую следующую.", "Дмитрий", "Первая татуировка", "https://randomuser.me/api/portraits/men/67.jpg"]];
function Testimonials() {
  return /*#__PURE__*/React.createElement("section", {
    id: "reviews",
    className: "rt-snap",
    style: {
      background: "var(--bg-base)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "110px 0",
      borderTop: "1px solid var(--border-hair)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal",
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: "20px",
      marginBottom: "48px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "05",
    label: "\u041E\u0442\u0437\u044B\u0432\u044B"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(32px, 4vw, 52px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
      margin: "20px 0 0"
    }
  }, "\u0427\u0442\u043E \u0433\u043E\u0432\u043E\u0440\u044F\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u044B")), /*#__PURE__*/React.createElement(StarRating, {
    value: 5,
    score: "5.0",
    count: "127+ \u043E\u0442\u0437\u044B\u0432\u043E\u0432",
    size: "18px"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px"
    },
    className: "rt-reviews-grid"
  }, REVIEWS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r[1],
    style: {
      border: "1px solid var(--border-hair)",
      padding: "34px 30px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      background: "var(--bg-surface)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)",
      fontFamily: "var(--font-display)",
      fontSize: "52px",
      lineHeight: 0.6,
      height: "26px"
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-body)",
      margin: 0,
      lineHeight: 1.65,
      fontSize: "16px",
      flex: 1
    }
  }, r[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      paddingTop: "18px",
      borderTop: "1px solid var(--border-hair)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: r[3],
    alt: r[1],
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      objectFit: "cover",
      filter: "grayscale(0.5)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      fontSize: "16px",
      fontWeight: 500
    }
  }, r[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-faint)",
      fontSize: "12px",
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, r[2]))))))));
}

/* --------------------------------------------------------------- FAQ */
const FAQ = [{
  q: "Как узнать стоимость татуировки?",
  a: /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u0430, \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u0438, \u043C\u0435\u0441\u0442\u0430 \u043D\u0430\u043D\u0435\u0441\u0435\u043D\u0438\u044F \u0438 \u0434\u0435\u0442\u0430\u043B\u0435\u0439. \u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0441\u0435\u0430\u043D\u0441\u0430 \u2014 15 000 \u20BD. \u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E \u0434\u043B\u044F \u0442\u043E\u0447\u043D\u043E\u0433\u043E \u0440\u0430\u0441\u0447\u0451\u0442\u0430.")
}, {
  q: "Больно ли делать тату?",
  a: /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\u041E\u0449\u0443\u0449\u0435\u043D\u0438\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B \u0438 \u0437\u0430\u0432\u0438\u0441\u044F\u0442 \u043E\u0442 \u0437\u043E\u043D\u044B \u0442\u0435\u043B\u0430 \u0438 \u0431\u043E\u043B\u0435\u0432\u043E\u0433\u043E \u043F\u043E\u0440\u043E\u0433\u0430. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E \u043E\u0431\u0435\u0437\u0431\u043E\u043B\u0438\u0432\u0430\u044E\u0449\u0438\u0435 \u0433\u0435\u043B\u0438. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u044E \u0432\u044B\u0441\u043F\u0430\u0442\u044C\u0441\u044F, \u043F\u043B\u043E\u0442\u043D\u043E \u043F\u043E\u0435\u0441\u0442\u044C \u0438 \u043D\u0435 \u043F\u0438\u0442\u044C \u0430\u043B\u043A\u043E\u0433\u043E\u043B\u044C \u0437\u0430 24 \u0447\u0430\u0441\u0430.")
}, {
  q: "Как ухаживать за татуировкой?",
  a: /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\u041D\u0435 \u0441\u043D\u0438\u043C\u0430\u0442\u044C \u043F\u043B\u0451\u043D\u043A\u0443 2\u20134 \u0447\u0430\u0441\u0430, \u0430\u043A\u043A\u0443\u0440\u0430\u0442\u043D\u043E \u043C\u044B\u0442\u044C \u0442\u0451\u043F\u043B\u043E\u0439 \u0432\u043E\u0434\u043E\u0439 \u0441 \u043C\u044B\u043B\u043E\u043C, \u043D\u0430\u043D\u043E\u0441\u0438\u0442\u044C \u043C\u0430\u0437\u044C 2\u20133 \u0440\u0430\u0437\u0430 \u0432 \u0434\u0435\u043D\u044C, \u0438\u0437\u0431\u0435\u0433\u0430\u0442\u044C \u0441\u043E\u043B\u043D\u0446\u0430 \u0438 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u043E\u0432. \u041C\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u043D\u0430 \u0441\u0432\u044F\u0437\u0438 \u043F\u0440\u0438 \u0437\u0430\u0436\u0438\u0432\u043B\u0435\u043D\u0438\u0438.")
}];
function Faq() {
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    className: "rt-snap",
    style: {
      background: "var(--bg-surface)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "110px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal rt-faq-grid",
    style: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "0 32px",
      width: "100%",
      display: "grid",
      gridTemplateColumns: "0.7fr 1.3fr",
      gap: "64px",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "06",
    label: "FAQ"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(30px, 3.4vw, 46px)",
      lineHeight: 1,
      letterSpacing: "-0.01em",
      margin: "20px 0 0"
    }
  }, "\u0427\u0430\u0441\u0442\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B")), /*#__PURE__*/React.createElement(Accordion, {
    items: FAQ
  })));
}

/* --------------------------------------------------------------- CTA */
function Cta({
  onBook
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "cta",
    className: "rt-snap",
    style: {
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "120px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/img/work-mandala.jpg",
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center 35%",
      filter: "grayscale(0.7) contrast(1.05) brightness(0.5)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(10,10,12,.86), rgba(10,10,12,.92))"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "rt-reveal",
    style: {
      position: "relative",
      zIndex: 1,
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px",
      textAlign: "center",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block"
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    index: "\u2014",
    label: "\u0417\u0430\u043F\u0438\u0441\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u0430"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--bone)",
      textTransform: "uppercase",
      fontSize: "clamp(40px, 7vw, 96px)",
      lineHeight: 0.95,
      letterSpacing: "-0.01em",
      margin: "26px 0 28px"
    }
  }, "\u0421\u043E\u0437\u0434\u0430\u0434\u0438\u043C \u0432\u0430\u0448\u0443", /*#__PURE__*/React.createElement("br", null), "\u0442\u0430\u0442\u0443\u0438\u0440\u043E\u0432\u043A\u0443", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-lead)",
      color: "var(--gray-200)",
      maxWidth: "46ch",
      margin: "0 auto 40px",
      lineHeight: 1.55
    }
  }, "\u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E \u2014 \u043E\u0431\u0441\u0443\u0434\u0438\u043C \u0438\u0434\u0435\u044E, \u0441\u0442\u0438\u043B\u044C \u0438 \u0442\u043E\u0447\u043D\u0443\u044E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "14px",
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onBook,
    iconRight: "fas fa-arrow-right"
  }, "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u0441\u0435\u0439\u0447\u0430\u0441"), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: "tel:+79689752099",
    variant: "glass",
    size: "lg",
    iconLeft: "fas fa-phone"
  }, "+7 (968) 975-20-99"))));
}

/* ----------------------------------------------------------------- Footer */
function Footer() {
  const socials = [["fab fa-instagram", "Instagram"], ["fab fa-telegram", "Telegram"], ["fab fa-vk", "VK"], ["fab fa-youtube", "YouTube"]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--bg-base)",
      borderTop: "1px solid var(--border-hair)",
      padding: "72px 0 36px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      padding: "0 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr",
      gap: "48px"
    },
    className: "rt-footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO,
    alt: "",
    style: {
      height: "40px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-logo)",
      color: "var(--bone)",
      fontSize: "22px",
      letterSpacing: "0.16em"
    }
  }, "RATED TATTOO")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      margin: "0 0 22px",
      maxWidth: "38ch",
      lineHeight: 1.6
    }
  }, "\u041F\u0440\u0435\u043C\u0438\u0443\u043C \u0442\u0430\u0442\u0443\u0438\u0440\u043E\u0432\u043A\u0438 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u041C\u043E\u0441\u043A\u0432\u044B. \u0410\u0432\u0442\u043E\u0440\u0441\u043A\u0438\u0439 \u043F\u043E\u0434\u0445\u043E\u0434 \u0438 \u0430\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u0430\u044F \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px"
    }
  }, socials.map(([s, t]) => /*#__PURE__*/React.createElement("a", {
    key: s,
    href: "#",
    title: t,
    style: {
      width: "42px",
      height: "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid var(--border-hair)",
      color: "var(--text-body)",
      fontSize: "16px",
      transition: "all .2s"
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = "var(--bone)";
      e.currentTarget.style.borderColor = "var(--accent)";
      e.currentTarget.style.background = "var(--accent)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = "var(--text-body)";
      e.currentTarget.style.borderColor = "var(--border-hair)";
      e.currentTarget.style.background = "transparent";
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: s
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-body)",
      color: "var(--text-faint)",
      fontSize: "12px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      margin: "0 0 18px"
    }
  }, "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, [["#about", "О мастере"], ["#works", "Работы"], ["#benefits", "Преимущества"], ["#faq", "Вопросы"]].map(([h, l]) => /*#__PURE__*/React.createElement("li", {
    key: h
  }, /*#__PURE__*/React.createElement("a", {
    href: h,
    style: {
      color: "var(--text-body)",
      fontSize: "15px"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-body)",
      color: "var(--text-faint)",
      fontSize: "12px",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      margin: "0 0 18px"
    }
  }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      color: "var(--text-body)",
      fontSize: "15px"
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "tel:+79689752099"
  }, "+7 (968) 975-20-99")), /*#__PURE__*/React.createElement("li", null, "\u041D\u043E\u0432\u0438\u043D\u0441\u043A\u0438\u0439 \u0431\u0443\u043B\u044C\u0432\u0430\u0440, 10/12"), /*#__PURE__*/React.createElement("li", null, "\u041F\u043D\u2013\u0412\u0441 \xB7 11:00 \u2013 20:00")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "56px",
      paddingTop: "24px",
      borderTop: "1px solid var(--border-hair)",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "10px",
      color: "var(--text-faint)",
      fontSize: "12px",
      letterSpacing: "0.04em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2025 \u0422\u0438\u043C\u0443\u0440 \u0422\u044D\u0434 \xB7 Rated Tattoo"), /*#__PURE__*/React.createElement("span", null, "\u041C\u043E\u0441\u043A\u0432\u0430 \xB7 Tattoo & Body"))));
}

/* -------------------------------------------------------- Booking modal */
function BookingModal({
  open,
  onClose
}) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (open) setDone(false);
  }, [open]);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(5,5,6,.82)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: "460px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border-hair)",
      padding: "40px",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "3px",
      background: "var(--accent)"
    }
  }), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "44px",
      color: "var(--accent)",
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-circle-check"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      margin: "0 0 10px",
      fontSize: "26px",
      fontWeight: 600
    }
  }, "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      margin: "0 0 28px"
    }
  }, "\u0422\u0438\u043C\u0443\u0440 \u0441\u0432\u044F\u0436\u0435\u0442\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0447\u0430\u0441\u0430."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    onClick: onClose
  }, "\u0413\u043E\u0442\u043E\u0432\u043E")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "26px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, {
    index: "\u2014",
    label: "\u0417\u0430\u043F\u0438\u0441\u044C"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      color: "var(--bone)",
      textTransform: "uppercase",
      margin: "14px 0 0",
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: 1
    }
  }, "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430\u044F", /*#__PURE__*/React.createElement("br", null), "\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "var(--text-muted)",
      fontSize: "20px",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-xmark"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u0418\u043C\u044F",
    icon: "fas fa-user",
    placeholder: "\u041A\u0430\u043A \u0432\u0430\u0441 \u0437\u043E\u0432\u0443\u0442?"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
    icon: "fas fa-phone",
    type: "tel",
    placeholder: "+7 (___) ___-__-__"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0438\u0434\u0435\u044E",
    as: "textarea",
    placeholder: "\u0421\u0442\u0438\u043B\u044C, \u0440\u0430\u0437\u043C\u0435\u0440, \u043C\u0435\u0441\u0442\u043E \u043D\u0430 \u0442\u0435\u043B\u0435\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    onClick: () => setDone(true),
    iconRight: "fas fa-arrow-right"
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443")))));
}

/* --------------------------------------------------------------- Dot nav */
function DotNav() {
  const items = [["hero", "Главная"], ["about", "Мастер"], ["works", "Работы"], ["services", "Услуги"], ["benefits", "Преимущества"], ["reviews", "Отзывы"], ["faq", "Вопросы"], ["cta", "Запись"]];
  const [active, setActive] = React.useState("hero");
  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, {
      threshold: 0.5
    });
    items.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("nav", {
    className: "rt-dotnav",
    style: {
      position: "fixed",
      right: "26px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 60,
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      alignItems: "flex-end"
    }
  }, items.map(([id, label]) => {
    const on = active === id;
    return /*#__PURE__*/React.createElement("a", {
      key: id,
      href: "#" + id,
      className: "rt-dot",
      title: label,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "rt-dot-label",
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: on ? "var(--bone)" : "var(--text-muted)",
        opacity: 0,
        transform: "translateX(6px)",
        transition: "opacity .25s, transform .25s, color .25s",
        whiteSpace: "nowrap"
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        width: on ? "11px" : "7px",
        height: on ? "11px" : "7px",
        borderRadius: "50%",
        background: on ? "var(--accent)" : "transparent",
        border: "1px solid",
        borderColor: on ? "var(--accent)" : "var(--text-faint)",
        transition: "all .25s var(--ease-out)"
      }
    }));
  }));
}
Object.assign(window, {
  Header,
  Hero,
  About,
  Works,
  Services,
  Benefits,
  Testimonials,
  Faq,
  Cta,
  Footer,
  BookingModal,
  DotNav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.PortfolioCard = __ds_scope.PortfolioCard;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.ServiceCard = __ds_scope.ServiceCard;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.TestimonialCard = __ds_scope.TestimonialCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Input = __ds_scope.Input;

})();
