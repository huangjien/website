import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "header.login": "Login",
        "header.settings": "Settings",
        "header.logout": "Logout",
        "header.message": "Message",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock @heroui/react components
jest.mock("@heroui/react", () => ({
  Dropdown: ({ children }) => <div data-testid='dropdown'>{children}</div>,
  DropdownTrigger: ({ children }) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenu: ({ children, onAction }) => {
    return (
      <div
        data-testid='dropdown-menu'
        data-onaction={onAction ? "true" : "false"}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onAction });
          }
          return child;
        })}
      </div>
    );
  },
  DropdownItem: ({ children, keyValue, startContent, onAction }) => (
    <div
      data-testid='dropdown-item'
      data-action={keyValue}
      onClick={() => onAction && onAction(keyValue)}
    >
      {startContent}
      {children}
    </div>
  ),
  DropdownSection: ({ children, title, onAction }) => (
    <div data-testid='dropdown-section'>
      <div data-testid='section-title'>{title}</div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onAction, keyValue: child.key });
        }
        return child;
      })}
    </div>
  ),

  Button: ({ children, variant, onPress, startContent }) => (
    <button data-testid='button' data-variant={variant} onClick={onPress}>
      {startContent}
      {children}
    </button>
  ),
  User: ({ name, description, avatarProps }) => (
    <div data-testid='user'>
      <div data-testid='user-avatar' data-src={avatarProps?.src} />
      <div data-testid='user-name'>{name}</div>
      <div data-testid='user-description'>{description}</div>
    </div>
  ),
}));

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdLogin: () => <div data-testid='login-icon' />,
  MdLogout: () => <div data-testid='logout-icon' />,
  MdSettings: () => <div data-testid='settings-icon' />,
}));

describe("Login Component", () => {
  const mockSignIn = signIn;
  const mockSignOut = signOut;
  const mockUseSession = useSession;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login button when not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Login />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByTestId("login-icon")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("should render user dropdown when authenticated", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("user")).toBeInTheDocument();
    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-description")).toHaveTextContent(
      "john@example.com"
    );
    expect(screen.getByTestId("user-avatar")).toHaveAttribute(
      "data-src",
      "https://example.com/avatar.jpg"
    );
  });

  it("should call signIn when login button is clicked", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Login />);

    const loginButton = screen.getByTestId("button");
    await user.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledWith("github");
  });

  it("should render dropdown menu items when authenticated", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });

  it("should call signOut when logout is selected", async () => {
    const user = userEvent.setup();
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    const logoutItem = Array.from(screen.getAllByTestId("dropdown-item")).find(
      (item) => item.getAttribute("data-action") === "logout"
    );

    await user.click(logoutItem);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("should handle settings action", async () => {
    const user = userEvent.setup();
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    });

    render(<Login />);

    const settingsItem = Array.from(
      screen.getAllByTestId("dropdown-item")
    ).find((item) => item.getAttribute("data-action") === "settings");

    await user.click(settingsItem);

    expect(mockOpen).toHaveBeenCalledWith("/settings", "_blank");
  });

  it("should render loading state", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<Login />);

    // Should render login button during loading
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should handle user without image", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: null,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByTestId("user-avatar")).toHaveAttribute("data-src", "");
  });

  it("should handle user without email", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: null,
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByTestId("user-description")).toHaveTextContent("");
  });

  it("should handle user without name", () => {
    const mockSession = {
      user: {
        name: null,
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByTestId("user-name")).toHaveTextContent("");
  });

  it("should render button with correct variant", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Login />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-variant", "flat");
  });

  it("should handle dropdown section correctly", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    expect(screen.getByTestId("dropdown-section")).toBeInTheDocument();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Message");
  });

  it("should handle missing session data gracefully", () => {
    mockUseSession.mockReturnValue({
      data: undefined,
      status: "unauthenticated",
    });

    render(<Login />);

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should handle session with missing user", () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      status: "authenticated",
    });

    render(<Login />);

    // Should fall back to login button if user is missing
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should handle unknown dropdown action gracefully", async () => {
    const user = userEvent.setup();
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    render(<Login />);

    const dropdownMenu = screen.getByTestId("dropdown-menu");

    // Simulate clicking with unknown action
    const mockEvent = {
      target: {
        getAttribute: () => "unknown-action",
      },
    };

    fireEvent.click(dropdownMenu, mockEvent);

    // Should not crash or call any auth functions
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
