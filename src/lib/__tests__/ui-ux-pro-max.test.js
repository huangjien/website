import {
  DESIGN_STYLE_ATTRIBUTE,
  DESIGN_STYLE_DEFAULT,
  DESIGN_STYLES,
  resolveDesignStyle,
  applyDesignStyleToDocument,
} from "../ui-ux-pro-max";

describe("ui-ux-pro-max", () => {
  it("exports design styles list", () => {
    expect(Array.isArray(DESIGN_STYLES)).toBe(true);
    expect(DESIGN_STYLES.length).toBe(10);
    expect(DESIGN_STYLES.map((s) => s.key)).toContain("liquidglass");
  });

  it("resolveDesignStyle returns default when invalid", () => {
    expect(resolveDesignStyle("")).toBe(DESIGN_STYLE_DEFAULT);
    expect(resolveDesignStyle("unknown")).toBe(DESIGN_STYLE_DEFAULT);
    expect(resolveDesignStyle(null)).toBe(DESIGN_STYLE_DEFAULT);
  });

  it("resolveDesignStyle normalizes input", () => {
    expect(resolveDesignStyle("  brutalism ")).toBe("brutalism");
    expect(resolveDesignStyle("Brutalism")).toBe("brutalism");
  });

  it("applyDesignStyleToDocument sets html attribute", () => {
    const doc = {
      documentElement: {
        setAttribute: jest.fn(),
      },
    };

    const applied = applyDesignStyleToDocument(doc, "neumorphism");

    expect(applied).toBe("neumorphism");
    expect(doc.documentElement.setAttribute).toHaveBeenCalledWith(
      DESIGN_STYLE_ATTRIBUTE,
      "neumorphism"
    );
  });

  it("applyDesignStyleToDocument returns default when doc missing", () => {
    expect(applyDesignStyleToDocument(null, "neumorphism")).toBe(
      DESIGN_STYLE_DEFAULT
    );
  });
});
