import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationBar } from "../NavigationBar";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

// Stub CSS imports used by react-toastify
jest.mock("react-toastify/dist/ReactToastify.css", () => ({}), { virtual: true });

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

// Mock react-toastify
jest.mock("react-toastify", () => {
  const React = require("react");
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    ToastContainer: () => React.createElement("div", { "data-testid": "toast-container" }),
  };
});

// Mock react-icons used in NavigationBar
jest.mock("react-icons/bi", () => {
  const React = require("react");
  return {
    BiChip: () => React.createElement("div", { "data-testid": "chip-icon" }),
    BiCog: () => React.createElement("div", { "data-testid": "cog-icon" }),
    BiDetail: () => React.createElement("div", { "data-testid": "detail-icon" }),
    BiHome: () => React.createElement("div", { "data-testid": "home-icon" }),
  };
});

// Mock child components
jest.mock("../Login", () => {
  const React = require("react");
  const MockLogin = () => React.createElement("div", { "data-testid": "login-component" });
  return MockLogin;
});

jest.mock("../ThemeSwitch", () => {
  const React = require("react");
  return { ThemeSwitch: () => React.createElement("div", { "data-testid": "theme-switch-component" }) };
});

jest.mock("../LanguageSwitch", () => {
  const React = require("react");
  return { LanguageSwitch: () => React.createElement("div", { "data-testid": "language-switch-component" }) };
});

// Mock Avatar to ensure accessible image is present
jest.mock("../ui/avatar", () => {
  const React = require("react");
  const MockAvatar = ({ src, alt, className }) => React.createElement("img", { src, alt, className });
  return {
    __esModule: true,
    default: MockAvatar,
    Avatar: MockAvatar,
    AvatarImage: (props) => React.createElement("img", props),
    AvatarFallback: (props) => React.createElement("div", { ...props, "data-testid": "avatar-fallback" }),
  };
});

// Mock next/link
jest.mock("next/link", () => {
  const React = require("react");
  return function MockLink({ children, href, ...props }) {
    return React.createElement("a", { "data-testid": "next-link", href, ...props }, children);
  };
});

describe("NavigationBar Component (shadcn/ui)", () => {
  const mockUseSession = useSession;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation bar with brand logo", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<NavigationBar />);

    // nav landmark
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    // brand image and its parent link
    const brandImage = screen.getByAltText("Logo");
    expect(brandImage).toBeInTheDocument();
    const brandLink = brandImage.closest("a");
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders all navigation links (home, ai, settings, about)", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<NavigationBar />);

    expect(screen.getByText("header.home")).toBeInTheDocument();
    expect(screen.getByText("header.ai")).toBeInTheDocument();
    expect(screen.getByText("header.settings")).toBeInTheDocument();
    expect(screen.getByText("header.about")).toBeInTheDocument();
  });

  it("renders child components", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<NavigationBar />);

    expect(screen.getByTestId("login-component")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switch-component")).toBeInTheDocument();
    expect(screen.getByTestId("language-switch-component")).toBeInTheDocument();
  });

  it("renders brand image src and alt", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<NavigationBar />);

    const brandImage = screen.getByAltText("Logo");
    expect(brandImage).toHaveAttribute("src", "/favicon.png");
    expect(brandImage).toHaveAttribute("alt", "Logo");
  });

  it("links are clickable (basic click test)", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<NavigationBar />);

    const aboutLink = screen.getByText("header.about");
    await user.click(aboutLink);
    expect(aboutLink).toBeInTheDocument();
  });

  it("renders same links when authenticated", () => {
    mockUseSession.mockReturnValue({ data: { user: { name: "John Doe" } }, status: "authenticated" });

    render(<NavigationBar />);

    expect(screen.getByText("header.home")).toBeInTheDocument();
    expect(screen.getByText("header.ai")).toBeInTheDocument();
    expect(screen.getByText("header.settings")).toBeInTheDocument();
    expect(screen.getByText("header.about")).toBeInTheDocument();
  });

  it("renders base navigation while session loading", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading" });

    render(<NavigationBar />);

    expect(screen.getByText("header.home")).toBeInTheDocument();
    // Other links are still rendered in current implementation
    expect(screen.getByText("header.ai")).toBeInTheDocument();
    expect(screen.getByText("header.settings")).toBeInTheDocument();
    expect(screen.getByText("header.about")).toBeInTheDocument();
  });
});
