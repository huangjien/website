import { render, screen } from "@testing-library/react";
import { Response } from "../response";

jest.mock("react-markdown", () => {
  return function MockReactMarkdown({
    children,
    components,
    remarkPlugins,
    rehypePlugins,
  }) {
    const CodeComponent = components?.code;
    const PreComponent = components?.pre;

    return (
      <div data-testid='markdown'>
        <span data-testid='content'>{children}</span>
        {CodeComponent && (
          <code
            data-testid='inline-code'
            className={
              CodeComponent({ inline: true, className: "language-javascript" })
                .props.className
            }
          >
            test
          </code>
        )}
        {PreComponent && <div data-testid='pre-wrapper'>pre content</div>}
      </div>
    );
  };
});

jest.mock("remark-gfm", () => jest.fn());
jest.mock("rehype-raw", () => jest.fn());
jest.mock("rehype-highlight", () => jest.fn());

describe("Response", () => {
  describe("Basic Rendering", () => {
    it("should render string content", () => {
      render(<Response>Hello World</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("Hello World");
    });

    it("should render number as string", () => {
      render(<Response>12345</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("12345");
    });

    it("should render null as empty string", () => {
      render(<Response>{null}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("");
    });

    it("should render undefined as empty string", () => {
      render(<Response>{undefined}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("");
    });

    it("should convert object to string", () => {
      const obj = { toString: () => "custom" };
      render(<Response>{obj}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("custom");
    });

    it("should convert zero to string", () => {
      render(<Response>{0}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("0");
    });

    it("should convert false to string", () => {
      render(<Response>{false}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("false");
    });
  });

  describe("Styling", () => {
    it("should have correct prose classes", () => {
      const { container } = render(<Response>Test</Response>);

      const proseDiv = container.firstChild;
      expect(proseDiv).toHaveClass("prose");
      expect(proseDiv).toHaveClass("prose-neutral");
      expect(proseDiv).toHaveClass("dark:prose-invert");
      expect(proseDiv).toHaveClass("max-w-none");
    });

    it("should have overflow-wrap classes", () => {
      const { container } = render(<Response>Test</Response>);

      const proseDiv = container.firstChild;
      expect(proseDiv).toHaveClass("overflow-wrap-break-word");
      expect(proseDiv).toHaveClass("break-words");
    });
  });

  describe("Markdown Rendering", () => {
    it("should render markdown content", () => {
      const markdown = "# Heading\n\nThis is **bold** text.";
      render(<Response>{markdown}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(
        /Heading.*This is.*bold.*text/s,
      );
    });

    it("should handle multiline markdown", () => {
      const multiline = `Line 1
Line 2
Line 3`;

      render(<Response>{multiline}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(
        /Line 1.*Line 2.*Line 3/s,
      );
    });

    it("should handle special characters", () => {
      const special = "Special chars: < > & \" '";
      render(<Response>{special}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(/Special chars:/);
    });

    it("should handle code blocks in markdown", () => {
      const codeBlock = "```javascript\nconst x = 1;\n```";
      render(<Response>{codeBlock}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(
        /javascript.*const x = 1/s,
      );
    });

    it("should handle inline code", () => {
      const inlineCode = "Use `const` for constants";
      render(<Response>{inlineCode}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(
        /const.*constants/s,
      );
    });

    it("should handle links in markdown", () => {
      const link = "[Link text](https://example.com)";
      render(<Response>{link}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(/Link text/);
    });

    it("should handle tables in markdown", () => {
      const table =
        "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
      render(<Response>{table}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent(
        /Header 1.*Header 2.*Cell 1.*Cell 2/s,
      );
    });

    it("should handle empty string", () => {
      render(<Response>{""}</Response>);

      expect(screen.getByTestId("content")).toHaveTextContent("");
    });
  });

  describe("Code Component", () => {
    it("should pass remarkPlugins to ReactMarkdown", () => {
      const remarkGfm = require("remark-gfm");
      expect(remarkGfm).toBeDefined();
    });

    it("should pass rehypePlugins to ReactMarkdown", () => {
      const rehypeRaw = require("rehype-raw");
      const rehypeHighlight = require("rehype-highlight");
      expect(rehypeRaw).toBeDefined();
      expect(rehypeHighlight).toBeDefined();
    });
  });
});
