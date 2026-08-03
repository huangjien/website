import { render, screen } from "@testing-library/react";

// Mock next/router with a configurable useRouter
const mockQuery = { current: {} };
jest.mock("next/router", () => ({
  useRouter: () => ({ query: mockQuery.current }),
}));

// Import after mock so the component picks up the mock
import AuthError from "../../src/pages/auth/error";

const renderWithError = (errorCode) => {
  mockQuery.current = errorCode === null ? {} : { error: errorCode };
  return render(<AuthError />);
};

describe("AuthError", () => {
  beforeEach(() => {
    console.error = jest.fn();
    mockQuery.current = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render authentication error page", () => {
    renderWithError(null);

    expect(screen.getByText("An unknown error occurred.")).toBeInTheDocument();
  });

  it("should render unknown error when no error code", () => {
    renderWithError(undefined);

    expect(screen.getByText("An unknown error occurred.")).toBeInTheDocument();
  });

  it("should render OAuthSignin error message", () => {
    renderWithError("OAuthSignin");

    expect(screen.getByText("Sign-in couldn't start.")).toBeInTheDocument();
  });

  it("should render OAuthCallback error message", () => {
    renderWithError("OAuthCallback");

    expect(screen.getByText("Sign-in callback failed.")).toBeInTheDocument();
  });

  it("should render Default error message", () => {
    renderWithError("Default");

    expect(screen.getByText("Authentication error.")).toBeInTheDocument();
  });

  it("should render SessionRequired error message", () => {
    renderWithError("SessionRequired");

    expect(screen.getByText("Sign in required.")).toBeInTheDocument();
  });

  it("should log error to console", () => {
    renderWithError("TestError");

    expect(console.error).toHaveBeenCalledWith("Auth Error:", "TestError");
  });

  it("should render go home button", () => {
    renderWithError(undefined);

    const button = screen.getByText("Go home");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/");
  });

  it("should handle unknown error codes", () => {
    renderWithError("UnknownError");

    const errorCode = screen.getByText(/Error code:/);
    expect(errorCode).toHaveTextContent("Error code: UnknownError");
  });
});
