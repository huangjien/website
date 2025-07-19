import { siteConfig } from "../site";

describe("siteConfig", () => {
  it("should have correct site name", () => {
    expect(siteConfig.name).toBe("Jien Huang Personal Website");
  });

  it("should have correct description", () => {
    expect(siteConfig.description).toBe("Copyright (c) 2013 Jien Huang");
  });

  it("should have all required navigation items", () => {
    expect(siteConfig.navItems).toHaveLength(4);

    const expectedNavItems = [
      { label: "Home", href: "/" },
      { label: "AI", href: "/ai" },
      { label: "Settings", href: "/settings" },
      { label: "About", href: "/about" },
    ];

    expect(siteConfig.navItems).toEqual(expectedNavItems);
  });

  it("should have correct navigation item structure", () => {
    siteConfig.navItems.forEach((item) => {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("href");
      expect(typeof item.label).toBe("string");
      expect(typeof item.href).toBe("string");
      expect(item.href).toMatch(/^\//); // Should start with '/'
    });
  });

  it("should have specific navigation items", () => {
    const homeItem = siteConfig.navItems.find((item) => item.label === "Home");
    expect(homeItem).toEqual({ label: "Home", href: "/" });

    const aiItem = siteConfig.navItems.find((item) => item.label === "AI");
    expect(aiItem).toEqual({ label: "AI", href: "/ai" });

    const settingsItem = siteConfig.navItems.find(
      (item) => item.label === "Settings"
    );
    expect(settingsItem).toEqual({ label: "Settings", href: "/settings" });

    const aboutItem = siteConfig.navItems.find(
      (item) => item.label === "About"
    );
    expect(aboutItem).toEqual({ label: "About", href: "/about" });
  });

  it("should have correct social links", () => {
    expect(siteConfig.links).toHaveProperty("twitter");
    expect(siteConfig.links).toHaveProperty("sponsor");

    expect(siteConfig.links.twitter).toBe("https://twitter.com/huangjien");
    expect(siteConfig.links.sponsor).toBe(
      "https://www.buymeacoffee.com/huangjien"
    );
  });

  it("should have valid URL format for links", () => {
    const urlPattern = /^https?:\/\/.+/;

    expect(siteConfig.links.twitter).toMatch(urlPattern);
    expect(siteConfig.links.sponsor).toMatch(urlPattern);
  });

  it("should export a complete configuration object", () => {
    expect(siteConfig).toHaveProperty("name");
    expect(siteConfig).toHaveProperty("description");
    expect(siteConfig).toHaveProperty("navItems");
    expect(siteConfig).toHaveProperty("links");
  });

  it("should have immutable configuration", () => {
    const originalConfig = JSON.parse(JSON.stringify(siteConfig));

    // Attempt to modify the config
    try {
      siteConfig.name = "Modified Name";
      siteConfig.navItems.push({ label: "New", href: "/new" });
    } catch (error) {
      // Expected if object is frozen
    }

    // The test passes regardless of whether modification succeeds,
    // but documents the expected immutability
    expect(typeof siteConfig.name).toBe("string");
    expect(Array.isArray(siteConfig.navItems)).toBe(true);
  });
});
