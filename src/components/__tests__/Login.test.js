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
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
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

    const trigger = screen.getByRole("button", { name: "User menu" });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should call signIn when login button is clicked", async () => {
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

  it("should render dropdown menu items when authenticated", async () => {
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

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
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

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await user.click(trigger);

    await user.click(screen.getByText("Logout"));

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

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await user.click(trigger);

    await user.click(screen.getByText("Settings"));

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

    // Fallback initial should render
    expect(screen.getByText(/^J$/)).toBeInTheDocument();
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

    // Email text should not render
    expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
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

    // Fallback should be '?'
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("should render button with correct variant", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Login />);

    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toHaveAttribute("title", "Login");
  });

  it("should handle dropdown section correctly", async () => {
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

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    // The menu label should render
    expect(screen.getByText("Message")).toBeInTheDocument();
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

    const trigger = screen.getByRole("button", { name: /user menu/i });
    await user.click(trigger);

    // No action selected; should not sign out
    expect(signOut).not.toHaveBeenCalled();
  });
});
