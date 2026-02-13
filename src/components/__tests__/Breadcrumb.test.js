import React from "react";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "../Breadcrumb";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "header.home": "Home",
        "header.ai": "AI",
        "header.settings": "Settings",
        "header.about": "About",
        "breadcrumb.breadcrumb": "Breadcrumb",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Breadcrumb Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders on home page", () => {
      usePathname.mockReturnValue("/");
      render(<Breadcrumb />);
      expect(
        screen.getByRole("navigation", { name: /breadcrumb/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders on AI page", () => {
      usePathname.mockReturnValue("/ai");
      render(<Breadcrumb />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("renders on Settings page", () => {
      usePathname.mockReturnValue("/settings");
      render(<Breadcrumb />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders on About page", () => {
      usePathname.mockReturnValue("/about");
      render(<Breadcrumb />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("renders on nested paths", () => {
      usePathname.mockReturnValue("/settings/profile");
      render(<Breadcrumb />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("profile")).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("has correct href attributes", () => {
      usePathname.mockReturnValue("/ai/settings");
      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      const aiLink = screen.getByText("AI").closest("a");
      const settingsLink = screen.getByText("Settings").closest("a");

      expect(homeLink).toHaveAttribute("href", "/");
      expect(aiLink).toHaveAttribute("href", "/ai");
      expect(settingsLink).toHaveAttribute("href", "/ai/settings");
    });

    it("highlights current page", () => {
      usePathname.mockReturnValue("/settings");
      const { container } = render(<Breadcrumb />);

      const currentLink = screen.getByText("Settings").closest("a");
      expect(currentLink).toHaveClass("text-foreground", "font-medium");
    });

    it("applies hover styles to non-current links", () => {
      usePathname.mockReturnValue("/ai");
      const { container } = render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass(
        "hover:text-foreground",
        "transition-colors",
      );
    });
  });

  describe("Accessibility", () => {
    it("has nav element with proper aria-label", () => {
      usePathname.mockReturnValue("/ai");
      render(<Breadcrumb />);

      const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    });

    it("adds aria-current to last breadcrumb item", () => {
      usePathname.mockReturnValue("/about");
      render(<Breadcrumb />);

      const currentLink = screen.getByText("About").closest("a");
      expect(currentLink).toHaveAttribute("aria-current", "page");
    });

    it("does not add aria-current to non-current items", () => {
      usePathname.mockReturnValue("/settings");
      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).not.toHaveAttribute("aria-current");
    });

    it("hides separator icons from screen readers", () => {
      usePathname.mockReturnValue("/ai");
      const { container } = render(<Breadcrumb />);

      const separators = container.querySelectorAll("svg");
      separators.forEach((separator) => {
        expect(separator).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("Separators", () => {
    it("renders chevron separators between items", () => {
      usePathname.mockReturnValue("/ai/settings");
      const { container } = render(<Breadcrumb />);

      const separators = container.querySelectorAll("svg");
      expect(separators.length).toBe(2);
    });

    it("does not render separator before first item", () => {
      usePathname.mockReturnValue("/ai");
      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      const previousSibling = homeLink.previousSibling;
      expect(previousSibling).not.toBeInTheDocument();
    });

    it("has correct separator styling", () => {
      usePathname.mockReturnValue("/ai");
      const { container } = render(<Breadcrumb />);

      const separator = container.querySelector("svg");
      expect(separator).toHaveClass("text-muted-foreground/60");
    });
  });

  describe("Translation", () => {
    it("translates known routes", () => {
      usePathname.mockReturnValue("/ai");
      render(<Breadcrumb />);

      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("uses original segment for unknown routes", () => {
      usePathname.mockReturnValue("/unknown-page");
      render(<Breadcrumb />);

      expect(screen.getByText("unknown-page")).toBeInTheDocument();
    });

    it("handles multiple segments with mixed translations", () => {
      usePathname.mockReturnValue("/ai/custom-page");
      render(<Breadcrumb />);

      expect(screen.getByText("AI")).toBeInTheDocument();
      expect(screen.getByText("custom-page")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty pathname", () => {
      usePathname.mockReturnValue("");
      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("handles root pathname with trailing slash", () => {
      usePathname.mockReturnValue("//");
      render(<Breadcrumb />);

      const homeLinks = screen.getAllByText("Home");
      expect(homeLinks.length).toBeGreaterThan(0);
    });

    it("handles deeply nested paths", () => {
      usePathname.mockReturnValue("/a/b/c/d/e");
      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.getByText("b")).toBeInTheDocument();
      expect(screen.getByText("c")).toBeInTheDocument();
      expect(screen.getByText("d")).toBeInTheDocument();
      expect(screen.getByText("e")).toBeInTheDocument();
    });

    it("handles single character segments", () => {
      usePathname.mockReturnValue("/x");
      render(<Breadcrumb />);

      expect(screen.getByText("x")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has correct container classes", () => {
      usePathname.mockReturnValue("/ai");
      const { container } = render(<Breadcrumb />);

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "text-sm",
        "text-muted-foreground",
        "mb-4",
      );
    });

    it("applies correct link styling for current page", () => {
      usePathname.mockReturnValue("/about");
      render(<Breadcrumb />);

      const currentLink = screen.getByText("About").closest("a");
      expect(currentLink).toHaveClass("text-foreground", "font-medium");
    });

    it("applies correct link styling for intermediate pages", () => {
      usePathname.mockReturnValue("/settings");
      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass(
        "hover:text-foreground",
        "transition-colors",
      );
      expect(homeLink).not.toHaveClass("text-foreground");
    });
  });

  describe("Integration", () => {
    it("renders all breadcrumb items in correct order", () => {
      usePathname.mockReturnValue("/about/team");
      render(<Breadcrumb />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveTextContent("Home");
      expect(links[1]).toHaveTextContent("About");
      expect(links[2]).toHaveTextContent("team");
    });

    it("preserves URL encoding in segments", () => {
      usePathname.mockReturnValue("/settings/test%20page");
      render(<Breadcrumb />);

      expect(screen.getByText("test%20page")).toBeInTheDocument();
    });
  });
});
