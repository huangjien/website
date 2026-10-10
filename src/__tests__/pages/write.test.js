import { render, screen } from "@testing-library/react";
import { signIn } from "next-auth/react";
import Write from "../../pages/write";
import { useAuthorCapability } from "../../lib/useAuthorCapability";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("../../lib/useAuthorCapability", () => ({
  useAuthorCapability: jest.fn(),
}));

jest.mock("../../components/BlogEditor", () => ({
  BlogEditor: () => <div data-testid='blog-editor'>Blog editor</div>,
}));

jest.mock("ahooks", () => ({ useTitle: jest.fn() }));

describe("Write page", () => {
  it("shows a loading state while checking ownership", () => {
    useAuthorCapability.mockReturnValue({ loading: true });
    render(<Write />);
    expect(screen.getByText("Preparing your studio…")).toBeInTheDocument();
  });

  it("asks an anonymous visitor to sign in", () => {
    useAuthorCapability.mockReturnValue({
      loading: false,
      authenticated: false,
      canPublish: false,
    });
    render(<Write />);
    screen.getByRole("button", { name: "Sign in to continue" }).click();
    expect(signIn).toHaveBeenCalledWith("github");
  });

  it("does not show the editor to another signed-in user", () => {
    useAuthorCapability.mockReturnValue({
      loading: false,
      authenticated: true,
      canPublish: false,
    });
    render(<Write />);
    expect(screen.getByText("This studio is private")).toBeInTheDocument();
    expect(screen.queryByTestId("blog-editor")).not.toBeInTheDocument();
  });

  it("shows the editor only to the owner", () => {
    useAuthorCapability.mockReturnValue({
      loading: false,
      authenticated: true,
      canPublish: true,
    });
    render(<Write />);
    expect(screen.getByTestId("blog-editor")).toBeInTheDocument();
  });
});
