export const DESIGN_STYLE_ATTRIBUTE = "data-design-style";

export const DESIGN_STYLE_DEFAULT = "glassmorphism";

export const DESIGN_STYLES = [
  { key: "glassmorphism", i18nKey: "design_style.glassmorphism" },
  { key: "neumorphism", i18nKey: "design_style.neumorphism" },
  { key: "claymorphism", i18nKey: "design_style.claymorphism" },
  { key: "minimalism", i18nKey: "design_style.minimalism" },
  { key: "brutalism", i18nKey: "design_style.brutalism" },
  { key: "skeuomorphism", i18nKey: "design_style.skeuomorphism" },
  { key: "bento_grid", i18nKey: "design_style.bento_grid" },
  { key: "responsive", i18nKey: "design_style.responsive" },
  { key: "flat_design", i18nKey: "design_style.flat_design" },
];

export function resolveDesignStyle(input) {
  const normalized = (input || "").trim().toLowerCase();
  const found = DESIGN_STYLES.find((s) => s.key === normalized);
  return found ? found.key : DESIGN_STYLE_DEFAULT;
}

export function applyDesignStyleToDocument(doc, inputStyle) {
  if (!doc || !doc.documentElement) return DESIGN_STYLE_DEFAULT;
  const resolved = resolveDesignStyle(inputStyle);
  doc.documentElement.setAttribute(DESIGN_STYLE_ATTRIBUTE, resolved);
  return resolved;
}
