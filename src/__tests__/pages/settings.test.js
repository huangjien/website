import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Settings from "../../pages/settings";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { useTitle } from "ahooks";
import { useSettings } from "../../lib/useSettings";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock ahooks
jest.mock("ahooks", () => ({
  useTitle: jest.fn(),
  useDebounceEffect: jest.fn((effect, deps) => {
    const React = require("react");
    React.useEffect(effect, deps);
  }),
}));

// Mock useSettings
jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(),
}));

// Mock react-icons (used as startContent)
jest.mock("react-icons/bi", () => ({
  BiSearch: () => <div data-testid='search-icon' />,
}));

describe("Settings Page Component (shadcn/ui)", () => {
  const mockUpdateSetting = jest.fn();
  const mockSettings = [
    { id: 1, name: "theme", value: "light" },
    { id: 2, name: "language", value: "en" },
    { id: 3, name: "autoSave", value: "true" },
    { id: 4, name: "notifications", value: "false" },
    { id: 5, name: "fontSize", value: "medium" },
    { id: 6, name: "layout", value: "grid" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({
      data: { user: { name: "Test User", email: "test@example.com" } },
      status: "authenticated",
    });
    useSettings.mockReturnValue({
      settings: mockSettings,
      updateSetting: mockUpdateSetting,
    });
  });

  it("renders settings page with input, table, and pagination", () => {
    render(<Settings />);

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("sets page title using useTitle hook", () => {
    render(<Settings />);
    expect(useTitle).toHaveBeenCalledWith("header.settings");
  });

  it("renders search input with i18n placeholder", () => {
    render(<Settings />);
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("placeholder", "global.search");
  });

  it("renders table headers and body", () => {
    render(<Settings />);
    const table = screen.getByTestId("table");
    expect(table).toHaveAttribute("aria-label", "Settings");

    // Column titles
    expect(screen.getAllByText("column.title.key").length).toBeGreaterThan(0);
    expect(screen.getAllByText("column.title.value").length).toBeGreaterThan(0);
  });

  it("displays settings in the table (first page)", () => {
    render(<Settings />);

    // First page shows first 5 items
    expect(screen.getAllByText("theme").length).toBeGreaterThan(0);
    expect(screen.getAllByText("language").length).toBeGreaterThan(0);
    expect(screen.getAllByText("autoSave").length).toBeGreaterThan(0);
    expect(screen.getAllByText("notifications").length).toBeGreaterThan(0);
    expect(screen.getAllByText("fontSize").length).toBeGreaterThan(0);
    // layout is on page 2
    expect(screen.queryByText("layout")).not.toBeInTheDocument();
  });

  it("displays setting values correctly (first page)", () => {
    render(<Settings />);

    expect(screen.getAllByText("light").length).toBeGreaterThan(0);
    expect(screen.getAllByText("en").length).toBeGreaterThan(0);
    expect(screen.getAllByText("true").length).toBeGreaterThan(0);
    expect(screen.getAllByText("false").length).toBeGreaterThan(0);
    expect(screen.getAllByText("medium").length).toBeGreaterThan(0);
    // grid is on page 2
    expect(screen.queryByText("grid")).not.toBeInTheDocument();
  });

  it("handles search input changes and filters results", async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const input = screen.getByTestId("input");
    await user.type(input, "lang");

    expect(screen.getAllByText("language").length).toBeGreaterThan(0);
    expect(screen.queryByText("theme")).not.toBeInTheDocument();
  });

  it("clears search via clear button", async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const input = screen.getByTestId("input");
    await user.type(input, "theme");
    const clearBtn = screen.getByLabelText("clear");
    await user.click(clearBtn);

    // After clearing, the first page returns
    expect(screen.getAllByText("theme").length).toBeGreaterThan(0);
  });

  it("paginates with Prev/Next and shows total pages", async () => {
    const user = userEvent.setup();
    render(<Settings />);

    // total pages should be 2
    expect(screen.getByTestId("total-pages")).toHaveTextContent("2");

    // Go to next page
    await user.click(screen.getByTestId("next-page"));
    expect(screen.getByTestId("current-page")).toHaveTextContent("2");
    expect(screen.getAllByText("layout").length).toBeGreaterThan(0);

    // Go back to prev page
    await user.click(screen.getByTestId("prev-page"));
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.queryByText("layout")).not.toBeInTheDocument();
  });

  it("rows per page selector resets to first page", () => {
    render(<Settings />);

    // Move to page 2 first
    fireEvent.click(screen.getByTestId("next-page"));
    expect(screen.getByTestId("current-page")).toHaveTextContent("2");

    // Change rows per page to 10 -> should reset page to 1
    const selector = screen.getByRole("combobox");
    fireEvent.change(selector, { target: { value: "10" } });
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  it("maintains search state across re-renders", async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const input = screen.getByTestId("input");
    await user.type(input, "lay");

    // Filter narrows to 'layout'
    expect(screen.getAllByText("layout").length).toBeGreaterThan(0);

    // Re-render by changing rows per page
    const selector = screen.getByRole("combobox");
    fireEvent.change(selector, { target: { value: "5" } });

    // Search should persist
    expect(screen.getAllByText("layout").length).toBeGreaterThan(0);
  });
});
