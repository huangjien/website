import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs Components", () => {
  describe("Tabs", () => {
    it("renders children inside a tablist root", () => {
      render(
        <Tabs>
          <div data-testid='child'>child content</div>
        </Tabs>,
      );
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("applies w-full default class", () => {
      render(<Tabs data-testid='tabs' />);
      expect(screen.getByTestId("tabs")).toHaveClass("w-full");
    });

    it("merges custom className with default classes", () => {
      render(<Tabs className='custom-tabs' />);
      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveClass("w-full");
      expect(tabs).toHaveClass("custom-tabs");
    });

    it("passes additional props through to the root", () => {
      render(<Tabs data-testid='tabs' aria-label='settings tabs' dir='rtl' />);
      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("aria-label", "settings tabs");
      expect(tabs).toHaveAttribute("dir", "rtl");
    });

    it("uses defaultValue when provided", () => {
      render(
        <Tabs defaultValue='overview'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='details'>Details</TabsTrigger>
          </TabsList>
          <TabsContent value='overview'>overview content</TabsContent>
          <TabsContent value='details'>details content</TabsContent>
        </Tabs>,
      );

      // The first trigger should be active and its content should be mounted
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "data-state",
        "active",
      );
      expect(screen.getByText("overview content")).toBeVisible();
    });
  });

  describe("TabsList", () => {
    it("renders as a list container with default styling", () => {
      render(
        <Tabs>
          <TabsList data-testid='tabs-list'>
            <TabsTrigger value='a'>A</TabsTrigger>
          </TabsList>
        </Tabs>,
      );

      const list = screen.getByTestId("tabs-list");
      // Tablist has role="tablist" from Radix
      expect(list.tagName.toLowerCase()).toBe("div");
      expect(list).toHaveClass("inline-flex");
      expect(list).toHaveClass("h-10");
      expect(list).toHaveClass("items-center");
      expect(list).toHaveClass("justify-center");
      expect(list).toHaveClass("rounded-lg");
      expect(list).toHaveClass("bg-muted");
      expect(list).toHaveClass("p-1");
      expect(list).toHaveClass("text-muted-foreground");
      expect(list).toHaveClass("shadow-xs");
    });

    it("merges custom className with default classes", () => {
      render(
        <Tabs>
          <TabsList data-testid='tabs-list' className='custom-list' />
        </Tabs>,
      );
      const list = screen.getByTestId("tabs-list");
      expect(list).toHaveClass("custom-list");
      expect(list).toHaveClass("inline-flex");
    });

    it("passes additional props through", () => {
      render(
        <Tabs>
          <TabsList data-testid='tabs-list' aria-label='tab list' />
        </Tabs>,
      );
      expect(screen.getByTestId("tabs-list")).toHaveAttribute(
        "aria-label",
        "tab list",
      );
    });
  });

  describe("TabsTrigger", () => {
    it("renders a tab with default styling", () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger'>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveClass("inline-flex");
      expect(trigger).toHaveClass("items-center");
      expect(trigger).toHaveClass("justify-center");
      expect(trigger).toHaveClass("whitespace-nowrap");
      expect(trigger).toHaveClass("rounded-md");
      expect(trigger).toHaveClass("px-3");
      expect(trigger).toHaveClass("py-1.5");
      expect(trigger).toHaveClass("text-sm");
      expect(trigger).toHaveClass("font-medium");
      expect(trigger).toHaveClass("transition-all");
    });

    it("has inactive data-state when not selected", () => {
      render(
        <Tabs defaultValue='other'>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger'>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(screen.getByTestId("trigger")).toHaveAttribute(
        "data-state",
        "inactive",
      );
    });

    it("has active data-state when selected", () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger'>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("data-state", "active");
      expect(trigger).toHaveClass("data-[state=active]:bg-background");
    });

    it("switches active state when clicked", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger-1'>
              Tab 1
            </TabsTrigger>
            <TabsTrigger value='tab2' data-testid='trigger-2'>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>first</TabsContent>
          <TabsContent value='tab2'>second</TabsContent>
        </Tabs>,
      );

      const trigger1 = screen.getByTestId("trigger-1");
      const trigger2 = screen.getByTestId("trigger-2");

      expect(trigger1).toHaveAttribute("data-state", "active");
      expect(trigger2).toHaveAttribute("data-state", "inactive");

      await user.click(trigger2);

      expect(trigger1).toHaveAttribute("data-state", "inactive");
      expect(trigger2).toHaveAttribute("data-state", "active");
    });

    it("merges custom className with default classes", () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger
              value='tab1'
              data-testid='trigger'
              className='custom-trigger'
            >
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveClass("custom-trigger");
      expect(trigger).toHaveClass("inline-flex");
    });

    it("renders disabled state correctly", () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger' disabled>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveClass("disabled:pointer-events-none");
      expect(trigger).toHaveClass("disabled:opacity-50");
    });

    it("does not activate when disabled and clicked", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger-1'>
              Tab 1
            </TabsTrigger>
            <TabsTrigger value='tab2' data-testid='trigger-2' disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );

      await user.click(screen.getByTestId("trigger-2"));

      expect(screen.getByTestId("trigger-1")).toHaveAttribute(
        "data-state",
        "active",
      );
      expect(screen.getByTestId("trigger-2")).toHaveAttribute(
        "data-state",
        "inactive",
      );
    });
  });

  describe("TabsContent", () => {
    it("renders content with default styling", () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsContent value='tab1' data-testid='content'>
            <p>Hello</p>
          </TabsContent>
        </Tabs>,
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("ring-offset-background");
      expect(content).toHaveClass("focus-visible:outline-none");
      expect(content).toHaveClass("focus-visible:ring-2");
      expect(content).toHaveClass("focus-visible:ring-ring");
      expect(content).toHaveClass("focus-visible:ring-offset-2");
    });

    it("is visible when its trigger is active", () => {
      render(
        <Tabs defaultValue='tab2'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1' data-testid='content-1'>
            content 1
          </TabsContent>
          <TabsContent value='tab2' data-testid='content-2'>
            content 2
          </TabsContent>
        </Tabs>,
      );

      // Only content-2 should be visible by default (Radix hides the others)
      expect(screen.getByText("content 2")).toBeVisible();
    });

    it("shows content matching the active trigger", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1' data-testid='trigger-1'>
              Tab 1
            </TabsTrigger>
            <TabsTrigger value='tab2' data-testid='trigger-2'>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>
            <p>first panel</p>
          </TabsContent>
          <TabsContent value='tab2'>
            <p>second panel</p>
          </TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("first panel")).toBeVisible();

      await user.click(screen.getByTestId("trigger-2"));

      expect(screen.getByText("second panel")).toBeVisible();
    });

    it("merges custom className with default classes", () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsContent
            value='tab1'
            data-testid='content'
            className='custom-content'
          >
            body
          </TabsContent>
        </Tabs>,
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("custom-content");
      expect(content).toHaveClass("ring-offset-background");
    });
  });

  describe("End-to-end flow", () => {
    it("supports a controlled value with onValueChange", async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Tabs value='a' onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value='a' data-testid='trigger-a'>
              A
            </TabsTrigger>
            <TabsTrigger value='b' data-testid='trigger-b'>
              B
            </TabsTrigger>
          </TabsList>
          <TabsContent value='a'>A body</TabsContent>
          <TabsContent value='b'>B body</TabsContent>
        </Tabs>,
      );

      expect(screen.getByTestId("trigger-a")).toHaveAttribute(
        "data-state",
        "active",
      );

      await user.click(screen.getByTestId("trigger-b"));

      expect(handleValueChange).toHaveBeenCalledWith("b");
      // Value is still 'a' because we did not update the parent's state
      expect(screen.getByTestId("trigger-a")).toHaveAttribute(
        "data-state",
        "active",
      );
    });
  });
});
