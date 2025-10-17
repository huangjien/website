import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueModal } from "../IssueModal";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
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

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiEdit: () => <div data-testid='edit-icon' />,
  BiListPlus: () => <div data-testid='list-plus-icon' />,
}));

describe("IssueModal Component", () => {
  const mockIssue = {
    id: 1,
    number: 123,
    title: "Test Issue",
    body: "Test issue body",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render edit button for edit action", () => {
    render(<IssueModal issue={mockIssue} action='edit' />);
    expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
  });

  it("should render new button for new action", () => {
    render(<IssueModal action='new' />);
    expect(screen.getByTestId("list-plus-icon")).toBeInTheDocument();
  });

  it("should render modal with correct structure", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    expect(screen.getByTestId("modal-body")).toBeInTheDocument();
    expect(screen.getByTestId("modal-footer")).toBeInTheDocument();
  });

  it("should render input and textarea fields", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("should render checkbox group with tags", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    expect(screen.getByTestId("checkbox-group")).toBeInTheDocument();
    expect(screen.getByText("blog")).toBeInTheDocument();
    expect(screen.getByText("programming")).toBeInTheDocument();
    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
    expect(screen.getByText("novel")).toBeInTheDocument();
  });

  it("should render markdown preview area", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    expect(screen.getByTestId("markdown")).toBeInTheDocument();
  });

  it("should render close and save buttons", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should populate fields when issue is provided", async () => {
    const user = userEvent.setup();
    render(<IssueModal issue={mockIssue} action='edit' />);
    await user.click(screen.getByTestId("edit-icon"));

    const titleInput = screen.getByTestId("input");
    const contentTextarea = screen.getByTestId("textarea");

    expect(titleInput).toHaveValue("Test Issue");
    expect(contentTextarea).toHaveValue("Test issue body");
  });

  it("should handle title input change", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    const titleInput = screen.getByTestId("input");
    await user.type(titleInput, "New Issue Title");

    expect(titleInput).toHaveValue("New Issue Title");
  });

  it("should handle content textarea change", async () => {
    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    const contentTextarea = screen.getByTestId("textarea");
    await user.type(contentTextarea, "New issue content");

    expect(contentTextarea).toHaveValue("New issue content");
  });
});
