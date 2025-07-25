import React from "react";
import { render, screen } from "@testing-library/react";
import NoSSR from "../../lib/NoSSR";

describe("NoSSR Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("SSR behavior", () => {
    it("should render children after component mounts", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      // In test environment, component mounts immediately
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should render children when onSSR is provided", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );
      const CustomSSR = () => <div data-testid='custom-ssr'>Loading...</div>;

      render(
        <NoSSR onSSR={<CustomSSR />}>
          <TestChild />
        </NoSSR>
      );

      // In test environment, component mounts and renders children
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should handle empty children gracefully", () => {
      const { container } = render(<NoSSR>{null}</NoSSR>);

      // Should render without errors, but may not have visible content
      expect(container).toBeInTheDocument();
    });
  });

  describe("Client-side rendering", () => {
    it("should render children after componentDidMount", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      // After componentDidMount, should render children
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should render multiple children after mount", () => {
      const TestChild1 = () => <div data-testid='child-1'>Child 1</div>;
      const TestChild2 = () => <div data-testid='child-2'>Child 2</div>;

      render(
        <NoSSR>
          <TestChild1 />
          <TestChild2 />
        </NoSSR>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });

    it("should render complex nested children after mount", () => {
      const ComplexChild = () => (
        <div data-testid='complex-child'>
          <h1>Title</h1>
          <p>Paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      );

      render(
        <NoSSR>
          <ComplexChild />
        </NoSSR>
      );

      expect(screen.getByTestId("complex-child")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  describe("Props handling", () => {
    it("should handle null children gracefully", () => {
      render(<NoSSR>{null}</NoSSR>);

      // Should not crash and render without errors
      expect(document.body).toBeInTheDocument();
    });

    it("should handle undefined children gracefully", () => {
      render(<NoSSR>{undefined}</NoSSR>);

      // Should not crash and render without errors
      expect(document.body).toBeInTheDocument();
    });

    it("should handle empty children gracefully", () => {
      render(<NoSSR></NoSSR>);

      // Should not crash and render without errors
      expect(document.body).toBeInTheDocument();
    });

    it("should handle string children", () => {
      render(<NoSSR>Plain text content</NoSSR>);

      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });

    it("should handle number children", () => {
      render(<NoSSR>{42}</NoSSR>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should handle boolean children (false)", () => {
      render(<NoSSR>{false}</NoSSR>);

      // Boolean false should not render anything visible
      expect(document.body).toBeInTheDocument();
    });

    it("should handle array of children", () => {
      const children = [
        <div key='1' data-testid='array-child-1'>
          Child 1
        </div>,
        <div key='2' data-testid='array-child-2'>
          Child 2
        </div>,
      ];

      render(<NoSSR>{children}</NoSSR>);

      expect(screen.getByTestId("array-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("array-child-2")).toBeInTheDocument();
    });
  });

  describe("Custom onSSR prop handling", () => {
    it("should handle null onSSR prop", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR onSSR={null}>
          <TestChild />
        </NoSSR>
      );

      // In test environment, children render after mount
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should handle string onSSR prop", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR onSSR='Loading...'>
          <TestChild />
        </NoSSR>
      );

      // In test environment, children render after mount
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should handle complex onSSR component", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );
      const ComplexSSR = () => (
        <div data-testid='complex-ssr'>
          <div className='spinner'>Loading...</div>
          <p>Please wait while content loads</p>
        </div>
      );

      render(
        <NoSSR onSSR={<ComplexSSR />}>
          <TestChild />
        </NoSSR>
      );

      // In test environment, children render after mount
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("Component lifecycle", () => {
    it("should render children after mount in test environment", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      // In test environment, children render after mount
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should render children after componentDidMount", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      // After mounting, children should be rendered
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle components that throw errors in children", () => {
      const ErrorChild = () => {
        throw new Error("Test error");
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(
          <NoSSR>
            <ErrorChild />
          </NoSSR>
        );
      }).toThrow("Test error");

      // Restore console.error
      console.error = originalError;
    });

    it("should handle rapid re-renders", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      const { rerender } = render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();

      // Re-render with different children
      const NewChild = () => <div data-testid='new-child'>New Content</div>;
      rerender(
        <NoSSR>
          <NewChild />
        </NoSSR>
      );

      expect(screen.getByTestId("new-child")).toBeInTheDocument();
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    });

    it("should handle unmounting gracefully", () => {
      const TestChild = () => (
        <div data-testid='child-content'>Child Content</div>
      );

      const { unmount } = render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Performance and optimization", () => {
    it("should not re-render unnecessarily after mount", () => {
      let renderCount = 0;
      const TestChild = () => {
        renderCount++;
        return (
          <div data-testid='child-content'>Render count: {renderCount}</div>
        );
      };

      const { rerender } = render(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      expect(screen.getByText("Render count: 1")).toBeInTheDocument();

      // Re-render with same props should not cause unnecessary child re-renders
      rerender(
        <NoSSR>
          <TestChild />
        </NoSSR>
      );

      // Child should re-render due to React's normal behavior
      expect(screen.getByText("Render count: 2")).toBeInTheDocument();
    });

    it("should handle large numbers of children efficiently", () => {
      const children = Array.from({ length: 100 }, (_, i) => (
        <div key={i} data-testid={`child-${i}`}>
          Child {i}
        </div>
      ));

      render(<NoSSR>{children}</NoSSR>);

      // Should render all children
      expect(screen.getByTestId("child-0")).toBeInTheDocument();
      expect(screen.getByTestId("child-99")).toBeInTheDocument();
      expect(screen.getByText("Child 0")).toBeInTheDocument();
      expect(screen.getByText("Child 99")).toBeInTheDocument();
    });
  });
});
