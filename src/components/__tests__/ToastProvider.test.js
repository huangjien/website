import { render, screen } from "@testing-library/react";
import { ToastProvider } from "../ToastProvider";
import { useTheme } from "next-themes";

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  ToastContainer: ({ theme, ...props }) => (
    <div data-testid='toast-container' data-theme={theme} {...props} />
  ),
}));

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render ToastContainer", () => {
    useTheme.mockReturnValue({
      theme: "dark",
      systemTheme: "dark",
      setTheme: jest.fn(),
    });

    render(<ToastProvider />);

    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  it("should use dark theme when theme is dark", () => {
    useTheme.mockReturnValue({
      theme: "dark",
      systemTheme: "dark",
      setTheme: jest.fn(),
    });

    render(<ToastProvider />);

    expect(screen.getByTestId("toast-container")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  });

  it("should use light theme when theme is light", () => {
    useTheme.mockReturnValue({
      theme: "light",
      systemTheme: "light",
      setTheme: jest.fn(),
    });

    render(<ToastProvider />);

    expect(screen.getByTestId("toast-container")).toHaveAttribute(
      "data-theme",
      "light",
    );
  });

  it("should use system theme when theme is system", () => {
    useTheme.mockReturnValue({
      theme: "system",
      systemTheme: "dark",
      setTheme: jest.fn(),
    });

    render(<ToastProvider />);

    expect(screen.getByTestId("toast-container")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  });

  it("should have correct props", () => {
    useTheme.mockReturnValue({
      theme: "dark",
      systemTheme: "dark",
      setTheme: jest.fn(),
    });

    render(<ToastProvider />);

    const container = screen.getByTestId("toast-container");
    expect(container).toHaveAttribute("autoClose", "5000");
    expect(container).toHaveAttribute("limit", "3");
  });
});
