import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArticleIndex } from "../ArticleIndex";

describe("ArticleIndex Component", () => {
  const items = [
    { id: 1, title: "First Article" },
    { id: 2, title: "Second Article" },
  ];

  it("renders one entry per article", () => {
    render(<ArticleIndex items={items} openId={null} onSelect={jest.fn()} />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByText("First Article")).toBeInTheDocument();
    expect(screen.getByText("Second Article")).toBeInTheDocument();
  });

  it("marks the open article", () => {
    render(<ArticleIndex items={items} openId={2} onSelect={jest.fn()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toHaveAttribute("aria-current", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[0]).not.toHaveAttribute("aria-current");
  });

  it("calls onSelect when an entry is clicked", () => {
    const onSelect = jest.fn();
    render(<ArticleIndex items={items} openId={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("First Article"));

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("calls onSelect when an entry is activated with the keyboard", async () => {
    const onSelect = jest.fn();
    render(<ArticleIndex items={items} openId={null} onSelect={onSelect} />);

    screen.getAllByRole("button")[0].focus();
    await userEvent.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(
      <ArticleIndex items={[]} openId={null} onSelect={jest.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
