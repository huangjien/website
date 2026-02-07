import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../input";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders input without label", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders input with label", () => {
      render(<Input label='Username' />);
      const label = screen.getByTestId("input-label");
      const input = screen.getByTestId("input");

      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("Username");
      expect(input).toHaveAttribute("aria-label", "Username");
    });

    it("renders input with custom type", () => {
      render(<Input type='email' />);
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "email");
    });

    it("renders input with placeholder", () => {
      render(<Input placeholder='Enter text' />);
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("placeholder", "Enter text");
    });

    it("renders input with start content", () => {
      render(<Input startContent={<span data-testid='icon'>🔍</span>} />);
      const icon = screen.getByTestId("icon");
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Animations", () => {
    it("applies focus scale animation", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("focus-visible:scale-[1.01]");
    });

    it("applies focus ring animation", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("focus-visible:ring-2");
      expect(input).toHaveClass("focus-visible:ring-primary/50");
      expect(input).toHaveClass("focus-visible:shadow-glow");
    });

    it("applies hover background animation", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("hover:bg-[hsla(var(--glass-bg-hover))]");
      expect(input).toHaveClass("hover:shadow-glass");
    });

    it("applies transition classes", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("transition-all");
      expect(input).toHaveClass("duration-fast");
    });
  });

  describe("Value Handling", () => {
    it("renders with initial value", () => {
      render(<Input value='test value' />);
      const input = screen.getByTestId("input");
      expect(input).toHaveValue("test value");
    });

    it("calls onChange when value changes", async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);

      const input = screen.getByTestId("input");
      await user.type(input, "test");

      expect(handleChange).toHaveBeenCalled();
    });

    it("is controlled component", async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input value='' onChange={handleChange} />);

      const input = screen.getByTestId("input");
      await user.type(input, "a");

      expect(input).toHaveValue("");
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Clear Button", () => {
    it("does not show clear button when isClearable is false", () => {
      render(<Input value='test' />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it("does not show clear button when value is empty", () => {
      render(<Input isClearable value='' />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it("shows clear button when isClearable and has value", () => {
      render(<Input isClearable value='test' />);
      const clearButton = screen.queryByRole("button", { name: "Clear" });
      expect(clearButton).toBeInTheDocument();
    });

    it("calls onClear when clear button is clicked", async () => {
      const handleClear = jest.fn();
      const user = userEvent.setup();
      render(<Input isClearable value='test' onClear={handleClear} />);

      const clearButton = screen.getByRole("button", { name: "Clear" });
      await user.click(clearButton);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled State", () => {
    it("applies disabled styles", () => {
      render(<Input disabled />);
      const input = screen.getByTestId("input");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("disabled:cursor-not-allowed");
      expect(input).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Accessibility", () => {
    it("associates label with input", () => {
      render(<Input label='Email' />);
      const label = screen.getByTestId("input-label");
      const input = screen.getByTestId("input");

      expect(label).toHaveAttribute("for", input.id);
    });

    it("applies custom className", () => {
      render(<Input className='custom-class' />);
      const wrapper = screen.getByTestId("input-wrapper");
      expect(wrapper).toHaveClass("custom-class");
    });

    it("passes through other props", () => {
      render(<Input data-testid='custom-input' name='test' />);
      const input = screen.getByTestId("custom-input");
      expect(input).toHaveAttribute("name", "test");
    });
  });

  describe("Glassmorphism", () => {
    it("applies glass-input class", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("glass-input");
    });

    it("has ring styling", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("ring-1");
    });
  });

  describe("Start Content", () => {
    it("adds left padding when start content is present", () => {
      render(<Input startContent={<span>Icon</span>} />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("pl-10");
    });

    it("does not add left padding when no start content", () => {
      render(<Input />);
      const input = screen.getByTestId("input");
      expect(input).not.toHaveClass("pl-10");
    });
  });
});
