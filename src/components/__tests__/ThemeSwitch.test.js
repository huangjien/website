import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeSwitch } from "../ThemeSwitch";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

// Mock React hooks
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiMoon: ({ size }) => (
    <div data-testid='moon-icon' data-size={size}>
      🌙
    </div>
  ),
  BiSun: ({ size }) => (
    <div data-testid='sun-icon' data-size={size}>
      ☀️
    </div>
  ),
}));

// Mock HeroUI components
jest.mock("@heroui/react", () => ({
  Button: ({ children, onPress, "aria-label": ariaLabel, className }) => (
    <button
      onClick={onPress}
      aria-label={ariaLabel}
      className={className}
      data-testid='theme-button'
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, content, color }) => (
    <div data-testid='tooltip' data-content={content} data-color={color}>
      {children}
    </div>
  ),
}));

describe("ThemeSwitch", () => {
  const mockSetTheme = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default useState mock for mounted state
    useState.mockReturnValue([true, jest.fn()]);

    useTranslation.mockReturnValue({
      t: mockT,
    });
    mockT.mockImplementation((key) => {
      const translations = {
        "header.day": "Switch to day mode",
        "header.night": "Switch to night mode",
      };
      return translations[key] || key;
    });
  });

  it("should not render when not mounted", () => {
    // Mock useState to return false for mounted state
    const mockSetMounted = jest.fn();
    useState.mockImplementation((initial) => {
      if (initial === false) {
        return [false, mockSetMounted]; // mounted state
      }
      return [initial, jest.fn()];
    });

    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    const { container } = render(<ThemeSwitch />);
    expect(container.firstChild).toBeNull();
  });

  it("should render moon icon when theme is light", async () => {
    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
    });
  });

  it("should render sun icon when theme is dark", async () => {
    useTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    });
  });

  it("should render sun icon when theme is system (not light)", async () => {
    useTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    });
  });

  it("should display correct tooltip content for light theme", async () => {
    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveAttribute("data-content", "Switch to night mode");
      expect(tooltip).toHaveAttribute("data-color", "primary");
    });
  });

  it("should display correct tooltip content for dark theme", async () => {
    useTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveAttribute("data-content", "Switch to day mode");
    });
  });

  it("should switch from light to dark theme when clicked", async () => {
    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByTestId("theme-button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });

  it("should switch from dark to light theme when clicked", async () => {
    useTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByTestId("theme-button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });
  });

  it("should switch from system to dark theme when clicked", async () => {
    useTheme.mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByTestId("theme-button");
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });

  it("should have correct button attributes", async () => {
    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const button = screen.getByTestId("theme-button");
      expect(button).toHaveAttribute("aria-label", "switch theme");
      expect(button).toHaveClass("bg-transparent", "text-primary");
    });
  });

  it("should pass correct size to icons", async () => {
    useTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      const moonIcon = screen.getByTestId("moon-icon");
      expect(moonIcon).toHaveAttribute("data-size", "2em");
    });
  });
});
