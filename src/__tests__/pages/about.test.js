import React from "react";
import { render, screen } from "@testing-library/react";
import About from "../../pages/about";
import { useTitle } from "ahooks";
import { useTranslation } from "react-i18next";
import { useGithubContent } from "../../lib/useGithubContent";

// Mock dependencies
jest.mock("ahooks", () => ({
  useTitle: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("../../lib/useGithubContent", () => ({
  useGithubContent: jest.fn(),
}));

// Mock react-markdown and its plugins
jest.mock("react-markdown", () => {
  return function MockMarkdown({ children, remarkPlugins, rehypePlugins }) {
    return (
      <div
        data-testid='markdown-content'
        data-remark-plugins={remarkPlugins?.length || 0}
        data-rehype-plugins={rehypePlugins?.length || 0}
      >
        {children}
      </div>
    );
  };
});

jest.mock("remark-gfm", () => "remark-gfm");
jest.mock("rehype-raw", () => "rehype-raw");

describe("About page", () => {
  const mockT = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useTranslation.mockReturnValue({
      t: mockT,
    });

    mockT.mockImplementation((key) => {
      const translations = {
        "header.about": "About",
      };
      return translations[key] || key;
    });
  });

  it("should render without crashing", () => {
    useGithubContent.mockReturnValue({
      about: "# About Me\nThis is my about page.",
    });

    render(<About />);

    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
  });

  it("should set page title using useTitle hook", () => {
    useGithubContent.mockReturnValue({
      about: "About content",
    });

    render(<About />);

    expect(useTitle).toHaveBeenCalledWith("About");
    expect(mockT).toHaveBeenCalledWith("header.about");
  });

  it("should display about content from useGithubContent", () => {
    const aboutContent = "# About Me\n\nThis is my personal website.";

    useGithubContent.mockReturnValue({
      about: aboutContent,
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toHaveTextContent(
      "# About Me This is my personal website.",
    );
  });

  it("should handle empty about content", () => {
    useGithubContent.mockReturnValue({
      about: "",
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement).toHaveTextContent("");
  });

  it("should handle null about content", () => {
    useGithubContent.mockReturnValue({
      about: null,
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toBeInTheDocument();
  });

  it("should handle undefined about content", () => {
    useGithubContent.mockReturnValue({
      about: undefined,
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toBeInTheDocument();
  });

  it("should use correct CSS classes for styling", () => {
    useGithubContent.mockReturnValue({
      about: "Test content",
    });

    const { container } = render(<About />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      "prose",
      "prose-2xl",
      "dark:prose-invert",
      "justify-center",
      "items-center",
      "gap-8",
      "m-2",
      "w-full",
    );
  });

  it("should configure Markdown component with correct plugins", () => {
    useGithubContent.mockReturnValue({
      about: "# Test\n\n- List item",
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toHaveAttribute("data-remark-plugins", "1");
    expect(markdownElement).toHaveAttribute("data-rehype-plugins", "1");
  });

  it("should render markdown content with complex formatting", () => {
    const complexMarkdown = `
# Main Title

## Subtitle

**Bold text** and *italic text*

- List item 1
- List item 2

[Link](https://example.com)

\`\`\`javascript
console.log('code block');
\`\`\`
    `;

    useGithubContent.mockReturnValue({
      about: complexMarkdown,
    });

    render(<About />);

    const markdownElement = screen.getByTestId("markdown-content");
    expect(markdownElement).toHaveTextContent(
      "# Main Title ## Subtitle **Bold text** and *italic text* - List item 1 - List item 2 [Link](https://example.com) ```javascript console.log('code block'); ```",
    );
  });

  it("should call useGithubContent hook", () => {
    useGithubContent.mockReturnValue({
      about: "Test content",
    });

    render(<About />);

    expect(useGithubContent).toHaveBeenCalled();
  });

  it("should call useTranslation hook", () => {
    useGithubContent.mockReturnValue({
      about: "Test content",
    });

    render(<About />);

    expect(useTranslation).toHaveBeenCalled();
  });
});
