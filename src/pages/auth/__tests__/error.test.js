import { render, screen } from "@testing-library/react";
import AuthError from "../error";

describe("AuthError", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render authentication error page", () => {
    render(<AuthError searchParams={{ error: null }} />);

    expect(screen.getByText("Authentication Error")).toBeInTheDocument();
    expect(screen.getByText("An unknown error occurred.")).toBeInTheDocument();
  });

  it("should render unknown error when no error code", () => {
    render(<AuthError searchParams={{}} />);

    expect(screen.getByText("An unknown error occurred.")).toBeInTheDocument();
  });

  it("should render OAuthSignin error message", () => {
    render(<AuthError searchParams={{ error: "OAuthSignin" }} />);

    expect(
      screen.getByText("Error starting sign in flow."),
    ).toBeInTheDocument();
  });

  it("should render OAuthCallback error message", () => {
    render(<AuthError searchParams={{ error: "OAuthCallback" }} />);

    expect(
      screen.getByText("Error during OAuth callback."),
    ).toBeInTheDocument();
  });

  it("should render Default error message", () => {
    render(<AuthError searchParams={{ error: "Default" }} />);

    expect(screen.getByText("Default error.")).toBeInTheDocument();
  });

  it("should render SessionRequired error message", () => {
    render(<AuthError searchParams={{ error: "SessionRequired" }} />);

    expect(
      screen.getByText("Please sign in to view this page."),
    ).toBeInTheDocument();
  });

  it("should log error to console", () => {
    render(<AuthError searchParams={{ error: "TestError" }} />);

    expect(console.error).toHaveBeenCalledWith("Auth Error:", "TestError");
  });

  it("should render go home button", () => {
    render(<AuthError searchParams={{}} />);

    const button = screen.getByText("Go Home");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/");
  });

  it("should handle unknown error codes", () => {
    render(<AuthError searchParams={{ error: "UnknownError" }} />);

    const errorCode = screen.getByText(/Error code:/);
    expect(errorCode).toHaveTextContent("Error code: UnknownError");
  });
});
