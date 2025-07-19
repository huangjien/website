import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationBar } from "../NavigationBar";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

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

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () =>
    React.createElement("div", { "data-testid": "toast-container" }),
}));

jest.mock("react-icons/bi", () => ({
  BiMenu: () => <div data-testid='menu-icon' />,
  BiX: () => <div data-testid='close-icon' />,
  BiSun: () => <div data-testid='sun-icon' />,
  BiMoon: () => <div data-testid='moon-icon' />,
  BiGlobe: () => <div data-testid='globe-icon' />,
  BiChip: () => <div data-testid='chip-icon' />,
  BiCog: () => <div data-testid='cog-icon' />,
  BiDetail: () => <div data-testid='detail-icon' />,
  BiHome: () => <div data-testid='home-icon' />,
}));

// Mock child components
jest.mock("../Login", () => {
  const MockLogin = () => <div data-testid='login-component' />;
  return MockLogin;
});

jest.mock("../ThemeSwitch", () => ({
  ThemeSwitch: () => <div data-testid='theme-switch-component' />,
}));

jest.mock("../LanguageSwitch", () => ({
  LanguageSwitch: () => <div data-testid='language-switch-component' />,
}));

// Mock @heroui/react components
jest.mock("@heroui/react", () => ({
  Navbar: ({ children, isBordered, variant, css, id }) => (
    <nav
      data-testid='navbar'
      data-bordered={isBordered}
      data-variant={variant}
      id={id}
    >
      {children}
    </nav>
  ),
  NavbarBrand: ({ children, className }) => (
    <div data-testid='navbar-brand' className={className}>
      {children}
    </div>
  ),
  NavbarContent: ({ children, className }) => (
    <div data-testid='navbar-content' className={className}>
      {children}
    </div>
  ),
  NavbarItem: ({ children, className }) => (
    <div data-testid='navbar-item' className={className}>
      {children}
    </div>
  ),
  Dropdown: ({ children, "aria-label": ariaLabel }) => (
    <div data-testid='dropdown' aria-label={ariaLabel}>
      {children}
    </div>
  ),
  DropdownTrigger: ({ children }) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenu: ({
    children,
    className,
    "aria-label": ariaLabel,
    disallowEmptySelection,
    selectionMode,
  }) => (
    <div
      data-testid='dropdown-menu'
      className={className}
      aria-label={ariaLabel}
      data-disallow-empty-selection={disallowEmptySelection}
      data-selection-mode={selectionMode}
    >
      {children}
    </div>
  ),
  DropdownItem: ({ children }) => (
    <div data-testid='dropdown-item'>{children}</div>
  ),
}));

// Mock @heroui/link
jest.mock("@heroui/link", () => ({
  Link: ({ children, href, underline, ...props }) => (
    <a data-testid='link' href={href} data-underline={underline} {...props}>
      {children}
    </a>
  ),
}));

// Mock @heroui/spacer
jest.mock("@heroui/spacer", () => ({
  Spacer: ({ x, className }) => (
    <div data-testid='spacer' data-x={x} className={className} />
  ),
}));

// Mock @heroui/image
jest.mock("@heroui/image", () => ({
  Image: ({ src, alt, isZoomed, width, height }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-testid='image'
      src={src}
      alt={alt}
      data-zoomed={isZoomed}
      width={width}
      height={height}
    />
  ),
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a data-testid='next-link' href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("NavigationBar Component", () => {
  const mockPush = jest.fn();
  const mockUseSession = useSession;
  const mockUseRouter = useRouter;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      pathname: "/",
      push: mockPush,
    });
  });

  it("should render navigation bar with brand", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-brand")).toBeInTheDocument();
    expect(screen.getByTestId("image")).toBeInTheDocument();
  });

  it("should render all navigation links for unauthenticated user", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
    // AI link should not be visible for unauthenticated users
    expect(screen.queryByText("header.ai")).not.toBeInTheDocument();
  });

  it("should render additional links for authenticated user", () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    render(<NavigationBar />);

    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
    expect(screen.getAllByText("header.ai")).toHaveLength(2); // One in dropdown, one in navbar content
    expect(screen.getAllByText("header.settings")).toHaveLength(2); // One in dropdown, one in navbar content
  });

  it("should render child components", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    expect(screen.getByTestId("login-component")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switch-component")).toBeInTheDocument();
    expect(screen.getByTestId("language-switch-component")).toBeInTheDocument();
  });

  it("should render navigation items", () => {
    mockUseRouter.mockReturnValue({
      pathname: "/about",
      push: mockPush,
    });

    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const navbarItems = screen.getAllByTestId("navbar-item");
    expect(navbarItems.length).toBeGreaterThan(0);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
  });

  it("should render dropdown menu", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
  });

  it("should render dropdown menu items for authenticated user", () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    render(<NavigationBar />);

    const dropdownItems = screen.getAllByTestId("dropdown-item");
    expect(dropdownItems).toHaveLength(4); // home, ai, settings, about
  });

  it("should render dropdown menu items for unauthenticated user", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const dropdownItems = screen.getAllByTestId("dropdown-item");
    expect(dropdownItems).toHaveLength(2); // home, about
    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
  });

  it("should render navbar with correct props", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveAttribute("id", "main_header");
    expect(navbar).toHaveAttribute("data-variant", "sticky");
    expect(navbar).toHaveAttribute("data-bordered", "false"); // light theme
  });

  it("should render brand image correctly", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const brandImage = screen.getByTestId("image");
    expect(brandImage).toHaveAttribute("src", "/favicon.png");
    expect(brandImage).toHaveAttribute("alt", "brand");
  });

  it("should handle navigation link clicks", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const aboutLinks = screen.getAllByText("header.about");
    const aboutLink = aboutLinks[0]; // Use the first one for clicking
    await user.click(aboutLink);

    // The link should be rendered (actual navigation would be handled by Next.js)
    expect(aboutLink).toBeInTheDocument();
  });

  it("should render correct number of desktop navigation items for unauthenticated user", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    const navbarItems = screen.getAllByTestId("navbar-item");
    expect(navbarItems.length).toBeGreaterThan(0);
    // Should have home and about visible for unauthenticated users (text appears in both dropdown and desktop nav)
    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
  });

  it("should render correct number of desktop navigation items for authenticated user", () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    render(<NavigationBar />);

    const navbarItems = screen.getAllByTestId("navbar-item");
    expect(navbarItems.length).toBeGreaterThan(0);
    // Should have home, about, ai, and settings visible for authenticated users (text appears in both dropdown and desktop nav)
    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.getAllByText("header.about")).toHaveLength(2);
    expect(screen.getAllByText("header.ai")).toHaveLength(2);
    expect(screen.getAllByText("header.settings")).toHaveLength(2);
  });

  it("should handle different pathname patterns", () => {
    mockUseRouter.mockReturnValue({
      pathname: "/about",
      push: mockPush,
    });

    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<NavigationBar />);

    // Component should render regardless of pathname
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getAllByText("header.about")).toHaveLength(2);
  });

  it("should handle loading session state", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<NavigationBar />);

    // Should render basic navigation while loading (text appears in both dropdown and desktop nav)
    expect(screen.getAllByText("header.home")).toHaveLength(2);
    expect(screen.queryByText("header.settings")).not.toBeInTheDocument();
  });
});
