import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Layout from "../../pages/layout";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock NavigationBar component
jest.mock("../../components/NavigationBar", () => ({
  NavigationBar: () => <div data-testid='navigation-bar'>Navigation Bar</div>,
}));

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdKeyboardArrowUp: () => <div data-testid='arrow-up-icon' />,
}));

// Mock package.json
jest.mock("../../../package.json", () => ({
  version: "1.0.0",
}));

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
  writable: true,
});
Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
  writable: true,
});

describe("Layout Component", () => {
  const mockPush = jest.fn();
  const mockChildren = <div data-testid='children'>Test Children</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: "/",
      query: {},
      asPath: "/",
    });
    window.scrollTo.mockClear();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
  });

  it("should render layout with all components", () => {
    render(<Layout>{mockChildren}</Layout>);

    expect(screen.getByTestId("navigation-bar")).toBeInTheDocument();
    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("layout.version");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("1.0.0");
  });

  it("should render scroll to top button when scrolled down", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 500,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    // Simulate scroll event
    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("arrow-up-icon")).toBeInTheDocument();
  });

  it("should not render scroll to top button when at top", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 50,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    // Simulate scroll event
    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    expect(
      screen.queryByRole("button", { name: "Scroll to top" })
    ).not.toBeInTheDocument();
  });

  it("should scroll to top when scroll button is clicked", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "scrollY", {
      value: 500,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    // Simulate scroll event to show button
    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    const scrollButton = screen.getByRole("button", { name: "Scroll to top" });
    await user.click(scrollButton);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("should add scroll event listener on mount", () => {
    render(<Layout>{mockChildren}</Layout>);

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });

  it("should remove scroll event listener on unmount", () => {
    const { unmount } = render(<Layout>{mockChildren}</Layout>);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });

  it("should render main content with correct structure", () => {
    render(<Layout>{mockChildren}</Layout>);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1", "p-4");
    expect(main).toContainElement(screen.getByTestId("children"));
  });

  it("should render footer with version information", () => {
    render(<Layout>{mockChildren}</Layout>);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      "text-center",
      "p-4",
      "text-sm",
      "text-gray-500"
    );
    expect(footer).toHaveTextContent("layout.version");
    expect(footer).toHaveTextContent("1.0.0");
  });

  it("should render scroll button with correct props when visible", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 500,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    // Simulate scroll event
    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toHaveClass(
      "fixed",
      "bottom-8",
      "right-8",
      "z-50",
      "shadow-glass-glow",
      "rounded-full"
    );
  });

  it("should handle scroll events correctly", async () => {
    const { rerender } = render(<Layout>{mockChildren}</Layout>);

    // Initially at top - button should not be visible
    Object.defineProperty(window, "scrollY", {
      value: 50,
      writable: true,
    });

    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    expect(
      screen.queryByRole("button", { name: "Scroll to top" })
    ).not.toBeInTheDocument();

    // Scroll down - button should be visible
    Object.defineProperty(window, "scrollY", {
      value: 500,
      writable: true,
    });

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    expect(
      screen.getByRole("button", { name: "Scroll to top" })
    ).toBeInTheDocument();
  });

  it("should render layout with correct CSS classes", () => {
    render(<Layout>{mockChildren}</Layout>);

    const layoutDiv = screen.getByTestId("children").closest("div")
      .parentElement.parentElement;
    expect(layoutDiv).toHaveClass("min-h-screen", "flex", "flex-col");
  });

  it("should handle multiple scroll events", () => {
    render(<Layout>{mockChildren}</Layout>);

    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    // Simulate multiple scroll events
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    scrollHandler?.();

    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    scrollHandler?.();

    Object.defineProperty(window, "scrollY", { value: 50, writable: true });
    scrollHandler?.();

    // Should handle all events without errors
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });

  it("should render children content correctly", () => {
    const customChildren = (
      <div>
        <h1>Custom Title</h1>
        <p>Custom content</p>
      </div>
    );

    render(<Layout>{customChildren}</Layout>);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });

  it("should handle edge case of exactly 100px scroll", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 100,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    // At exactly 100px, button should not be visible (threshold is > 100)
    expect(screen.queryByTestId("button")).not.toBeInTheDocument();
  });

  it("should handle edge case of 101px scroll", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 101,
      writable: true,
    });

    render(<Layout>{mockChildren}</Layout>);

    const scrollHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "scroll"
    )?.[1];

    if (scrollHandler) {
      await act(async () => {
        scrollHandler();
      });
    }

    // At 101px, button should be visible
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });
});
