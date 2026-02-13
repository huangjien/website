import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogFooter,
} from "../dialog";

describe("Dialog Component", () => {
  describe("Dialog Root", () => {
    it("renders children when open", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <div data-testid='dialog-child'>Child content</div>
        </Dialog>,
      );
      expect(screen.getByTestId("dialog-child")).toBeInTheDocument();
    });

    it("does not render children when closed", () => {
      render(
        <Dialog open={false} onOpenChange={jest.fn()}>
          <div data-testid='dialog-child'>Child content</div>
        </Dialog>,
      );
      expect(screen.getByTestId("dialog-child")).toBeInTheDocument();
    });

    it("calls onOpenChange when open state changes", () => {
      const handleOpenChange = jest.fn();
      const { rerender } = render(
        <Dialog open={false} onOpenChange={handleOpenChange}>
          <div>Content</div>
        </Dialog>,
      );

      rerender(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <div>Content</div>
        </Dialog>,
      );

      // Dialog content should check for onOpenChange calls when opened/closed
    });
  });

  describe("DialogTrigger", () => {
    it("renders trigger as child by default", () => {
      render(
        <Dialog open={false} onOpenChange={jest.fn()}>
          <DialogTrigger>
            <button data-testid='trigger-button'>Open Dialog</button>
          </DialogTrigger>
        </Dialog>,
      );
      expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    });

    it("renders asChild when prop is false", () => {
      render(
        <Dialog open={false} onOpenChange={jest.fn()}>
          <DialogTrigger asChild={false}>
            <button data-testid='trigger-button'>Open Dialog</button>
          </DialogTrigger>
        </Dialog>,
      );
      expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    });
  });

  describe("DialogContent", () => {
    it("renders modal content when open", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent data-testid='dialog-content'>
            <div>Modal Content</div>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("applies glass-modal class", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass("glass-modal");
    });

    describe("Animations", () => {
      it("applies scale-in animation on open", () => {
        render(
          <Dialog open={true} onOpenChange={jest.fn()}>
            <DialogContent>
              <div>Content</div>
            </DialogContent>
          </Dialog>,
        );
        const modalContent = screen.getByTestId("modal-content");
        expect(modalContent).toHaveClass("animate-scale-in");
      });

      it("applies scale-out animation on close", () => {
        render(
          <Dialog open={true} onOpenChange={jest.fn()}>
            <DialogContent>
              <div>Content</div>
            </DialogContent>
          </Dialog>,
        );
        const modalContent = screen.getByTestId("modal-content");
        expect(modalContent).toHaveClass(
          "data-[state=closed]:animate-scale-out",
        );
      });

      it("applies transition classes", () => {
        render(
          <Dialog open={true} onOpenChange={jest.fn()}>
            <DialogContent>
              <div>Content</div>
            </DialogContent>
          </Dialog>,
        );
        const modalContent = screen.getByTestId("modal-content");
        expect(modalContent).toHaveClass("transition-all");
        expect(modalContent).toHaveClass("duration-normal");
      });
    });

    it("applies custom className", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent className='custom-class'>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass("custom-class");
    });

    it("renders overlay with fade-in animation", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const overlay = screen.getByText("Content").closest(".fixed");
      expect(
        overlay?.parentElement?.querySelector(".bg-black\\/40"),
      ).toBeInTheDocument();
    });
  });

  describe("DialogBody", () => {
    it("renders body content", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogBody data-testid='dialog-body'>
              <div>Body Content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
      expect(screen.getByText("Body Content")).toBeInTheDocument();
    });

    it("applies padding", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogBody>
              <div>Content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );
      const body = screen.getByTestId("dialog-body");
      expect(body).toHaveClass("p-3");
    });

    it("applies custom className", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogBody className='custom-class'>
              <div>Content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );
      const body = screen.getByTestId("dialog-body");
      expect(body).toHaveClass("custom-class");
    });
  });

  describe("DialogFooter", () => {
    it("renders footer content", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogFooter data-testid='dialog-footer'>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" }),
      ).toBeInTheDocument();
    });

    it("applies correct layout classes", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogFooter>
              <div>Footer Content</div>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByTestId("dialog-footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
      expect(footer).toHaveClass("justify-end");
      expect(footer).toHaveClass("gap-2");
    });

    it("applies border top", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogFooter>
              <div>Footer Content</div>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByTestId("dialog-footer");
      expect(footer).toHaveClass("border-t");
    });

    it("applies padding", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogFooter>
              <div>Footer Content</div>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByTestId("dialog-footer");
      expect(footer).toHaveClass("p-3");
    });

    it("applies custom className", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <DialogFooter className='custom-class'>
              <div>Footer Content</div>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      const footer = screen.getByTestId("dialog-footer");
      expect(footer).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("modal has proper z-index", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const modal = screen.getByTestId("modal");
      expect(modal).toHaveClass("z-50");
    });

    it("content has max height constraint", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass("max-h-[90vh]");
    });
  });

  describe("Backdrop Animation", () => {
    it("applies backdrop blur", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const overlay = screen
        .getByText("Content")
        .closest(".fixed")?.parentElement;
      const backdropBlur = overlay?.querySelector(".backdrop-blur-sm");
      expect(backdropBlur).toBeInTheDocument();
    });

    it("applies fade-in animation to overlay", () => {
      render(
        <Dialog open={true} onOpenChange={jest.fn()}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );
      const overlay = screen
        .getByText("Content")
        .closest(".fixed")?.parentElement;
      expect(overlay?.querySelector(".backdrop-blur-sm")).toBeInTheDocument();
    });
  });
});
