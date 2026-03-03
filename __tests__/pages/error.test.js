import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPage from "../../src/pages/error";

describe("Error Page", () => {
  const mockReset = jest.fn();
  const mockError = new Error("Test error message");

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render error page", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("should log error to console", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  it("should call reset when button clicked", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    const button = screen.getByText("Try again");
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should not crash when reset is not provided", () => {
    render(<ErrorPage error={mockError} reset={undefined} />);

    const button = screen.getByText("Try again");
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("should handle reset being null", () => {
    render(<ErrorPage error={mockError} reset={null} />);

    const button = screen.getByText("Try again");
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("should log error on render and update", () => {
    const { rerender } = render(
      <ErrorPage error={mockError} reset={mockReset} />,
    );

    expect(console.error).toHaveBeenCalledTimes(1);

    const newError = new Error("New error");
    rerender(<ErrorPage error={newError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(newError);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("should render with error object", () => {
    const errorWithMessage = {
      message: "Custom error message",
      name: "CustomError",
    };

    render(<ErrorPage error={errorWithMessage} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(errorWithMessage);
  });

  it("should render with error string", () => {
    const stringError = "String error";

    render(<ErrorPage error={stringError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(stringError);
  });
});
