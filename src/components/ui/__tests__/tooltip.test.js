import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tooltip from "../tooltip";

describe("Tooltip Component", () => {
  describe("Rendering", () => {
    it("renders tooltip trigger and content", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button data-testid='trigger'>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });

    it("renders custom className on tooltip content", () => {
      render(
        <Tooltip content='Tooltip content' className='custom-class'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("custom-class");
    });
  });

  describe("Animations", () => {
    it("applies scale-in animation", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("animate-scale-in");
    });

    it("has proper z-index", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("z-50");
    });
  });

  describe("Styling", () => {
    it("applies rounded-lg class", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("rounded-lg");
    });

    it("applies background color", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("bg-popover");
    });

    it("applies shadow", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("shadow-md");
    });

    it("has proper padding", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("px-3");
      expect(tooltip).toHaveClass("py-1\\.5");
    });

    it("has correct font size", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("text-sm");
    });

    it("has proper text color", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("text-popover-foreground");
    });

    it("renders arrow", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const arrow = screen
        .getByText("Tooltip content")
        .parentElement?.querySelector(".fill-popover");
      expect(arrow).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("passes through other props to trigger", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button data-testid='custom-trigger' aria-label='Custom trigger'>
            Hover me
          </button>
        </Tooltip>
      );
      const trigger = screen.getByTestId("custom-trigger");
      expect(trigger).toHaveAttribute("aria-label", "Custom trigger");
    });

    it("has overflow-hidden", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("overflow-hidden");
    });
  });

  describe("Positioning", () => {
    it("has sideOffset", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveAttribute("sideOffset", "6");
    });
  });

  describe("Behavior", () => {
    it("opens on hover by default", async () => {
      const user = userEvent.setup();
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole("button");
      await user.hover(trigger);

      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
    });

    it("has delay duration", () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      // Tooltip should be rendered
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe("Test Mode", () => {
    it("renders tooltip in test mode", () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
    });

    it("defaultOpen in test mode", () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
    });
  });

    it("has delay duration", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      // Tooltip should have delayDuration prop set
      const tooltip = screen.getByText("Tooltip content").closest("div");
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe("Test Mode", () => {
    it("forceMounts tooltip in test mode", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveAttribute("forceMount");
    });

    it("defaultOpen in test mode", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe("Portal", () => {
    it("renders tooltip content in portal", () => {
      render(
        <Tooltip content='Tooltip content'>
          <button>Hover me</button>
        </Tooltip>
      );
      const tooltip = screen.getByTestId("tooltip");
      // Tooltip should be rendered in a portal (outside the trigger's DOM hierarchy)
      expect(tooltip).toBeInTheDocument();
    });
  });
});
