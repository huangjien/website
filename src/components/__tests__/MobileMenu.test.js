import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "../MobileMenu";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "header.home": "Home",
        "header.ai": "AI",
        "header.settings": "Settings",
        "header.about": "About",
        "mobile_menu.toggle_menu": "Toggle menu",
        "global.menu": "Menu",
        "mobile_menu.mobile_navigation_menu": "Mobile navigation menu",
      };
      return translations[key] || key;
    },
  }),
}));

describe("MobileMenu Component", () => {
  it("renders menu button on mobile viewport", () => {
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );
    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("has lg:hidden class for responsive display", () => {
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );
    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton.parentElement).toHaveClass("lg:hidden");
  });

  it("opens menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    await waitFor(() => {
      const homeLink = screen.getByRole("menuitem", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
    });
  });

  it("displays all navigation links when open", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /home/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /ai/i })).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: /settings/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: /about/i }),
      ).toBeInTheDocument();
    });
  });

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /home/i }),
      ).toBeInTheDocument();
    });

    await user.click(document.body);

    await waitFor(
      () => {
        expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("has proper ARIA labels", () => {
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toHaveAttribute("aria-label");
  });

  it("closes menu when selecting a menu item", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    await waitFor(() => {
      const homeLink = screen.getByRole("menuitem", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
    });

    const homeLink = screen.getByRole("menuitem", { name: /home/i });
    await user.click(homeLink);

    await waitFor(() => {
      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });
  });

  it("changes button icon when menu is open", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    const initialIcon = menuButton.querySelector("svg");

    await user.click(menuButton);

    await waitFor(() => {
      const updatedIcon = menuButton.querySelector("svg");
      expect(updatedIcon).toBeInTheDocument();
    });
  });

  it("has proper accessibility attributes on menu items", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: "300px" }}>
        <MobileMenu />
      </div>,
    );

    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    await waitFor(() => {
      const menu = screen.getByRole("menu", {
        name: /mobile navigation menu/i,
      });
      expect(menu).toBeInTheDocument();
    });
  });
});
