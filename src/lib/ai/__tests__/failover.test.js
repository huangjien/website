import {
  createCooldownState,
  getSharedCooldownState,
  isHealthy,
  resolveChain,
  classifyProviderError,
  recordCooldown,
} from "../failover";

// Minimal catalog fixture: tiers mirror the real curated catalog shape.
const CATALOG = [
  { id: "model-a", tier: "advanced" },
  { id: "model-b", tier: "advanced" },
  { id: "model-c", tier: "balanced" },
  { id: "model-d", tier: "cost" },
];

describe("resolveChain", () => {
  it("puts the requested model first, then same-tier, then others", () => {
    const chain = resolveChain("model-c", CATALOG, createCooldownState());
    expect(chain).toEqual(["model-c", "model-a", "model-b"]);
  });

  it("caps the chain length", () => {
    const bigCatalog = [
      { id: "m1", tier: "t" },
      { id: "m2", tier: "t" },
      { id: "m3", tier: "t" },
      { id: "m4", tier: "t" },
    ];
    const chain = resolveChain("m1", bigCatalog, createCooldownState());
    expect(chain).toEqual(["m1", "m2", "m3"]);
  });

  it("skips models that are cooling down", () => {
    const state = createCooldownState();
    state.set("model-a", { kind: "rate_limit", openUntil: Date.now() + 60000 });
    const chain = resolveChain("model-c", CATALOG, state);
    expect(chain).toEqual(["model-c", "model-b", "model-d"]);
  });

  it("excludes a cooling requested model", () => {
    const state = createCooldownState();
    state.set("model-c", { kind: "rate_limit", openUntil: Date.now() + 60000 });
    const chain = resolveChain("model-c", CATALOG, state);
    expect(chain).toEqual(["model-a", "model-b", "model-d"]);
  });

  it("returns empty when every model is cooling down", () => {
    const state = createCooldownState();
    for (const { id } of CATALOG) {
      state.set(id, { kind: "quota", openUntil: Date.now() + 60000 });
    }
    expect(resolveChain("model-c", CATALOG, state)).toEqual([]);
  });
});

describe("classifyProviderError", () => {
  it("classifies quota exhaustion as key-level quota", () => {
    const error = Object.assign(new Error("You exceeded your quota"), {
      statusCode: 429,
      data: { error: { type: "insufficient_quota" } },
    });
    const verdict = classifyProviderError(error);
    expect(verdict.kind).toBe("quota");
    expect(verdict.cooldownMs).toBeGreaterThan(0);
  });

  it("classifies model rate limits with the default cooldown", () => {
    const error = Object.assign(new Error("Rate limit reached"), {
      statusCode: 429,
      data: { error: { type: "rate_limit_exceeded" } },
      responseHeaders: {},
    });
    const verdict = classifyProviderError(error);
    expect(verdict.kind).toBe("rate_limit");
    expect(verdict.cooldownMs).toBeGreaterThan(0);
  });

  it("honors a retry-after header, capped at five minutes", () => {
    const error = Object.assign(new Error("Slow down"), {
      statusCode: 429,
      responseHeaders: { "retry-after": "120" },
    });
    expect(classifyProviderError(error).cooldownMs).toBe(120000);

    const huge = Object.assign(new Error("Slow down"), {
      statusCode: 429,
      responseHeaders: { "retry-after": "99999" },
    });
    expect(classifyProviderError(huge).cooldownMs).toBe(300000);
  });

  it("classifies provider 5xx as overloaded", () => {
    const error = Object.assign(new Error("Overloaded"), { statusCode: 503 });
    const verdict = classifyProviderError(error);
    expect(verdict.kind).toBe("overloaded");
    expect(verdict.cooldownMs).toBeGreaterThan(0);
  });

  it("classifies everything else as other (no failover)", () => {
    expect(classifyProviderError(new Error("boom")).kind).toBe("other");
    expect(
      classifyProviderError(
        Object.assign(new Error("Bad request"), { statusCode: 400 }),
      ).kind,
    ).toBe("other");
    expect(
      classifyProviderError(Object.assign(new Error("?"), {})).cooldownMs,
    ).toBe(0);
  });
});

describe("recordCooldown", () => {
  it("cools only the failed model for rate limits", () => {
    const state = createCooldownState();
    recordCooldown(
      state,
      "model-a",
      { kind: "rate_limit", cooldownMs: 1000 },
      CATALOG,
    );
    expect(state.has("model-a")).toBe(true);
    expect(state.has("model-b")).toBe(false);
  });

  it("cools the whole catalog for quota exhaustion (shared key)", () => {
    const state = createCooldownState();
    recordCooldown(
      state,
      "model-a",
      { kind: "quota", cooldownMs: 1000 },
      CATALOG,
    );
    expect(Object.fromEntries([...state].map(([k]) => [k, true]))).toEqual({
      "model-a": true,
      "model-b": true,
      "model-c": true,
      "model-d": true,
    });
  });
});

describe("isHealthy", () => {
  it("is true without an entry and false while cooling", () => {
    const state = createCooldownState();
    expect(isHealthy(state, "model-a")).toBe(true);
    state.set("model-a", { kind: "rate_limit", openUntil: Date.now() + 60000 });
    expect(isHealthy(state, "model-a")).toBe(false);
  });
});

describe("getSharedCooldownState", () => {
  it("returns the same map instance across calls", () => {
    expect(getSharedCooldownState()).toBe(getSharedCooldownState());
  });
});
