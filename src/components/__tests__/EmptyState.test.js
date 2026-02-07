import React from "react";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import { BiInbox } from "react-icons/bi";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("EmptyState Component", () => {
  it("renders with default icon", () => {
    render(<EmptyState message='No items found' />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders with custom icon", () => {
    render(<EmptyState message='No data' icon={BiInbox} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("has proper structure and styling classes", () => {
    const { container } = render(<EmptyState message='Empty list' />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center"
    );
  });

  it("displays message with correct styling", () => {
    render(<EmptyState message='Test message' />);
    const message = screen.getByText("Test message");
    expect(message).toHaveClass("text-muted-foreground");
  });

  it("icon has aria-hidden attribute", () => {
    render(<EmptyState message='Test' />);
    const icon = document.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("renders without message without crashing", () => {
    const { container } = render(<EmptyState message='' />);
    const message = container.querySelector(".text-muted-foreground");
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent("");
  });

  it("renders with long message", () => {
    const longMessage =
      "This is a very long message that should wrap properly when displayed in the empty state component";
    render(<EmptyState message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("icon container has glass-card styling", () => {
    const { container } = render(<EmptyState message='Test' />);
    const cardContainer = container.querySelector(".glass-card");
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer).toHaveClass("rounded-2xl", "p-8");
  });
});
