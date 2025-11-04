import React from "react";
// Mock react-markdown and plugins to avoid ESM transform issues in Jest
jest.mock("react-markdown", () => {
  const React = require("react");
  return ({ children }) =>
    React.createElement("div", { "data-testid": "markdown" }, children);
});
jest.mock("remark-gfm", () => ({}));
jest.mock("rehype-raw", () => ({}));
jest.mock("rehype-highlight", () => ({}));
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Response from "../../ai-elements/response.jsx";

describe("Response", () => {
  it("renders markdown content", () => {
    const md = `**Bold**\n\n\`code\``;
    const { container } = render(<Response>{md}</Response>);
    // Content includes expected text fragments
    expect(container).toHaveTextContent(/Bold/);
    expect(container).toHaveTextContent(/code/);
  });
});
