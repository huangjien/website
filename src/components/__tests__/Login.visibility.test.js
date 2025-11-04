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

describe("Login visibility & attributes", () => {
  const { useSession, signIn } = require("next-auth/react");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not show dropdown items until the menu is opened", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: "Jane Doe",
          email: "jane@example.com",
          image: "https://example.com/jane.jpg",
        },
      },
      status: "authenticated",
    });

    render(<Login />);

    // Menu items should not be present before opening
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();

    // Open menu
    const trigger = screen.getByRole("button", { name: /user menu/i });
    await userEvent.click(trigger);

    // Menu items appear after opening
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("shows AvatarFallback initial even when image is provided (jsdom)", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: "Jane Doe",
          email: "jane@example.com",
          image: "https://example.com/jane.jpg",
        },
      },
      status: "authenticated",
    });

    render(<Login />);

    // Radix Avatar renders Fallback in jsdom as image won't load
    expect(screen.getByText(/^J$/)).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("clicking Login during loading calls signIn with provider", async () => {
    const user = userEvent.setup();
    useSession.mockReturnValue({ data: null, status: "loading" });

    render(<Login />);

    const btn = screen.getByRole("button", { name: /login/i });
    expect(btn).toHaveAttribute("aria-label", "login");
    await user.click(btn);

    expect(signIn).toHaveBeenCalledWith("github");
  });
});