import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";
import { useSession, signIn, signOut } from "next-auth/react";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdLogin: () => <div data-testid='login-icon' />,
  MdLogout: () => <div data-testid='logout-icon' />,
  MdSettings: () => <div data-testid='settings-icon' />,
}));

/* eslint-disable @next/next/no-img-element */
// Mock Avatar components
jest.mock("../ui/avatar", () => ({
  Avatar: ({ children, className }) => (
    <div className={className} data-testid='avatar'>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }) => (
    <img src={src} alt={alt} data-testid='avatar-image' />
  ),
  AvatarFallback: ({ children }) => (
    <div data-testid='avatar-fallback'>{children}</div>
  ),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        "header.login": "Login",
        "header.logout": "Logout",
        "header.settings": "Settings",
        "header.message": "User menu",
      };
      return translations[key] || options?.defaultValue || key;
    },
  }),
}));

describe("Login Component", () => {
  const mockSignIn = signIn;
  const mockSignOut = signOut;
  const mockUseSession = useSession;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Unauthenticated State", () => {
    it("renders login button when not authenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByTestId("login-icon")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /login/i }),
      ).toBeInTheDocument();
    });

    it("calls signIn when login button is clicked", async () => {
      const user = userEvent.setup();
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const loginButton = screen.getByRole("button", { name: /login/i });
      await user.click(loginButton);

      expect(mockSignIn).toHaveBeenCalledWith("github");
    });

    it("renders login button during loading state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("handles missing session data gracefully", () => {
      mockUseSession.mockReturnValue({
        data: undefined,
        status: "unauthenticated",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("has correct accessibility attributes", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const button = screen.getByRole("button", { name: /login/i });
      expect(button).toHaveAttribute("aria-label", "Login");
      expect(button).toHaveAttribute("title", "Login");
    });
  });

  describe("Authenticated State", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("renders user dropdown when authenticated", () => {
      render(<Login />);

      const trigger = screen.getByRole("button", { name: /user menu/i });
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("renders avatar with image", () => {
      render(<Login />);

      const avatar = screen.getByTestId("avatar-image");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
      expect(avatar).toHaveAttribute("alt", "John Doe");
    });

    it("has correct accessibility attributes on trigger", () => {
      render(<Login />);

      const trigger = screen.getByRole("button", { name: /user menu/i });
      expect(trigger).toHaveAttribute("aria-label", "User menu");
    });
  });

  describe("Dropdown Menu Actions", () => {
    const mockSession = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("renders dropdown trigger when authenticated", () => {
      render(<Login />);

      const trigger = screen.getByRole("button", { name: /user menu/i });
      expect(trigger).toBeInTheDocument();
    });

    it("does not call signOut when dropdown is not interacted with", () => {
      render(<Login />);

      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases - Missing User Data", () => {
    it("handles user without image - shows fallback initial", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "John Doe",
            email: "john@example.com",
            image: null,
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText(/^J$/)).toBeInTheDocument();
    });

    it("handles user without email", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "John Doe",
            email: null,
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    it("handles user without name - shows ? fallback", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: null,
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("handles user with empty string name", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "",
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("handles user with empty string email", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "John Doe",
            email: "",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      // Empty email element should still exist
      const container = screen.getByRole("button", { name: /user menu/i });
      expect(container).toContainHTML("<span");
    });

    it("handles session with missing user object", () => {
      mockUseSession.mockReturnValue({
        data: { user: null },
        status: "authenticated",
      });

      render(<Login />);

      // Should fall back to login button if user is missing
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("handles session with undefined user", () => {
      mockUseSession.mockReturnValue({
        data: {},
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  describe("Styling and Classes", () => {
    it("applies correct classes to login button", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const button = screen.getByRole("button", { name: /login/i });
      expect(button).toHaveClass("gap-2");
    });

    it("applies correct classes to dropdown trigger", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Jane Doe",
            email: "jane@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const trigger = screen.getByRole("button", { name: /user menu/i });
      expect(trigger).toHaveClass("glass");
    });

    it("displays user info with correct layout", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const nameElement = screen.getByText("Test User");
      const emailElement = screen.getByText("test@example.com");

      expect(nameElement).toHaveClass("text-sm", "font-medium");
      expect(emailElement).toHaveClass("text-xs", "text-muted-foreground");
    });
  });

  describe("Multiple Sign In Scenarios", () => {
    it("handles loading state with no session data", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Login />);

      expect(
        screen.getByRole("button", { name: /login/i }),
      ).toBeInTheDocument();
    });

    it("handles transition from loading to authenticated", () => {
      const { rerender } = render(<Login />);
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      expect(screen.getByText("Login")).toBeInTheDocument();

      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "User",
            email: "user@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      rerender(<Login />);

      expect(screen.getByText("User")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label on login button", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const button = screen.getByRole("button", { name: /login/i });
      expect(button).toHaveAttribute("aria-label");
    });

    it("has proper aria-label on user menu trigger", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: null,
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const trigger = screen.getByRole("button", { name: /user menu/i });
      expect(trigger).toHaveAttribute("aria-label", "User menu");
    });

    it("avatar has proper alt text", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Jane Smith",
            email: "jane@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const avatar = screen.getByAltText("Jane Smith");
      expect(avatar).toBeInTheDocument();
    });
  });
});
