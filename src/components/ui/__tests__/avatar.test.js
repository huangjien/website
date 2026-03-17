import React from "react";
import { render, screen } from "@testing-library/react";
import AvatarDefault, { Avatar, AvatarFallback, AvatarImage } from "../avatar";

jest.mock("@radix-ui/react-avatar", () => ({
  Root: ({ children, ...props }) => (
    <div data-testid='avatar-root' {...props}>
      {children}
    </div>
  ),
  Image: ({ src, alt, ...props }) => (
    <div data-testid='avatar-image' data-src={src} data-alt={alt} {...props} />
  ),
  Fallback: ({ children, ...props }) => (
    <div data-testid='avatar-fallback' {...props}>
      {children}
    </div>
  ),
}));

describe("avatar ui", () => {
  it("renders Avatar root with className", () => {
    render(<Avatar className='custom-avatar' />);
    const root = screen.getByTestId("avatar-root");
    expect(root).toHaveClass("inline-flex");
    expect(root).toHaveClass("custom-avatar");
  });

  it("renders AvatarImage with merged classes", () => {
    render(<AvatarImage src='/a.png' alt='a' className='img-extra' />);
    const image = screen.getByTestId("avatar-image");
    expect(image).toHaveClass("object-cover");
    expect(image).toHaveClass("img-extra");
    expect(image).toHaveAttribute("data-src", "/a.png");
  });

  it("renders AvatarFallback with provided children", () => {
    render(<AvatarFallback className='fb-extra'>AB</AvatarFallback>);
    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback).toHaveClass("items-center");
    expect(fallback).toHaveClass("fb-extra");
    expect(fallback).toHaveTextContent("AB");
  });

  it("default export renders image and inferred fallback initial", () => {
    render(<AvatarDefault src='/user.png' alt='alice' />);
    expect(screen.getByTestId("avatar-image")).toHaveAttribute(
      "data-src",
      "/user.png",
    );
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("A");
  });

  it("default export renders ? fallback when alt is missing", () => {
    render(<AvatarDefault />);
    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("?");
  });

  it("default export uses explicit fallback over alt initial", () => {
    render(<AvatarDefault alt='bob' fallback='ZZ' />);
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("ZZ");
  });

  it("default export prioritizes children override", () => {
    render(
      <AvatarDefault alt='charlie'>
        <span data-testid='custom-child'>custom</span>
      </AvatarDefault>,
    );
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
    expect(screen.queryByTestId("avatar-fallback")).not.toBeInTheDocument();
  });
});
