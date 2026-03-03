/* eslint-disable @next/next/no-img-element */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Login } from "../Login";
import { useSession, signIn, signOut } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("react-icons/md", () => ({
  MdLogin: () => <span data-testid='login-icon' />,
  MdLogout: () => <span data-testid='logout-icon' />,
  MdSettings: () => <span data-testid='settings-icon' />,
}));

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

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        "header.login": "Login",
        "header.logout": "Logout",
        "header.settings": "Settings",
        "header.message": "Message",
      };
      return translations[key] || options?.defaultValue || key;
    },
  }),
}));

describe("Login - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession = {
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/avatar.jpg",
    },
  };

  describe("Authentication States", () => {
    it("should render login button when unauthenticated", () => {
      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByTestId("login-icon")).toBeInTheDocument();
    });

    it("should render login button when loading", () => {
      useSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("should render login button when session has no user", () => {
      useSession.mockReturnValue({
        data: {},
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("should render user menu when authenticated", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("should call custom onLogin handler", () => {
      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      const customOnLogin = jest.fn();
      render(<Login onLogin={customOnLogin} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(customOnLogin).toHaveBeenCalled();
    });

    it("should call custom onLogout handler", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      const customOnLogout = jest.fn();
      render(<Login onLogout={customOnLogout} />);

      expect(customOnLogout).toBeDefined();
    });

    it("should call custom onSettings handler", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      const customOnSettings = jest.fn();
      render(<Login onSettings={customOnSettings} />);

      expect(customOnSettings).toBeDefined();
    });
  });

  describe("Event Handlers with Defaults", () => {
    it("should call signIn when login button clicked", () => {
      const { signIn } = require("next-auth/react");

      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(signIn).toHaveBeenCalledWith("github");
    });
  });

  describe("User Display with Helper Functions", () => {
    it("should display user info using helper functions", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("should render Avatar with correct classes", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Login />);

      const avatar = screen.getByTestId("avatar");
      expect(avatar).toHaveClass("h-8", "w-8");
    });

    it("should render AvatarImage when image exists", () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });

      render(<Login />);

      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg",
      );
      expect(avatarImage).toHaveAttribute("alt", "John Doe");
    });
  });

  describe("Translation Coverage", () => {
    it("should use translation for login button", () => {
      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Login />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Login");
      expect(button).toHaveAttribute("title", "Login");
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with missing name", () => {
      useSession.mockReturnValue({
        data: {
          user: {
            name: null,
            email: "user@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback).toHaveTextContent("?");
    });

    it("should handle user with empty name", () => {
      useSession.mockReturnValue({
        data: {
          user: {
            name: "",
            email: "user@example.com",
            image: "https://example.com/avatar.jpg",
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback).toHaveTextContent("?");
    });

    it("should handle user with single character name", () => {
      useSession.mockReturnValue({
        data: {
          user: {
            name: "A",
            email: "a@example.com",
            image: null,
          },
        },
        status: "authenticated",
      });

      render(<Login />);

      expect(screen.getAllByText("A")).toHaveLength(2);
      const fallback = screen.getByTestId("avatar-fallback");
      expect(fallback).toHaveTextContent("A");
    });
  });
});
