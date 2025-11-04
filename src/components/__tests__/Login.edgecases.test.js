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

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdLogin: () => <div data-testid='login-icon' />,
  MdLogout: () => <div data-testid='logout-icon' />,
  MdSettings: () => <div data-testid='settings-icon' />,
}));

describe("Login edge cases", () => {
  const { useSession, signIn } = require("next-auth/react");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login button when status is loading even with session.user present", async () => {
    const user = userEvent.setup();
    useSession.mockReturnValue({
      data: {
        user: { name: "Jane", email: "jane@example.com", image: "" },
      },
      status: "loading",
    });

    render(<Login />);
    const btn = screen.getByRole("button", { name: /login/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(signIn).toHaveBeenCalledWith("github");
  });

  it("shows '?' fallback when name is empty and image is empty string", async () => {
    useSession.mockReturnValue({
      data: {
        user: { name: "", email: "jane@example.com", image: "" },
      },
      status: "authenticated",
    });

    render(<Login />);
    const trigger = screen.getByRole("button", { name: /user menu/i });
    expect(trigger).toBeInTheDocument();
    // AvatarFallback is rendered with '?' when no initial is available
    expect(screen.getByText("?")).toBeInTheDocument();
    // Email still renders when provided
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });
});