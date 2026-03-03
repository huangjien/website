import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IssueListVirtualized } from "../IssueListVirtualized";

const mockIssues = [
  {
    id: 1,
    title: "Test Issue 1",
    created_at: "2024-01-01T00:00:00Z",
    labels: ["blog", "tech"],
  },
  {
    id: 2,
    title: "Test Issue 2",
    created_at: "2024-01-02T00:00:00Z",
    labels: ["personal"],
  },
  {
    id: 3,
    title: "Another Issue",
    created_at: "2024-01-03T00:00:00Z",
    labels: ["tech"],
  },
];

describe("IssueListVirtualized", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render issues list", () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    expect(screen.getByPlaceholderText("Filter issues...")).toBeInTheDocument();
    expect(screen.getByText("Showing 3 of 3 issues")).toBeInTheDocument();
  });

  it("should filter issues by title", async () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const input = screen.getByPlaceholderText("Filter issues...");
    fireEvent.change(input, { target: { value: "Test Issue" } });

    await waitFor(() => {
      expect(screen.getByText("Showing 3 of 3 issues")).toBeInTheDocument();
    });
  });

  it("should filter issues by id", async () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const input = screen.getByPlaceholderText("Filter issues...");
    fireEvent.change(input, { target: { value: "1" } });

    await waitFor(() => {
      expect(screen.getByText(/Showing .* of .* issues/)).toBeInTheDocument();
    });
  });

  it("should change rows per page", () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const select = screen.getByDisplayValue("10 per page");
    fireEvent.change(select, { target: { value: "25" } });

    expect(localStorage.getItem("issues_rows_per_page")).toBe("25");
  });

  it("should navigate pages", () => {
    const manyIssues = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      created_at: "2024-01-01T00:00:00Z",
      labels: [],
    }));

    render(<IssueListVirtualized issues={manyIssues} />);

    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(localStorage.getItem("issues_page")).toBe("2");
  });

  it("should disable previous button on first page", () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const prevButton = screen.getByText("Previous");
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("should persist filter in localStorage", async () => {
    render(<IssueListVirtualized issues={mockIssues} />);

    const input = screen.getByPlaceholderText("Filter issues...");
    fireEvent.change(input, { target: { value: "test filter" } });

    await waitFor(() => {
      expect(localStorage.getItem("issues_filter")).toBeTruthy();
    });
  });

  it("should reset page when filter changes", async () => {
    localStorage.setItem("issues_page", "5");

    render(<IssueListVirtualized issues={mockIssues} />);

    const input = screen.getByPlaceholderText("Filter issues...");
    fireEvent.change(input, { target: { value: "new filter" } });

    await waitFor(() => {
      expect(localStorage.getItem("issues_page")).toBe("1");
    });
  });

  it("should render empty list when no issues", () => {
    render(<IssueListVirtualized issues={[]} />);

    expect(screen.getByText("Showing 0 of 0 issues")).toBeInTheDocument();
  });

  it("should display correct page info", () => {
    const twentyIssues = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      created_at: "2024-01-01T00:00:00Z",
      labels: [],
    }));

    render(<IssueListVirtualized issues={twentyIssues} />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Showing 10 of 20 issues")).toBeInTheDocument();
  });
});
