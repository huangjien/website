import { render, screen } from "@testing-library/react";
import React from "react";
import NoSSR from "../NoSSR";

describe("NoSSR Component", () => {
  let setStateSpy;

  beforeEach(() => {
    // Spy on React.Component.prototype.setState so we can observe what NoSSR
    // sets when componentDidMount fires.
    setStateSpy = jest.spyOn(React.Component.prototype, "setState");
  });

  afterEach(() => {
    setStateSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("renders children after componentDidMount sets canRender to true", () => {
      render(
        <NoSSR>
          <div data-testid='client-content'>Client Content</div>
        </NoSSR>,
      );

      // After mount, children should be in the DOM.
      expect(screen.getByTestId("client-content")).toBeInTheDocument();
      expect(screen.getByText("Client Content")).toBeVisible();
    });

    it("returns null while canRender is false", () => {
      // Drive the class directly to inspect the first render output without
      // letting componentDidMount flip canRender to true.
      const instance = new NoSSR({ children: <span>should not render</span> });
      expect(instance.state).toEqual({ canRender: false });
      expect(instance.render()).toBeNull();
    });

    it("returns children once canRender is true", () => {
      const children = <span data-testid='child'>hello</span>;
      const instance = new NoSSR({ children });
      // Mutate state directly to mirror what componentDidMount commits.
      instance.state = { canRender: true };
      expect(instance.render()).toEqual(children);
    });
  });

  describe("componentDidMount", () => {
    it("sets canRender to true on mount", () => {
      const ref = React.createRef();
      render(
        <NoSSR ref={ref}>
          <div data-testid='client-content'>Client Content</div>
        </NoSSR>,
      );

      expect(ref.current.state.canRender).toBe(true);
    });

    it("calls setState with canRender: true during mount", () => {
      const ref = React.createRef();
      render(
        <NoSSR ref={ref}>
          <span>content</span>
        </NoSSR>,
      );

      // At least one setState call should target canRender: true.
      const canRenderCall = setStateSpy.mock.calls.find(
        ([state]) =>
          state && typeof state === "object" && state.canRender === true,
      );
      expect(canRenderCall).toBeDefined();
    });
  });

  describe("Children handling", () => {
    it("renders a single child element after mount", () => {
      render(
        <NoSSR>
          <p data-testid='single'>hello</p>
        </NoSSR>,
      );
      expect(screen.getByTestId("single")).toBeInTheDocument();
      expect(screen.getByTestId("single")).toHaveTextContent("hello");
    });

    it("renders multiple children after mount", () => {
      render(
        <NoSSR>
          <div data-testid='child1'>Child 1</div>
          <div data-testid='child2'>Child 2</div>
        </NoSSR>,
      );
      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
    });

    it("renders string children after mount", () => {
      render(<NoSSR>Hello World</NoSSR>);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders numeric children after mount", () => {
      render(<NoSSR>{42}</NoSSR>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles null children without throwing", () => {
      expect(() => render(<NoSSR>{null}</NoSSR>)).not.toThrow();
    });

    it("handles undefined children without throwing", () => {
      expect(() => render(<NoSSR>{undefined}</NoSSR>)).not.toThrow();
    });

    it("handles boolean children without throwing", () => {
      expect(() => render(<NoSSR>{false}</NoSSR>)).not.toThrow();
    });
  });

  describe("Props", () => {
    it("ignores extra props on the class component", () => {
      // NoSSR doesn't accept any props beyond children. Extra props
      // should not throw and children should still render.
      expect(() =>
        render(
          <NoSSR className='extra'>
            <div data-testid='content'>content</div>
          </NoSSR>,
        ),
      ).not.toThrow();

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("State transitions", () => {
    it("initializes with canRender: false in the constructor", () => {
      const instance = new NoSSR({
        children: <div>never rendered</div>,
      });
      expect(instance.state).toEqual({ canRender: false });
    });

    it("transitions from canRender: false to canRender: true after mount", () => {
      const ref = React.createRef();
      const { container } = render(
        <NoSSR ref={ref}>
          <div data-testid='content'>content</div>
        </NoSSR>,
      );

      expect(ref.current.state.canRender).toBe(true);
      expect(container).not.toBeEmptyDOMElement();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
