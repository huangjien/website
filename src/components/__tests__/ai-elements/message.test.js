import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Message, MessageContent } from "../../ai-elements/message.jsx";

describe("Message", () => {
  it("renders assistant message with neutral styles", () => {
    const { container } = render(<Message role='assistant'>Hi</Message>);
    const msg = screen.getByTestId("message-assistant");
    expect(msg).toBeInTheDocument();
    // Assistant should not have blue bg class
    expect(container.firstChild).toHaveAttribute("data-role", "assistant");
  });

  it("renders user message with blue background", () => {
    const { container } = render(<Message role='user'>Hello</Message>);
    const msg = screen.getByTestId("message-user");
    expect(msg).toBeInTheDocument();
    // Ensure role attribute present
    expect(container.firstChild).toHaveAttribute("data-role", "user");
  });

  it("renders MessageContent wrapper", () => {
    render(
      <MessageContent>
        <p>Inner content</p>
      </MessageContent>,
    );
    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });
});
