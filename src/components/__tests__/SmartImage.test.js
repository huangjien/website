import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SmartImage } from "../SmartImage";

// Mock Skeleton
jest.mock("../ui/skeleton", () => {
  return function MockSkeleton(props) {
    return <div data-testid='skeleton' {...props} />;
  };
});

describe("SmartImage Component", () => {
  const mockSrc = "https://example.com/image.jpg";
  const mockAlt = "Test Image";

  it("should render skeleton initially", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("should render image with correct props", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img"); // Initially hidden but present
    expect(img).toHaveAttribute("src", mockSrc);
    expect(img).toHaveAttribute("alt", mockAlt);
  });

  it("should show image and hide skeleton on load", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img");

    fireEvent.load(img);

    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    expect(img).toHaveClass("opacity-100");
  });

  it("should retry with proxy URL on first error", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img");

    fireEvent.error(img);

    // Should still be loading/retrying (skeleton visible)
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();

    // Image src should update to proxy
    const expectedProxyUrl = `/api/image-proxy?url=${encodeURIComponent(mockSrc)}`;
    expect(img).toHaveAttribute("src", expectedProxyUrl);
  });

  it("should show fallback on second error (proxy failed)", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img");

    // First error (direct link)
    fireEvent.error(img);

    // Second error (proxy link)
    fireEvent.error(img);

    // Should show failure state
    expect(screen.getByText("Image failed to load")).toBeInTheDocument();
    expect(screen.getByText("Try direct link")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });
});
