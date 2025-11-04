import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Login } from "../Login";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdLogin: () => <div data-testid='login-icon' />,
  MdLogout: () => <div data-testid='logout-icon' />,
  MdSettings: () => <div data-testid='settings-icon' />,
}));

describe("Login additional tests", () => {
  const { useSession, signOut } = require("next-auth/react");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows first initial in AvatarFallback when name is present", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: "Alice",
          email: "alice@example.com",
          image: "https://example.com/a.jpg",
        },
      },
      status: "authenticated",
    });

    render(<Login />);
    // Trigger dropdown to ensure content renders
    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);
    // AvatarFallback should show first letter 'A'
    expect(screen.getByText(/^A$/)).toBeInTheDocument();
    // Email should render
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("dropdown content label renders and logout item triggers signOut", async () => {
    useSession.mockReturnValue({
      data: { user: { name: "Bob", email: "bob@example.com", image: null } },
      status: "authenticated",
    });

    render(<Login />);
    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    // Label should render (uses t("header.message"))
    expect(screen.getByText("header.message")).toBeInTheDocument();

    // Click Logout
    await userEvent.click(screen.getByText("header.logout"));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
