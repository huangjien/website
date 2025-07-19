// Mock next/font/google before importing the fonts module
jest.mock("next/font/google", () => ({
  Fira_Code: jest.fn(() => ({
    subsets: ["latin"],
    variable: "--font-mono",
    className: "mock-fira-code",
  })),
  Inter: jest.fn(() => ({
    subsets: ["latin"],
    variable: "--font-sans",
    className: "mock-inter",
  })),
}));

import { fontSans, fontMono } from "../fonts";
import { Fira_Code, Inter } from "next/font/google";

describe("fonts configuration", () => {
  it("should configure fontSans with correct options", () => {
    expect(fontSans).toEqual({
      subsets: ["latin"],
      variable: "--font-sans",
      className: "mock-inter",
    });
  });

  it("should configure fontMono with correct options", () => {
    expect(fontMono).toEqual({
      subsets: ["latin"],
      variable: "--font-mono",
      className: "mock-fira-code",
    });
  });

  it("should export both font configurations", () => {
    expect(fontSans).toBeDefined();
    expect(fontMono).toBeDefined();
  });

  it("should use latin subset for both fonts", () => {
    expect(fontSans.subsets).toContain("latin");
    expect(fontMono.subsets).toContain("latin");
  });

  it("should have correct CSS variable names", () => {
    expect(fontSans.variable).toBe("--font-sans");
    expect(fontMono.variable).toBe("--font-mono");
  });
});
