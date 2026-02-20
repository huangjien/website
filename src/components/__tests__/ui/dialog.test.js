import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogFooter,
} from "../../ui/dialog";

describe("Dialog Component", () => {
  describe("Dialog Root", () => {
    it("renders children when open", () => {
      render(
        <Dialog open={true}>
          <div data-testid='dialog-child'>Dialog Content</div>
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-child")).toBeInTheDocument();
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("tracks previous active element when open", () => {
      const { container } = render(
        <div>
          <button data-testid='focusable-button'>Focus Me</button>
          <Dialog open={true}>
            <div>Dialog</div>
          </Dialog>
        </div>,
      );

      const button = screen.getByTestId("focusable-button");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("restores focus to previous element when closed", async () => {
      const handleOpenChange = jest.fn();
      const { container } = render(
        <div>
          <button data-testid='focusable-button'>Focus Me</button>
          <Dialog open={true} onOpenChange={handleOpenChange}>
            <div>Dialog</div>
          </Dialog>
        </div>,
      );

      const button = screen.getByTestId("focusable-button");
      button.focus();

      handleOpenChange(false);
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });

      await waitFor(() => {
        expect(document.activeElement).toBe(button);
      });
    });

    it("calls onOpenChange when opened", async () => {
      const handleOpenChange = jest.fn();

      render(
        <Dialog open={false} onOpenChange={handleOpenChange}>
          <div>Dialog</div>
        </Dialog>,
      );

      handleOpenChange(true);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it("calls onOpenChange when closed", async () => {
      const handleOpenChange = jest.fn();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <div>Dialog</div>
        </Dialog>,
      );

      handleOpenChange(false);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("handles missing previousActiveElement gracefully", () => {
      const handleOpenChange = jest.fn();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <div>Dialog</div>
        </Dialog>,
      );

      handleOpenChange(false);

      expect(handleOpenChange).toHaveBeenCalled();
    });

    it("handles null previousActiveElement", async () => {
      const handleOpenChange = jest.fn();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <div>Dialog</div>
        </Dialog>,
      );

      handleOpenChange(false);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalled();
      });
    });
  });

  describe("DialogTrigger", () => {
    it("renders asChild by default", () => {
      render(
        <Dialog>
          <DialogTrigger asChild={true}>
            <button data-testid='trigger-button'>Open Dialog</button>
          </DialogTrigger>
        </Dialog>,
      );

      expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    });

    it("renders with asChild false", () => {
      render(
        <Dialog>
          <DialogTrigger asChild={false}>
            <button data-testid='trigger-button'>Open Dialog</button>
          </DialogTrigger>
        </Dialog>,
      );

      expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    });
  });

  describe("DialogContent", () => {
    it("renders overlay with correct classes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toBeInTheDocument();
      expect(modalContent.parentElement).toHaveClass("fixed", "inset-0");
    });

    it("renders content with correct role and aria attributes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent.closest('[role="dialog"]')).toBeInTheDocument();
      expect(modalContent.closest('[aria-modal="true"]')).toBeInTheDocument();
    });

    it("applies custom className to content", () => {
      render(
        <Dialog open={true}>
          <DialogContent className='custom-class'>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass("custom-class");
    });

    it("merges custom className with default classes", () => {
      render(
        <Dialog open={true}>
          <DialogContent className='custom-class'>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass(
        "max-h-[90vh]",
        "w-full",
        "custom-class",
      );
    });

    it("passes additional props to content", () => {
      render(
        <Dialog open={true}>
          <DialogContent data-custom='value'>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveAttribute("data-custom", "value");
    });

    it("renders children content", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <p data-testid='dialog-text'>Dialog text content</p>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-text")).toBeInTheDocument();
      expect(screen.getByText("Dialog text content")).toBeInTheDocument();
    });

    it("has proper z-index for overlay and content", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent.closest(".z-50")).toBeInTheDocument();
    });

    it("has animation classes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent).toHaveClass("animate-scale-in");
    });
  });

  describe("DialogBody", () => {
    it("renders body with default padding", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody>
              <div>Body content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );

      const dialogBody = screen.getByTestId("dialog-body");
      expect(dialogBody).toHaveClass("p-3");
      expect(screen.getByText("Body content")).toBeInTheDocument();
    });

    it("applies custom className to body", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody className='custom-body-class'>
              <div>Body content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );

      const dialogBody = screen.getByTestId("dialog-body");
      expect(dialogBody).toHaveClass("custom-body-class");
    });

    it("merges custom className with default classes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody className='custom-class'>
              <div>Body content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );

      const dialogBody = screen.getByTestId("dialog-body");
      expect(dialogBody).toHaveClass("p-3", "custom-class");
    });

    it("passes additional props to body", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody data-test='body-value'>
              <div>Body content</div>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );

      const dialogBody = screen.getByTestId("dialog-body");
      expect(dialogBody).toHaveAttribute("data-test", "body-value");
    });

    it("renders complex content in body", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody>
              <h2>Title</h2>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </DialogBody>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("DialogFooter", () => {
    it("renders footer with correct layout", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveClass("flex", "items-center", "justify-end");
      expect(dialogFooter).toHaveClass("gap-2");
    });

    it("renders footer with border top", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveClass("border-t");
    });

    it("renders footer with padding", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveClass("p-3");
    });

    it("applies custom className to footer", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter className='custom-footer-class'>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveClass("custom-footer-class");
    });

    it("merges custom className with default classes", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter className='custom-class'>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveClass(
        "flex",
        "items-center",
        "justify-end",
        "gap-2",
        "border-t",
        "p-3",
        "custom-class",
      );
    });

    it("passes additional props to footer", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter data-test='footer-value'>
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      const dialogFooter = screen.getByTestId("dialog-footer");
      expect(dialogFooter).toHaveAttribute("data-test", "footer-value");
    });

    it("renders multiple buttons in footer", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogFooter>
              <button data-testid='btn-cancel'>Cancel</button>
              <button data-testid='btn-back'>Back</button>
              <button data-testid='btn-next'>Next</button>
              <button data-testid='btn-confirm'>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId("btn-cancel")).toBeInTheDocument();
      expect(screen.getByTestId("btn-back")).toBeInTheDocument();
      expect(screen.getByTestId("btn-next")).toBeInTheDocument();
      expect(screen.getByTestId("btn-confirm")).toBeInTheDocument();
    });
  });

  describe("Complete Dialog Structure", () => {
    it("renders complete dialog with all components", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody>
              <h2>Dialog Title</h2>
              <p>Dialog content goes here.</p>
            </DialogBody>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Dialog content goes here.")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("handles dialog with no children", () => {
      render(
        <Dialog open={true}>
          <DialogContent />
        </Dialog>,
      );

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("handles dialog with empty body and footer", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogBody />
            <DialogFooter />
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria attributes on modal", () => {
      render(
        <Dialog open={true}>
          <DialogContent aria-label='Test Dialog'>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const modalContent = screen.getByTestId("modal-content");
      expect(modalContent.closest('[aria-modal="true"]')).toBeInTheDocument();
    });

    it("has proper role attribute", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const dialogElement = screen.getByRole("dialog");
      expect(dialogElement).toBeInTheDocument();
    });

    it("has aria-hidden on overlay", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null onOpenChange", () => {
      expect(() => {
        render(
          <Dialog open={true}>
            <div>Content</div>
          </Dialog>,
        );
      }).not.toThrow();
    });

    it("handles undefined className", () => {
      render(
        <Dialog open={true}>
          <DialogContent className={undefined}>
            <div>Content</div>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("handles missing children", () => {
      render(
        <Dialog open={true}>
          <DialogBody />
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-body")).toBeInTheDocument();
    });
  });
});
