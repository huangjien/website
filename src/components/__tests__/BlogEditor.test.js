import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogEditor, BLOG_DRAFT_KEY } from "../BlogEditor";

jest.mock("react-markdown", () => ({ children }) => (
  <div data-testid='markdown-preview'>{children}</div>
));
jest.mock("rehype-raw", () => ({}));
jest.mock("remark-gfm", () => ({}));

const successfulResponse = {
  ok: true,
  status: 200,
  json: async () => ({
    id: 61,
    number: 61,
    title: "A thoughtful post",
    html_url: "https://github.com/huangjien-com/blog/issues/61",
  }),
};

describe("BlogEditor", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue(successfulResponse);
  });

  it("provides title, body, labels, preview, draft, and publish controls", () => {
    render(<BlogEditor />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Markdown body")).toBeInTheDocument();
    expect(screen.getByLabelText("Add label")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save draft" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
    expect(screen.getByText("blog")).toBeInTheDocument();
  });

  it("adds and removes a custom label", async () => {
    const user = userEvent.setup();
    render(<BlogEditor />);

    await user.type(screen.getByLabelText("Add label"), "programming");
    await user.keyboard("{Enter}");

    expect(screen.getByText("programming")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Remove programming label" }),
    );
    expect(screen.queryByText("programming")).not.toBeInTheDocument();
  });

  it("saves and restores a local draft", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<BlogEditor />);

    await user.type(screen.getByLabelText("Title"), "Draft title");
    await user.type(screen.getByLabelText("Markdown body"), "Draft body");
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    expect(JSON.parse(localStorage.getItem(BLOG_DRAFT_KEY))).toEqual(
      expect.objectContaining({ title: "Draft title", body: "Draft body" }),
    );

    unmount();
    render(<BlogEditor />);
    expect(screen.getByLabelText("Title")).toHaveValue("Draft title");
    expect(screen.getByLabelText("Markdown body")).toHaveValue("Draft body");
  });

  it("confirms and publishes an issue with user-selected labels", async () => {
    const user = userEvent.setup();
    render(<BlogEditor />);

    await user.type(screen.getByLabelText("Title"), "A thoughtful post");
    await user.type(screen.getByLabelText("Markdown body"), "# Hello world");
    await user.type(screen.getByLabelText("Add label"), "AI");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(screen.getByText("Publish this article?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm publish" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/issues",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "A thoughtful post",
          body: "# Hello world",
          labels: ["AI"],
        }),
      }),
    );
    expect(await screen.findByText("Article published")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open in GitHub" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/huangjien-com/blog/issues/61",
    );
  });

  it("does not lose content when publishing fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: { get: () => null },
      json: async () => ({ error: "Forbidden" }),
    });
    const user = userEvent.setup();
    render(<BlogEditor />);

    await user.type(screen.getByLabelText("Title"), "Keep me");
    await user.type(screen.getByLabelText("Markdown body"), "Important body");
    await user.click(screen.getByRole("button", { name: "Publish" }));
    await user.click(screen.getByRole("button", { name: "Confirm publish" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Keep me");
    expect(screen.getByLabelText("Markdown body")).toHaveValue(
      "Important body",
    );
  });

  it("prevents publishing without both title and body", async () => {
    render(<BlogEditor />);
    const publish = screen.getByRole("button", { name: "Publish" });
    expect(publish).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Title only" },
    });
    expect(publish).toBeDisabled();
  });
});
