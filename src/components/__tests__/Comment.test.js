/* eslint-disable @next/next/no-img-element */
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Comment } from "../Comment";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../lib/useSettings";
import { extractContentAccordingContentList } from "../../lib/useGithubContent";

// Stub local Accordion wrapper to simple HTML elements for reliable testing
jest.mock("../ui/accordion", () => {
  const React = require("react");
  return {
    Root: ({ children, className, ...props }) => {
      // Filter out non-DOM props
      const {
        type: _type,
        collapsible: _collapsible,
        value: _value,
        ...rest
      } = props;
      return (
        <div data-testid='accordion' className={className} {...rest}>
          {children}
        </div>
      );
    },
    Item: ({ children, className, ...props }) => (
      <div data-testid='accordion-item' className={className} {...props}>
        {children}
      </div>
    ),
    Header: ({ children, className, ...props }) => (
      <div data-testid='accordion-header' className={className} {...props}>
        {children}
      </div>
    ),
    Trigger: React.forwardRef(({ children, className, ...props }, ref) => (
      <button
        ref={ref}
        data-testid='accordion-trigger'
        className={className}
        {...props}
      >
        {children}
      </button>
    )),
    Content: React.forwardRef(({ children, className, ...props }, ref) => (
      <div
        ref={ref}
        data-testid='accordion-content'
        className={className}
        {...props}
      >
        {children}
      </div>
    )),
  };
});

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock useSettings hook
jest.mock("../../lib/useSettings", () => ({
  useSettings: jest.fn(),
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

// Mock fetch
global.fetch = jest.fn();

// Mock @radix-ui/react-avatar to make Image accessible in tests
jest.mock("@radix-ui/react-avatar", () => {
  const React = require("react");
  return {
    Root: ({ children, className, ...props }) => (
      <span data-testid='avatar' className={className} {...props}>
        {children}
      </span>
    ),
    Image: ({ src, alt, ...props }) => (
      <img data-testid='avatar-image' src={src} alt={alt} {...props} />
    ),
    Fallback: ({ children, className, ...props }) => (
      <span data-testid='avatar-fallback' className={className} {...props}>
        {children}
      </span>
    ),
  };
});

describe("Comment Component", () => {
  const mockGetSetting = jest.fn();
  const mockComments = [
    {
      id: 1,
      body: "This is a test comment",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      user: {
        login: "testuser",
        avatar_url: "https://example.com/avatar.jpg",
      },
    },
    {
      id: 2,
      body: "Another test comment",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T12:00:00Z",
      user: {
        login: "anotheruser",
        avatar_url: "https://example.com/avatar2.jpg",
      },
    },
  ];

  const mockExtractedComments = [
    {
      id: 1,
      body: "This is a test comment",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      "user.login": "testuser",
      "user.avatar_url": "https://example.com/avatar.jpg",
    },
    {
      id: 2,
      body: "Another test comment",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T12:00:00Z",
      "user.login": "anotheruser",
      "user.avatar_url": "https://example.com/avatar2.jpg",
    },
  ];

  beforeEach(() => {
    // Reset and setup fetch mock
    jest.clearAllMocks();
    if (!global.fetch || !jest.isMockFunction(global.fetch)) {
      global.fetch = jest.fn();
    }
    global.fetch.mockReset();
    // Provide a benign default fetch implementation to avoid undefined res in tests not mocking fetch explicitly
    global.fetch.mockImplementation(() =>
      Promise.resolve({ ok: true, json: async () => [] })
    );
    useSettings.mockReturnValue({
      getSetting: mockGetSetting,
    });
    mockGetSetting.mockReturnValue(
      "id,body,created_at,updated_at,user.login,user.avatar_url"
    );
    extractContentAccordingContentList.mockImplementation(
      (contentList, comment) => {
        return {
          id: comment.id,
          body: comment.body,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          "user.login": comment.user?.login,
          "user.avatar_url": comment.user?.avatar_url,
        };
      }
    );
  });

  // Removed duplicated variable block and beforeEach

  it("should render comments correctly", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={123} />);

    // Ensure fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/comments?issue_number=123",
        { method: "GET" }
      );
    });

    // Wait for comment texts to appear (avoid reliance on accordion internals)
    await waitFor(
      () => {
        expect(screen.getByText("This is a test comment")).toBeInTheDocument();
        expect(screen.getByText("Another test comment")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should fetch comments with correct API endpoint", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={456} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/comments?issue_number=456",
        {
          method: "GET",
        }
      );
    });
  });

  it("should display created and updated dates correctly", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      // For first comment (created_at === updated_at)
      expect(
        screen.getByText(/issue.created: 2023-01-01T00:00:00Z/)
      ).toBeInTheDocument();

      // For second comment (created_at !== updated_at)
      expect(
        screen.getByText(
          /issue.last_update: 2023-01-02T12:00:00Z issue.created: 2023-01-02T00:00:00Z/
        )
      ).toBeInTheDocument();
    });
    // Debug DOM after dates render
    screen.debug(undefined, 20000);
  });

  it("should render avatars with correct props", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={123} />);

    // Verify avatars and their image src via accessible role/name
    const avatars = await screen.findAllByTestId("avatar");
    expect(avatars).toHaveLength(2);

    const img1 = within(avatars[0]).getByRole("img", { name: "testuser" });
    expect(img1).toHaveAttribute("src", "https://example.com/avatar.jpg");

    const img2 = within(avatars[1]).getByRole("img", { name: "anotheruser" });
    expect(img2).toHaveAttribute("src", "https://example.com/avatar2.jpg");
  });

  it("should call extractContentAccordingContentList for each comment", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(extractContentAccordingContentList).toHaveBeenCalledTimes(2);
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        [
          "id",
          "body",
          "created_at",
          "updated_at",
          "user.login",
          "user.avatar_url",
        ],
        mockComments[0]
      );
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        [
          "id",
          "body",
          "created_at",
          "updated_at",
          "user.login",
          "user.avatar_url",
        ],
        mockComments[1]
      );
    });
  });

  it("should handle empty comments array", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(screen.queryByTestId("accordion-item")).not.toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    global.fetch.mockRejectedValueOnce(new Error("API Error"));

    render(<Comment issue_id={123} />);

    // Component should still render without crashing
    expect(screen.queryByTestId("accordion")).toBeInTheDocument();
  });

  it("should not render when commentList is null", () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => null,
      })
    );

    const { container } = render(<Comment issue_id={123} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should use comment content settings correctly", async () => {
    mockGetSetting.mockReturnValue("id,body,user.login");

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockComments,
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      expect(mockGetSetting).toHaveBeenCalledWith("comment.content");
      expect(extractContentAccordingContentList).toHaveBeenCalledWith(
        ["id", "body", "user.login"],
        expect.any(Object)
      );
    });
  });

  it("should sanitize markdown with backtick-wrapped GitHub attachment URLs in comments", async () => {
    const commentsWithBacktickImages = [
      {
        id: 1,
        body: "![Screenshot](`https://github.com/user-attachments/assets/703be3d9-a2ce-495f-9656-ef38a53c5978`)",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        user: {
          login: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
        },
      },
    ];

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => commentsWithBacktickImages,
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      const markdownContent = screen.getByTestId("markdown");
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent.textContent).not.toContain("`");
      expect(markdownContent.textContent).toContain("![Screenshot]");
      expect(markdownContent.textContent).toContain("703be3d9-a2ce-495f-9656-ef38a53c5978");
    });
  });

  it("should sanitize markdown with backtick-wrapped standalone URLs in comments", async () => {
    const commentsWithBacktickUrls = [
      {
        id: 1,
        body: "See this image: `https://github.com/user-attachments/assets/12345678-90ab-cdef-1234-567890abcdef`",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        user: {
          login: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
        },
      },
    ];

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => commentsWithBacktickUrls,
      })
    );

    render(<Comment issue_id={123} />);

    await waitFor(() => {
      const markdownContent = screen.getByTestId("markdown");
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent.textContent).not.toContain("`");
      expect(markdownContent.textContent).toContain("https://github.com/user-attachments/assets/12345678-90ab-cdef-1234-567890abcdef");
    });
  });
});
