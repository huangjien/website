import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StyleSwitch } from "../StyleSwitch";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../lib/useSettings";

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(),
}));

jest.mock("react-icons/bi", () => ({
  BiPalette: () => <div data-testid='style-icon' />,
}));

describe("StyleSwitch", () => {
  const mockUseTranslation = useTranslation;
  const mockUseSettings = useSettings;

  let currentStyleState;
  let mockSetCurrentStyle;

  beforeEach(() => {
    jest.clearAllMocks();

    currentStyleState = "glassmorphism";
    mockSetCurrentStyle = jest.fn((nextStyle) => {
      currentStyleState = nextStyle;
    });

    mockUseTranslation.mockReturnValue({
      t: (key, opts) => (opts?.defaultValue ? opts.defaultValue : key),
    });

    mockUseSettings.mockImplementation(() => ({
      currentStyle: currentStyleState,
      setCurrentStyle: mockSetCurrentStyle,
    }));
  });

  it("renders trigger button with label and icon", async () => {
    render(<StyleSwitch />);

    const trigger = screen.getByRole("button", {
      name: /switch design style/i,
    });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("title", "Design style");
    expect(screen.getByTestId("style-icon")).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.getByText("Glassmorphism")).toBeInTheDocument();
  });

  it("shows a check mark next to the currently selected style", async () => {
    render(<StyleSwitch />);

    const trigger = screen.getByRole("button", {
      name: /switch design style/i,
    });
    await userEvent.click(trigger);

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("selects a style and updates settings", async () => {
    const user = userEvent.setup();
    render(<StyleSwitch />);

    const trigger = screen.getByRole("button", {
      name: /switch design style/i,
    });
    await user.click(trigger);

    await user.click(screen.getByText("Brutalism"));

    await waitFor(() => {
      expect(mockSetCurrentStyle).toHaveBeenCalledWith("brutalism");
    });
  });

  it("does not crash if setCurrentStyle throws", async () => {
    mockSetCurrentStyle.mockImplementationOnce(() => {
      throw new Error("Style change failed");
    });

    const user = userEvent.setup();
    render(<StyleSwitch />);

    const trigger = screen.getByRole("button", {
      name: /switch design style/i,
    });
    await user.click(trigger);

    await user.click(screen.getByText("Neumorphism"));

    expect(
      screen.getByRole("button", { name: /switch design style/i })
    ).toBeInTheDocument();
  });
});
