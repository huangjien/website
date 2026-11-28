import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueList } from "../IssueList";

undefined; // Mock ahooks
jest.mock("ahooks", () => ({
  useDebounceEffect: jest.fn(),
  useRequest: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

// Mock components
jest.mock("../Issue", () => {
  const MockIssue = ({ issue }) => (
    <div data-testid='issue-component'>{issue.title}</div>
  );
  return {
    Issue: MockIssue,
    default: MockIssue,
  };
});

jest.mock("../Joke", () => {
  const MockJoke = () => <div data-testid='joke-component'>Joke Component</div>;
  return {
    Joke: MockJoke,
    default: MockJoke,
  };
});

jest.mock("../IssueModal", () => {
  const MockIssueModal = () => <div data-testid='issue-modal'>Issue Modal</div>;
  return {
    IssueModal: MockIssueModal,
    default: MockIssueModal,
  };
});

jest.mock("../EmptyState", () => {
  return {
    __esModule: true,
    default: () => <div data-testid='empty-state'>No issues to display</div>,
    EmptyState: () => <div data-testid='empty-state'>No issues to display</div>,
  };
});

jest.mock("../Comment", () => {
  const MockComment = () => <div data-testid='comment-component'>Comment</div>;
  return {
    Comment: MockComment,
    default: MockComment,
  };
});

jest.mock("react-markdown", () => {
  const MockMarkdown = ({ children }) => (
    <div data-testid='markdown'>{children}</div>
  );
  return MockMarkdown;
});

jest.mock("rehype-raw", () => ({}));
jest.mock("remark-gfm", () => ({}));

const mockData = [
  {
    id: 1,
    title: "First Issue",
    body: "This is the first issue content",
    labels: [{ name: "bug" }],
  },
  {
    id: 2,
    title: "Second Issue",
    body: "This is the second issue content",
    labels: [{ name: "feature" }],
  },
  {
    id: 3,
    title: "Third Issue",
    body: "This is the third issue content",
    labels: [{ name: "enhancement" }],
  },
];

describe("IssueList", () => {
  it("renders the issue list with data", () => {
    render(
      <IssueList
        tags={["bug"]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    expect(
      within(screen.getByRole("list")).getByText("First Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Second Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Third Issue"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("joke-component")).toBeInTheDocument();
  });

  it("filters data based on search input", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "First");

    expect(
      within(screen.getByRole("list")).getByText("First Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Second Issue"),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Third Issue"),
    ).not.toBeInTheDocument();
  });

  it("clears search filter when clear button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "First");

    // Find and click the clear button
    const clearButton = searchInput.parentElement.querySelector("button");
    await user.click(clearButton);

    expect(
      within(screen.getByRole("list")).getByText("First Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Second Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Third Issue"),
    ).toBeInTheDocument();
  });

  it("changes rows per page when select value changes", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const rowsSelect = screen.getByDisplayValue("5");
    await user.selectOptions(rowsSelect, "10");

    expect(rowsSelect.value).toBe("10");
  });

  it("displays correct total count", () => {
    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    expect(screen.getByText("issue.total")).toBeInTheDocument();
  });

  it("handles pagination correctly", async () => {
    const user = userEvent.setup();
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      body: `Content ${i + 1}`,
      labels: [],
    }));

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={largeData}
        inTab='issue'
      />,
    );

    // Should show first 5 items by default
    expect(
      within(screen.getByRole("list")).getByText("Issue 1"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 5"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Issue 6"),
    ).not.toBeInTheDocument();

    // Navigate to page 2
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    expect(
      within(screen.getByRole("list")).getByText("Issue 6"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 10"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Issue 1"),
    ).not.toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(
      <IssueList tags={[]} ComponentName='Issue' data={[]} inTab='issue' />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByTestId("joke-component")).toBeInTheDocument();
  });

  it("handles undefined data gracefully", () => {
    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={undefined}
        inTab='issue'
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("handles null data gracefully", () => {
    render(
      <IssueList tags={[]} ComponentName='Issue' data={null} inTab='issue' />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("resets page to 1 when data changes", () => {
    const { rerender } = render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    // Navigate to page 2 first
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Change data
    const newData = [
      { id: 4, title: "New Issue", body: "New content", labels: [] },
    ];
    rerender(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={newData}
        inTab='issue'
      />,
    );

    // Should reset to page 1
    expect(
      within(screen.getByRole("list")).getByText("New Issue"),
    ).toBeInTheDocument();
  });

  it("handles case-insensitive search filtering", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "FIRST");

    expect(
      within(screen.getByRole("list")).getByText("First Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Second Issue"),
    ).not.toBeInTheDocument();
  });

  it("filters by nested object properties", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "bug");

    expect(
      within(screen.getByRole("list")).getByText("First Issue"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Second Issue"),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Third Issue"),
    ).not.toBeInTheDocument();
  });

  it("renders default component for unknown ComponentName", () => {
    render(
      <IssueList
        tags={[]}
        ComponentName='UnknownComponent'
        data={mockData}
        inTab='issue'
      />,
    );

    // Should render JSON representation as fallback
    const jsonElements = screen.getAllByText(/"title":/);
    expect(jsonElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/"First Issue"/)).toBeInTheDocument();
  });

  it("handles pagination when filtered results change", async () => {
    const user = userEvent.setup();
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      body: `Content ${i + 1}`,
      labels: [],
    }));

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={largeData}
        inTab='issue'
      />,
    );

    // Navigate to page 3
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);
    await user.click(nextButton);

    // Apply filter that reduces results
    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "Issue 1");

    // Should reset to page 1 and show filtered results
    expect(
      within(screen.getByRole("list")).getByText("Issue 1"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 10"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 11"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 12"),
    ).toBeInTheDocument();
  });

  it("maintains correct page count when rows per page changes", async () => {
    const user = userEvent.setup();
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      body: `Content ${i + 1}`,
      labels: [],
    }));

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={largeData}
        inTab='issue'
      />,
    );

    // Change to 10 rows per page
    const rowsSelect = screen.getByDisplayValue("5");
    await user.selectOptions(rowsSelect, "10");

    // Should show more items on first page
    expect(
      within(screen.getByRole("list")).getByText("Issue 1"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Issue 10"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("Issue 11"),
    ).not.toBeInTheDocument();
  });

  it("handles empty search results", async () => {
    const user = userEvent.setup();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const searchInput = screen.getByPlaceholderText("global.search");
    await user.type(searchInput, "nonexistent");

    // Should show no results but component should still render
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).queryByText("First Issue"),
    ).not.toBeInTheDocument();
  });

  it("handles data with missing id property", () => {
    const dataWithoutIds = [
      { title: "Issue without ID", body: "Content", labels: [] },
      { title: "Another issue", body: "More content", labels: [] },
    ];

    // Suppress the React key warning for this specific test
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={dataWithoutIds}
        inTab='issue'
      />,
    );

    expect(
      within(screen.getByRole("list")).getByText("Issue without ID"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list")).getByText("Another issue"),
    ).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it("displays correct total count with zero data", () => {
    render(
      <IssueList tags={[]} ComponentName='Issue' data={[]} inTab='issue' />,
    );

    expect(screen.getByText("issue.total")).toBeInTheDocument();
  });

  it("handles rapid pagination clicks", async () => {
    const user = userEvent.setup();
    const largeData = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      body: `Content ${i + 1}`,
      labels: [],
    }));

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={largeData}
        inTab='issue'
      />,
    );

    const nextButton = screen.getByRole("button", { name: /next/i });

    // Rapid clicks
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    // Should handle gracefully without errors
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders the article index with the visible items", () => {
    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const index = screen.getByTestId("article-index");
    expect(index).toBeInTheDocument();
    expect(within(index).getByText("First Issue")).toBeInTheDocument();
    expect(within(index).getByText("Second Issue")).toBeInTheDocument();
  });

  it("opens the chosen article and scrolls to it", () => {
    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <IssueList
        tags={[]}
        ComponentName='Issue'
        data={mockData}
        inTab='issue'
      />,
    );

    const index = screen.getByTestId("article-index");
    fireEvent.click(within(index).getByText("First Issue"));

    expect(scrollIntoView).toHaveBeenCalled();
  });
});
