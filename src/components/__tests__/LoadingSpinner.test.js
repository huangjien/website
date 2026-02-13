import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../ui/loading-spinner";

describe("LoadingSpinner", () => {
  it("renders default spin spinner with size and variant classes", () => {
    render(<LoadingSpinner size='lg' variant='current' />);
    const el = screen.getByLabelText("Loading");

    expect(el).toHaveClass("animate-spin-slow");
    expect(el).toHaveClass("border-solid");
    expect(el).toHaveClass("h-8", "w-8", "border-4");
    expect(el).toHaveClass("border-foreground", "border-t-transparent");
  });

  it("renders pulse spinner", () => {
    render(
      <LoadingSpinner animationType='pulse' size='sm' variant='secondary' />,
    );
    const el = screen.getByLabelText("Loading");

    expect(el).toHaveClass("animate-pulse-slow");
    expect(el).toHaveClass("h-4", "w-4");
    expect(el).toHaveClass("bg-secondary");
  });

  it("renders dots spinner with three dots and staggered delays", () => {
    const { container } = render(
      <LoadingSpinner animationType='dots' size='md' />,
    );
    const dots = container.querySelectorAll("span");

    expect(dots).toHaveLength(3);
    expect(dots[0].style.animationDelay).toBe("0ms");
    expect(dots[1].style.animationDelay).toBe("150ms");
    expect(dots[2].style.animationDelay).toBe("300ms");
  });
});
