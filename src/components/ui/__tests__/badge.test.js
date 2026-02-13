import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Badge from "../badge";

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("renders badge with default variant", () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText("Default");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("glass");
    });

    it("renders badge with outline variant", () => {
      render(<Badge variant='outline'>Outline</Badge>);
      const badge = screen.getByText("Outline");
      expect(badge).toHaveClass("border");
    });

    it("renders badge with success variant", () => {
      render(<Badge variant='success'>Success</Badge>);
      const badge = screen.getByText("Success");
      expect(badge).toHaveClass("bg-primary");
      expect(badge).toHaveClass("shadow-sm");
    });

    it("renders badge with warning variant", () => {
      render(<Badge variant='warning'>Warning</Badge>);
      const badge = screen.getByText("Warning");
      expect(badge).toHaveClass("bg-destructive");
      expect(badge).toHaveClass("shadow-sm");
    });
  });

  describe("Animations", () => {
    it("applies hover scale animation", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("hover:scale-110");
    });

    it("applies hover shadow animation", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("hover:shadow-glass");
    });

    it("applies active scale animation", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("active:scale-95");
    });

    it("applies transition classes", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("transition-all");
      expect(badge).toHaveClass("duration-fast");
    });
  });

  describe("Styling", () => {
    it("applies rounded-full class", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("rounded-full");
    });

    it("applies inline-flex", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("inline-flex");
    });

    it("has correct padding and font size", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("px-3");
      expect(badge).toHaveClass("py-1");
      expect(badge).toHaveClass("text-xs");
    });
  });

  describe("Cursor", () => {
    it("has cursor-pointer class", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("cursor-pointer");
    });
  });

  describe("Accessibility", () => {
    it("applies custom className", () => {
      render(<Badge className='custom-class'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("custom-class");
    });

    it("passes through other props", () => {
      render(
        <Badge data-testid='custom-badge' aria-label='Custom badge'>
          Test
        </Badge>,
      );
      const badge = screen.getByTestId("custom-badge");
      expect(badge).toHaveAttribute("aria-label", "Custom badge");
    });

    it("has focus ring for accessibility", () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("focus:ring-2");
      expect(badge).toHaveClass("focus:ring-primary/50");
    });
  });

  describe("Variant Specific Styles", () => {
    it("default variant has glass background", () => {
      render(<Badge variant='default'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("glass");
      expect(badge).toHaveClass("text-secondary-foreground");
    });

    it("outline variant has border", () => {
      render(<Badge variant='outline'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("glass");
      expect(badge).toHaveClass("border");
    });

    it("success variant has primary background", () => {
      render(<Badge variant='success'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("bg-primary");
      expect(badge).toHaveClass("text-primary-foreground");
    });

    it("warning variant has destructive background", () => {
      render(<Badge variant='warning'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("bg-destructive");
      expect(badge).toHaveClass("text-destructive-foreground");
    });

    it("outline variant has border", () => {
      render(<Badge variant='outline'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("glass");
      expect(badge).toHaveClass("border");
    });

    it("success variant has primary background", () => {
      render(<Badge variant='success'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("bg-primary");
      expect(badge).toHaveClass("text-primary-foreground");
    });

    it("warning variant has destructive background", () => {
      render(<Badge variant='warning'>Test</Badge>);
      const badge = screen.getByText("Test");
      expect(badge).toHaveClass("bg-destructive");
      expect(badge).toHaveClass("text-destructive-foreground");
    });
  });

  describe("Interactions", () => {
    it("handles click events", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Badge onClick={handleClick}>Clickable</Badge>);

      const badge = screen.getByText("Clickable");
      await user.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
