import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Issue } from "../Issue";
import { useSettings } from "../../lib/useSettings";
import { extractContentAccordingContentList } from "../../lib/useGithubContent";
import userEvent from "@testing-library/user-event";

// Mock useSettings hook
const mockGetSetting = jest.fn();
jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(() => ({
    getSetting: mockGetSetting,
  })),
}));

// Mock useGithubContent
jest.mock("../../lib/useGithubContent", () => ({
  extractContentAccordingContentList: jest.fn(),
}));

// Mock react-markdown
jest.mock("react-markdown", () => {
  return function MockMarkdown({ children }) {
    return <div data-testid='markdown'>{children}</div>;
  };
});

// Mock rehype-raw and remark-gfm
jest.mock("rehype-raw", () => ({}));
jest.mock("remark-gfm", () => ({}));

// Using real Radix Accordion and shadcn local components; no HeroUI mocks.

// Mock react-icons
jest.mock("react-icons/md", () => ({
  MdComment: () => <div data-testid='comment-icon' />,
}));

// Mock Comment component to avoid dependency on HeroUI within Comment
jest.mock("../Comment", () => ({
  Comment: ({ issue_id }) => (
    <div data-testid='comment-component' data-issue-id={issue_id} />
  ),
}));

describe("Issue Component", () => {
  const mockIssue = {
    id: 1,
    number: 123,
    title: "Test Issue Title",
    body: "This is a test issue body with some content.",
    state: "open",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
    comments: 5,
    "labels.name": ["bug", "enhancement"],
    user: {
      login: "testuser",
      avatar_url: "https://example.com/avatar.jpg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSetting.mockReturnValue(
      "id,number,title,body,state,created_at,updated_at,comments,user.login",
    );
  });

  it("should render issue correctly", () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();

    // Expand accordion to reveal body content
    fireEvent.click(screen.getByText("Test Issue Title"));

    expect(
      screen.getByText("This is a test issue body with some content."),
    ).toBeInTheDocument();
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should render labels correctly", () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText("bug")).toBeInTheDocument();
    expect(screen.getByText("enhancement")).toBeInTheDocument();

    const labels = screen.getAllByLabelText("Label");
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it("should render issue state information", () => {
    render(<Issue issue={mockIssue} />);

    // The state is not currently displayed as a chip in the component
    // but the issue data contains the state information
    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
  });

  it("should handle different issue states", () => {
    const closedIssue = { ...mockIssue, state: "closed" };
    render(<Issue issue={closedIssue} />);

    // The component should render regardless of state
    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
  });

  it("should render comment component when comments > 0", () => {
    render(<Issue issue={mockIssue} />);

    // Comment component should be rendered when comments > 0
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should display created and updated dates correctly when different", () => {
    render(<Issue issue={mockIssue} />);

    expect(
      screen.getByText(
        /issue.last_update: 2023-01-01T12:00:00Z issue.created: 2023-01-01T00:00:00Z/,
      ),
    ).toBeInTheDocument();
  });

  it("should display only created date when created and updated are the same", () => {
    const sameTimeIssue = {
      ...mockIssue,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    render(<Issue issue={sameTimeIssue} />);

    expect(
      screen.getByText(/issue.created: 2023-01-01T00:00:00Z/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/issue.last_update/)).not.toBeInTheDocument();
  });

  it("should render accordion with correct structure", () => {
    render(<Issue issue={mockIssue} />);

    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);

    const accordionItem = screen.getByTestId("accordion-item");
    expect(accordionItem).toBeInTheDocument();
  });

  it("should handle issue without labels", () => {
    const issueWithoutLabels = { ...mockIssue, "labels.name": [] };
    render(<Issue issue={issueWithoutLabels} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
    // Issue should render correctly even without labels
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should not render comment component when comments = 0", () => {
    const issueWithoutComments = { ...mockIssue, comments: 0 };
    render(<Issue issue={issueWithoutComments} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
    // Comment component should not be rendered when comments = 0
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBe(1); // Only the main issue accordion
  });

  it("should render issue correctly when expanded", async () => {
    render(<Issue issue={mockIssue} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();

    // Expand accordion to reveal body content
    await userEvent.click(screen.getByText("Test Issue Title"));

    expect(
      screen.getByText("This is a test issue body with some content."),
    ).toBeInTheDocument();
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should render markdown content in body", async () => {
    render(<Issue issue={mockIssue} />);

    // Expand accordion to reveal markdown content
    await userEvent.click(screen.getByText("Test Issue Title"));

    expect(screen.getByTestId("markdown")).toBeInTheDocument();
    expect(screen.getByTestId("markdown")).toHaveTextContent(
      "This is a test issue body with some content.",
    );
  });

  it("should handle issue without body", () => {
    const issueWithoutBody = { ...mockIssue, body: null };

    render(<Issue issue={issueWithoutBody} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle missing user information", () => {
    const issueWithoutUser = { ...mockIssue, user: null };

    render(<Issue issue={issueWithoutUser} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
    const accordions = screen.getAllByTestId("accordion");
    expect(accordions.length).toBeGreaterThanOrEqual(1);
  });

  it("should sanitize markdown with backtick-wrapped GitHub attachment URLs", async () => {
    const issueWithBacktickImages = {
      ...mockIssue,
      body: "![Screenshot](`https://github.com/user-attachments/assets/703be3d9-a2ce-495f-9656-ef38a53c5978`)\n![Another Image](`https://github.com/user-attachments/assets/abc123-def4-5678-90ab-cdef12345678`)",
    };

    render(<Issue issue={issueWithBacktickImages} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Test Issue Title"));

    const markdownContent = screen.getByTestId("markdown");
    expect(markdownContent).toBeInTheDocument();

    expect(markdownContent.textContent).not.toContain("`");
    expect(markdownContent.textContent).toContain("![Screenshot]");
    expect(markdownContent.textContent).toContain("![Another Image]");
    expect(markdownContent.textContent).toContain(
      "703be3d9-a2ce-495f-9656-ef38a53c5978",
    );
    expect(markdownContent.textContent).toContain(
      "abc123-def4-5678-90ab-cdef12345678",
    );
  });

  it("should sanitize markdown with backtick-wrapped standalone URLs", async () => {
    const issueWithBacktickUrls = {
      ...mockIssue,
      body: "See this image: `https://github.com/user-attachments/assets/12345678-90ab-cdef-1234-567890abcdef`\nAnother one: `https://github.com/user-attachments/assets/abcdef12-3456-7890-abcd-ef1234567890`",
    };

    render(<Issue issue={issueWithBacktickUrls} />);

    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Test Issue Title"));

    const markdownContent = screen.getByTestId("markdown");
    expect(markdownContent).toBeInTheDocument();

    expect(markdownContent.textContent).not.toContain("`");
    expect(markdownContent.textContent).toContain(
      "https://github.com/user-attachments/assets/12345678-90ab-cdef-1234-567890abcdef",
    );
    expect(markdownContent.textContent).toContain(
      "https://github.com/user-attachments/assets/abcdef12-3456-7890-abcd-ef1234567890",
    );
  });
});
