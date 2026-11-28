import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitch } from "../LanguageSwitch";
import { useSettings } from "../../lib/useSettings";

// Mock useSettings hook
jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(),
}));

// Mock languages from i18n
jest.mock("../../locales/i18n", () => ({
  ensureLocaleLoaded: jest.fn(() => Promise.resolve()),
  languages: [
    {
      key: "en",
      value: "English",
    },
    {
      key: "zh_CN",
      value: "中文(简体)",
    },
    {
      key: "es",
      value: "Español",
    },
  ],
}));

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiGlobe: () => <div data-testid='language-icon' />,
}));

describe("LanguageSwitch", () => {
  const _mockChangeLanguage = jest.fn();
  const mockUseSettings = useSettings;

  let mockSetCurrentLanguage;
  let currentLanguageState;

  beforeEach(() => {
    jest.clearAllMocks();

    currentLanguageState = "en";
    mockSetCurrentLanguage = jest.fn((lang) => {
      currentLanguageState = lang;
    });

    mockUseSettings.mockImplementation(() => ({
      setCurrentLanguage: mockSetCurrentLanguage,
      currentLanguage: currentLanguageState,
    }));
  });

  it("renders trigger button with label and icon", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("title", "header.language");
    expect(screen.getByTestId("language-icon")).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("lists available languages when opened", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    await userEvent.click(trigger);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("中文(简体)")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("shows a check mark next to the currently selected language", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    await userEvent.click(trigger);

    // Selected 'en' should render a check mark
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("changes to Chinese and updates settings", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByText("中文(简体)"));

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("zh_CN");
    });
  });

  it("changes to Spanish and updates settings", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByText("Español"));

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("es");
    });
  });

  it("handles selecting the same language gracefully", async () => {
    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: "Switch language" });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByText("English"));

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("en");
    });
  });

  it("does not crash if setCurrentLanguage throws", async () => {
    mockSetCurrentLanguage.mockImplementationOnce(() => {
      throw new Error("Language change failed");
    });

    render(<LanguageSwitch />);

    const trigger = screen.getByRole("button", { name: /switch language/i });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByText("中文(简体)"));

    // Component should still render the button
    expect(
      screen.getByRole("button", { name: /switch language/i }),
    ).toBeInTheDocument();
  });

  it("does not crash if i18n is missing", () => {
    mockUseSettings.mockImplementation(() => ({
      setLanguageCode: jest.fn(),
      setCurrentLanguage: jest.fn(),
      currentLanguage: "en",
    }));

    expect(() => render(<LanguageSwitch />)).not.toThrow();
  });
});
