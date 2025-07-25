import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Joke } from "../Joke";
import { useRequest } from "ahooks";
import { useTranslation } from "react-i18next";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock ahooks
jest.mock("ahooks", () => ({
  useRequest: jest.fn(),
}));

// Mock @heroui/react components
jest.mock("@heroui/react", () => ({
  Button: ({
    children,
    color,
    variant,
    onPress,
    isLoading,
    isDisabled,
    startContent,
  }) => (
    <button
      data-testid='button'
      data-color={color}
      data-variant={variant}
      onClick={onPress}
      disabled={isDisabled || isLoading}
      data-loading={isLoading}
    >
      {startContent}
      {children}
    </button>
  ),
  Spacer: () => <div data-testid='spacer' />,
}));

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdRefresh: () => <div data-testid='refresh-icon' />,
}));

// Mock fetch
global.fetch = jest.fn();

describe("Joke Component", () => {
  const mockRefresh = jest.fn();
  const mockUseRequest = useRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  it("should render joke when data is available", () => {
    mockUseRequest.mockReturnValue({
      data: {
        joke: "Why did the chicken cross the road? To get to the other side!",
      },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(
      screen.getByText(
        "Why did the chicken cross the road? To get to the other side!"
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByTestId("refresh-icon")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    mockUseRequest.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-loading", "true");
    expect(button).toBeDisabled();
  });

  it("should show error message when there is an error", () => {
    mockUseRequest.mockReturnValue({
      data: null,
      loading: false,
      error: new Error("Failed to fetch joke"),
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(screen.getByText("joke.error")).toBeInTheDocument();
  });

  it("should show loading message when loading and no data", () => {
    mockUseRequest.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(screen.getByText("joke.loading")).toBeInTheDocument();
  });

  it("should call refresh when button is clicked", () => {
    mockUseRequest.mockReturnValue({
      data: {
        joke: "A joke",
      },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    const refreshButton = screen.getByTestId("button");
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("should configure useRequest correctly", () => {
    mockUseRequest.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(mockUseRequest).toHaveBeenCalledWith(expect.any(Function), {
      manual: false,
      refreshDeps: [],
    });
  });

  it("should call the correct API endpoint", async () => {
    let fetchFunction;
    mockUseRequest.mockImplementation((fn, options) => {
      fetchFunction = fn;
      return {
        data: null,
        loading: false,
        error: null,
        refresh: mockRefresh,
      };
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ joke: "Test joke" }),
    });

    render(<Joke />);

    // Call the fetch function that was passed to useRequest
    await fetchFunction();

    expect(fetch).toHaveBeenCalledWith("/api/joke");
  });

  it("should handle API response correctly", async () => {
    let fetchFunction;
    mockUseRequest.mockImplementation((fn, options) => {
      fetchFunction = fn;
      return {
        data: null,
        loading: false,
        error: null,
        refresh: mockRefresh,
      };
    });

    const mockJokeData = { joke: "API joke response" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJokeData,
    });

    render(<Joke />);

    const result = await fetchFunction();
    expect(result).toEqual(mockJokeData);
  });

  it("should handle API error correctly", async () => {
    let fetchFunction;
    mockUseRequest.mockImplementation((fn, options) => {
      fetchFunction = fn;
      return {
        data: null,
        loading: false,
        error: null,
        refresh: mockRefresh,
      };
    });

    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<Joke />);

    await expect(fetchFunction()).rejects.toThrow("Network error");
  });

  it("should render button with correct props", () => {
    mockUseRequest.mockReturnValue({
      data: { joke: "Test joke" },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-variant", "light");
    expect(button).not.toBeDisabled();
  });

  it("should handle empty joke data", () => {
    mockUseRequest.mockReturnValue({
      data: { joke: "" },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    // When joke is empty string, it should not render the joke text
    // but should still render the button
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("should handle null joke data", () => {
    mockUseRequest.mockReturnValue({
      data: { joke: null },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("should handle data without joke property", () => {
    mockUseRequest.mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("should not be disabled when not loading", () => {
    mockUseRequest.mockReturnValue({
      data: { joke: "Test joke" },
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<Joke />);

    const button = screen.getByTestId("button");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("data-loading", "false");
  });
});
