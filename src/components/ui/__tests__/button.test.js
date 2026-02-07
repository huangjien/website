import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders button with default variant", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("glass-button");
    });

    it("renders button with outline variant", () => {
      render(<Button variant='outline'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("glass");
    });

    it("renders button with ghost variant", () => {
      render(<Button variant='ghost'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:scale-105");
    });

    it("renders button with secondary variant", () => {
      render(<Button variant='secondary'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("glass");
    });

    it("renders button with destructive variant", () => {
      render(<Button variant='destructive'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gradient-to-r");
      expect(button).toHaveClass("from-red-500");
    });

    it("renders button with gradient variant", () => {
      render(<Button variant='gradient'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gradient-to-r");
      expect(button).toHaveClass("from-primary");
    });

    it("renders button with different sizes", () => {
      const { rerender } = render(<Button size='sm'>Small</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-9");

      rerender(<Button size='md'>Medium</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-11");

      rerender(<Button size='lg'>Large</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-13");

      rerender(<Button size='icon'>Icon</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-11");
      expect(screen.getByRole("button")).toHaveClass("w-11");
    });
  });

  describe("Animations", () => {
    it("applies hover scale animation", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:scale-105");
    });

    it("applies active scale animation", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("active:scale-95");
    });

    it("applies transition classes", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-all");
      expect(button).toHaveClass("duration-fast");
    });
  });

  describe("Interactions", () => {
    it("handles click events", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });

    it("does not call click handler when disabled", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("shows spinner when loading is true", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    });

    it("disables button when loading", () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("does not call click handler when loading", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders spinner before children", () => {
      render(
        <Button loading>
          <span>Button text</span>
        </Button>
      );
      const button = screen.getByRole("button");
      const spinner = screen.getByLabelText("Loading");
      expect(button).toContainElement(spinner);
      expect(screen.getByText("Button text")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("applies custom className", () => {
      render(<Button className='custom-class'>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("passes through other props", () => {
      render(
        <Button data-testid='custom-button' aria-label='Custom button'>
          Click me
        </Button>
      );
      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("aria-label", "Custom button");
    });

    it("has focus-visible ring for accessibility", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-4");
    });
  });

  describe("Focus Ring Animation", () => {
    it("applies focus ring animation classes", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-ring");
      expect(button).toHaveClass("focus-visible:ring-offset-2");
    });
  });
});
