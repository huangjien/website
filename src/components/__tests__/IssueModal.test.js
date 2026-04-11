import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueModal } from "../IssueModal";

// Mock react-markdown
jest.mock("react-markdown", () => {
  return function MockMarkdown({ children }) {
    return <div data-testid='markdown'>{children}</div>;
  };
});

// Mock rehype-raw and remark-gfm
jest.mock("rehype-raw", () => ({}));
jest.mock("remark-gfm", () => ({}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 1, title: "Test" }),
  }),
);

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiEdit: () => <div data-testid='edit-icon' />,
  BiListPlus: () => <div data-testid='list-plus-icon' />,
  BiCheck: () => <div data-testid='check-icon' />,
  BiX: () => <div data-testid='x-icon' />,
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
    expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
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

  it("should prevent duplicate issue submissions while request is in flight", async () => {
    let resolveRequest;
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));

    const titleInput = screen.getByTestId("input");
    await user.type(titleInput, "Reliability check");

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveRequest({
      ok: true,
      json: async () => ({ id: 99, title: "Reliability check" }),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should show actionable auth message on unauthorized error", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        headers: { get: () => null },
        json: async () => ({ error: "Unauthorized" }),
      }),
    );

    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));
    await user.type(screen.getByTestId("input"), "Auth failure case");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(
        screen.getByText("Your session expired. Please sign in and retry."),
      ).toBeInTheDocument();
    });
  });

  it("should show retry guidance on rate limit error", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        headers: { get: () => null },
        json: async () => ({ retryAfter: 12 }),
      }),
    );

    const user = userEvent.setup();
    render(<IssueModal action='new' />);
    await user.click(screen.getByTestId("list-plus-icon"));
    await user.type(screen.getByTestId("input"), "Rate limit case");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Rate limit reached. Please wait {{seconds}} seconds and retry.",
        ),
      ).toBeInTheDocument();
    });
  });
});
