import React from "react";
import { render } from "@testing-library/react";
import Skeleton from "../ui/skeleton";

describe("Skeleton", () => {
  it("renders default rectangle skeleton with defaults", () => {
    const { container } = render(<Skeleton data-testid='skeleton' />);
    const el = container.firstChild;

    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("rounded-md");
    expect(el).toHaveClass("w-full");
    expect(el).toHaveClass("h-20");
    expect(el).toHaveClass("animate-shimmer");
  });

  it("renders circle skeleton with default size", () => {
    const { container } = render(<Skeleton variant='circle' />);
    const el = container.firstChild;

    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("rounded-full");
    expect(el).toHaveClass("w-12");
    expect(el).toHaveClass("h-12");
  });

  it("renders text skeleton with the correct line count and last line width", () => {
    const { container } = render(<Skeleton variant='text' lines={4} />);
    const wrapper = container.firstChild;
    const lines = wrapper.querySelectorAll(":scope > div");

    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toHaveClass("w-full");
    expect(lines[1]).toHaveClass("w-full");
    expect(lines[2]).toHaveClass("w-full");
    expect(lines[3]).toHaveClass("w-3/4");
  });
});
