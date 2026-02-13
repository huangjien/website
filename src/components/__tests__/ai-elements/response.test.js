import React from "react";
jest.mock("react-markdown", () => {
  const React = require("react");
  return ({ children }) => {
    const content =
      typeof children === "string" ? children : String(children ?? "");
    return React.createElement(
      "div",
      {
        "data-testid": "markdown",
        className:
          "prose prose-neutral dark:prose-invert max-w-none overflow-wrap-break-word break-words",
      },
      content,
    );
  };
});
jest.mock("remark-gfm", () => ({}));
jest.mock("rehype-raw", () => ({}));
jest.mock("rehype-highlight", () => ({}));
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Response from "../../ai-elements/response.jsx";

describe("Response Component", () => {
  describe("Basic Rendering", () => {
    it("renders with string content", () => {
      render(<Response>Hello World</Response>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders with number content converted to string", () => {
      render(<Response>{123}</Response>);
      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("renders with null content gracefully", () => {
      const { container } = render(<Response>{null}</Response>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders with undefined content gracefully", () => {
      const { container } = render(<Response>{undefined}</Response>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders empty string", () => {
      const { container } = render(<Response>{""}</Response>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Markdown Rendering", () => {
    it("renders markdown content", () => {
      const md = `**Bold**\n\n\`code\``;
      const { container } = render(<Response>{md}</Response>);
      expect(container).toHaveTextContent(/Bold/);
      expect(container).toHaveTextContent(/code/);
    });

    it("renders headings correctly", () => {
      render(<Response># Heading</Response>);
      expect(screen.getByText(/Heading/)).toBeInTheDocument();
    });

    it("renders paragraphs correctly", () => {
      render(<Response>This is a paragraph.</Response>);
      expect(screen.getByText(/This is a paragraph/)).toBeInTheDocument();
    });
  });

  describe("Code Block Handling", () => {
    it("renders inline code", () => {
      render(<Response>`inline code`</Response>);
      expect(screen.getByText(/inline code/)).toBeInTheDocument();
    });

    it("renders code blocks", () => {
      render(
        <Response>
          {`
\`\`\`javascript
const x = 1;
\`\`\`
`}
        </Response>,
      );
      expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has prose styling classes", () => {
      const { container } = render(<Response>Test</Response>);
      const proseDiv = container.firstChild;
      expect(proseDiv).toHaveClass(
        "prose",
        "prose-neutral",
        "dark:prose-invert",
      );
    });

    it("has max-w-none class", () => {
      const { container } = render(<Response>Test</Response>);
      const proseDiv = container.firstChild;
      expect(proseDiv).toHaveClass("max-w-none");
    });

    it("has overflow and break word classes", () => {
      const { container } = render(<Response>Test</Response>);
      const proseDiv = container.firstChild;
      expect(proseDiv).toHaveClass("overflow-wrap-break-word", "break-words");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long words", () => {
      const longWord = "a".repeat(100);
      render(<Response>{longWord}</Response>);
      expect(screen.getByText(longWord)).toBeInTheDocument();
    });

    it("handles special characters", () => {
      render(<Response>@ # $ % ^ & * ( )</Response>);
      expect(screen.getByText(/[@#$%^&*()]/)).toBeInTheDocument();
    });

    it("handles multiline content", () => {
      render(
        <Response>
          Line 1{"\n"}
          Line 2
        </Response>,
      );
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    });
  });

  describe("Content Type Conversion", () => {
    it("converts number to string", () => {
      render(<Response>{42}</Response>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles boolean values", () => {
      render(<Response>{true}</Response>);
      expect(screen.getByText(/true/)).toBeInTheDocument();
    });

    it("handles zero value", () => {
      render(<Response>{0}</Response>);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
