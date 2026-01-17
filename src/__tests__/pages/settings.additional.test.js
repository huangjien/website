import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Settings from "../../pages/settings";

// Mocks
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => opts?.defaultValue ?? k }),
}));

jest.mock("ahooks", () => ({ useTitle: jest.fn() }));

jest.mock("../../lib/useSettings", () => ({
  useSettings: jest
    .fn()
    .mockReturnValue({ settings: [], updateSetting: jest.fn() }),
}));

// next-auth client hook for component rendering
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

describe("Settings Page additional coverage", () => {
  const { useSession, signIn } = require("next-auth/react");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state when session status is loading", () => {
    useSession.mockReturnValue({ status: "loading", data: null });
    render(<Settings />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("requires login when unauthenticated and triggers signIn on click", async () => {
    const user = userEvent.setup();
    useSession.mockReturnValue({ status: "unauthenticated", data: null });
    render(<Settings />);
    expect(screen.getByText(/Please login/i)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Login/i });
    await user.click(btn);
    expect(signIn).toHaveBeenCalled();
  });
});
