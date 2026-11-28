import { render, screen, fireEvent } from "@testing-library/react";
import { SmartImage } from "../SmartImage";

// Mock Skeleton
jest.mock("../ui/skeleton", () => {
  return function MockSkeleton(props) {
    return <div data-testid='skeleton' {...props} />;
  };
});

jest.mock("next/image", () => {
  return function MockNextImage(props) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
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

  it("should render the proxy URL first for a private GitHub attachment", () => {
    const attachment = "https://github.com/user-attachments/assets/519c2516";
    render(<SmartImage src={attachment} alt='Attachment' />);
    const img = screen.getByRole("img");

    expect(img).toHaveAttribute(
      "src",
      `/api/image-proxy?url=${encodeURIComponent(attachment)}`,
    );
  });

  it("should fall back to a plain image after the proxy fails", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img");

    fireEvent.error(img); // the image itself failed
    fireEvent.error(img); // the proxy failed

    const direct = screen.getByTestId("smart-image-direct");
    expect(direct).toHaveAttribute("src", mockSrc);
    expect(direct).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("should show fallback after the last attempt fails", () => {
    render(<SmartImage src={mockSrc} alt={mockAlt} />);
    const img = screen.getByRole("img");

    // First error (the image itself)
    fireEvent.error(img);
    // Second error (the proxy)
    fireEvent.error(img);
    // Third error (the plain element)
    fireEvent.error(screen.getByTestId("smart-image-direct"));

    // Should show failure state
    expect(screen.getByText("Image failed to load")).toBeInTheDocument();
    expect(screen.getByText("Try direct link")).toBeInTheDocument();
    expect(screen.queryByTestId("smart-image-direct")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });
});
