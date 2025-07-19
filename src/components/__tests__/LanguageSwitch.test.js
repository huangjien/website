import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitch } from "../LanguageSwitch";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../lib/useSettings";
import { languages } from "../../locales/i18n";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

// Mock useSettings hook
jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(),
}));

// Mock languages from i18n
jest.mock("../../locales/i18n", () => ({
  languages: [
    {
      key: "en",
      value: "English",
      languageCode: "en-US",
      name: "en-US-Standard-A",
    },
    {
      key: "zh_CN",
      value: "中文(简体)",
      languageCode: "cmn-CN",
      name: "cmn-CN-Standard-A",
    },
    {
      key: "es",
      value: "Español",
      languageCode: "es-ES",
      name: "es-ES-Standard-A",
    },
  ],
}));

// Mock @heroui/react components
jest.mock("@heroui/react", () => ({
  Dropdown: ({ children }) => <div data-testid='dropdown'>{children}</div>,
  DropdownTrigger: ({ children }) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenu: ({ items, selectedKeys, onSelectionChange, selectionMode }) => (
    <div
      data-testid='dropdown-menu'
      data-selection-mode={selectionMode}
      data-selected-keys={Array.from(selectedKeys || []).join(",")}
    >
      {items.map((item) => (
        <div
          key={item.key}
          data-testid='dropdown-item'
          data-key={item.key}
          onClick={() => onSelectionChange(new Set([item.key]))}
        >
          {item.value}
        </div>
      ))}
    </div>
  ),
  DropdownItem: ({ children, "data-key": dataKey }) => (
    <div data-testid='dropdown-item' data-key={dataKey}>
      {children}
    </div>
  ),
  Button: ({ children, light, isIconOnly, onPress, startContent }) => (
    <button
      data-testid='button'
      data-variant={light ? "light" : ""}
      data-icon-only={isIconOnly}
      onClick={onPress}
    >
      {startContent}
      {children}
    </button>
  ),
  Tooltip: ({ children }) => children,
}));

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiGlobe: () => <div data-testid='language-icon' />,
}));

describe("LanguageSwitch Component", () => {
  const mockChangeLanguage = jest.fn();
  const mockUseTranslation = useTranslation;
  const mockUseSettings = useSettings;

  let mockSetCurrentLanguage;
  let mockSetLanguageCode;
  let mockSetSpeakerName;
  let currentLanguageState;

  beforeEach(() => {
    jest.clearAllMocks();

    currentLanguageState = "en";
    mockSetCurrentLanguage = jest.fn((lang) => {
      currentLanguageState = lang;
    });
    mockSetLanguageCode = jest.fn();
    mockSetSpeakerName = jest.fn();

    mockUseTranslation.mockReturnValue({
      t: (key) => key,
      i18n: {
        language: "en",
        changeLanguage: mockChangeLanguage,
      },
    });

    mockUseSettings.mockImplementation(() => ({
      setLanguageCode: mockSetLanguageCode,
      setCurrentLanguage: mockSetCurrentLanguage,
      currentLanguage: currentLanguageState,
      setSpeakerName: mockSetSpeakerName,
    }));
  });

  it("should render language switch button", () => {
    render(<LanguageSwitch />);

    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByTestId("language-icon")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });

  it("should render dropdown menu with all languages", () => {
    render(<LanguageSwitch />);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("中文(简体)")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("should show current language as selected", () => {
    render(<LanguageSwitch />);

    const dropdownMenu = screen.getByTestId("dropdown-menu");
    expect(dropdownMenu).toHaveAttribute("data-selected-keys", "en");
  });

  it("should change language when different language is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    // Find the Chinese language option and click it
    const chineseOption = screen.getByText("中文(简体)");
    await user.click(chineseOption);

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("zh_CN");
      expect(mockSetLanguageCode).toHaveBeenCalledWith("cmn-CN");
      expect(mockSetSpeakerName).toHaveBeenCalledWith("cmn-CN-Standard-A");
    });
  });

  it("should change language when Spanish is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    // Find the Spanish language option and click it
    const spanishOption = screen.getByText("Español");
    await user.click(spanishOption);

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("es");
      expect(mockSetLanguageCode).toHaveBeenCalledWith("es-ES");
      expect(mockSetSpeakerName).toHaveBeenCalledWith("es-ES-Standard-A");
    });
  });

  it("should handle same language selection", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    // Click on English (current language)
    const englishOption = screen.getByText("English");
    await user.click(englishOption);

    await waitFor(() => {
      // Component will still call the functions even for same language
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("en");
      expect(mockSetLanguageCode).toHaveBeenCalledWith("en-US");
      expect(mockSetSpeakerName).toHaveBeenCalledWith("en-US-Standard-A");
    });
  });

  it("should handle different current language", () => {
    mockUseSettings.mockReturnValue({
      setLanguageCode: mockSetLanguageCode,
      setCurrentLanguage: mockSetCurrentLanguage,
      currentLanguage: "zh_CN",
      setSpeakerName: mockSetSpeakerName,
    });

    render(<LanguageSwitch />);

    const dropdownMenu = screen.getByTestId("dropdown-menu");
    expect(dropdownMenu).toHaveAttribute("data-selected-keys", "zh_CN");
  });

  it("should render button with correct props", () => {
    render(<LanguageSwitch />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-variant", "light");
    expect(button).toHaveAttribute("data-icon-only", "true");
  });

  it("should render dropdown menu with correct props", () => {
    render(<LanguageSwitch />);

    const dropdownMenu = screen.getByTestId("dropdown-menu");
    expect(dropdownMenu).toHaveAttribute("data-selection-mode", "single");
  });

  it("should render all language options as dropdown items", () => {
    render(<LanguageSwitch />);

    const dropdownItems = screen.getAllByTestId("dropdown-item");
    expect(dropdownItems).toHaveLength(languages.length);

    languages.forEach((lang, index) => {
      expect(dropdownItems[index]).toHaveAttribute("data-key", lang.key);
      expect(dropdownItems[index]).toHaveTextContent(lang.value);
    });
  });

  it("should handle language change error gracefully", async () => {
    const user = userEvent.setup();
    mockSetCurrentLanguage.mockImplementationOnce(() => {
      throw new Error("Language change failed");
    });

    render(<LanguageSwitch />);

    const chineseOption = screen.getByText("中文(简体)");
    await user.click(chineseOption);

    expect(mockSetCurrentLanguage).toHaveBeenCalledWith("zh_CN");
    // Component should not crash even if language change fails
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("should handle missing i18n object gracefully", () => {
    mockUseTranslation.mockReturnValue({ t: (key) => key, i18n: null });

    // It should not crash
    expect(() => render(<LanguageSwitch />)).not.toThrow();
  });

  it("should handle settings functions gracefully", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    const chineseOption = screen.getByText("中文(简体)");
    await user.click(chineseOption);

    await waitFor(() => {
      expect(mockSetCurrentLanguage).toHaveBeenCalledWith("zh_CN");
      expect(mockSetLanguageCode).toHaveBeenCalledWith("cmn-CN");
      expect(mockSetSpeakerName).toHaveBeenCalledWith("cmn-CN-Standard-A");
    });
  });
});
