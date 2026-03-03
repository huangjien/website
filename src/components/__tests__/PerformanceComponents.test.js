import { render, screen, fireEvent } from "@testing-library/react";
import {
  IssueCard,
  CommentItem,
  ErrorDisplay,
  LoadingSkeleton,
  EmptyState,
} from "../PerformanceComponents";

describe("PerformanceComponents", () => {
  describe("IssueCard", () => {
    const mockIssue = {
      id: 1,
      title: "Test Issue",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      "labels.name": ["blog", "tech"],
    };

    it("should render issue card", () => {
      const handleClick = jest.fn();
      render(<IssueCard issue={mockIssue} onClick={handleClick} />);

      expect(screen.getByText("Test Issue")).toBeInTheDocument();
      expect(screen.getByText(/#1/)).toBeInTheDocument();
    });

    it("should call onClick when clicked", () => {
      const handleClick = jest.fn();
      render(<IssueCard issue={mockIssue} onClick={handleClick} />);

      const card = screen.getByText("Test Issue").closest("div");
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledWith(mockIssue);
    });

    it("should render labels", () => {
      const handleClick = jest.fn();
      render(<IssueCard issue={mockIssue} onClick={handleClick} />);

      expect(screen.getByText("blog")).toBeInTheDocument();
      expect(screen.getByText("tech")).toBeInTheDocument();
    });

    it("should not re-render if issue id and updated_at are same", () => {
      const handleClick = jest.fn();
      const { rerender } = render(
        <IssueCard issue={mockIssue} onClick={handleClick} />,
      );

      const sameIssue = { ...mockIssue, title: "Updated Title" };
      rerender(<IssueCard issue={sameIssue} onClick={handleClick} />);

      expect(screen.getByText("Test Issue")).toBeInTheDocument();
    });
  });

  describe("CommentItem", () => {
    const mockComment = {
      id: 1,
      body: "Test comment body",
      created_at: "2024-01-01T00:00:00Z",
      user: {
        login: "testuser",
        avatar_url: "https://example.com/avatar.png",
      },
    };

    it("should render comment", () => {
      render(<CommentItem comment={mockComment} />);

      expect(screen.getByText("Test comment body")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("should render avatar", () => {
      render(<CommentItem comment={mockComment} />);

      const avatar = document.querySelector("img");
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.png");
      expect(avatar).toHaveAttribute("alt", "testuser");
    });

    it("should format date correctly", () => {
      render(<CommentItem comment={mockComment} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it("should not re-render if comment id is same", () => {
      const { rerender } = render(<CommentItem comment={mockComment} />);

      const sameComment = { ...mockComment, body: "Updated body" };
      rerender(<CommentItem comment={sameComment} />);

      expect(screen.getByText("Test comment body")).toBeInTheDocument();
    });
  });

  describe("ErrorDisplay", () => {
    it("should render error message", () => {
      render(<ErrorDisplay message='Something went wrong' />);

      const messages = screen.getAllByText("Something went wrong");
      expect(messages).toHaveLength(2);
      expect(messages[0]).toBeInTheDocument();
    });

    it("should render retry button when onRetry provided", () => {
      const handleRetry = jest.fn();
      render(<ErrorDisplay message='Error' onRetry={handleRetry} />);

      const button = screen.getByText("Retry");
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleRetry).toHaveBeenCalled();
    });

    it("should not render retry button when onRetry not provided", () => {
      render(<ErrorDisplay message='Error' />);

      expect(screen.queryByText("Retry")).not.toBeInTheDocument();
    });
  });

  describe("LoadingSkeleton", () => {
    it("should render default count of skeletons", () => {
      render(<LoadingSkeleton />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(5);
    });

    it("should render custom count of skeletons", () => {
      render(<LoadingSkeleton count={10} />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(10);
    });
  });

  describe("EmptyState", () => {
    it("should render empty message", () => {
      render(<EmptyState message='No issues found' />);

      expect(screen.getByText("No issues found")).toBeInTheDocument();
      expect(screen.getByText("No data found")).toBeInTheDocument();
    });

    it("should render action button when provided", () => {
      const handleAction = jest.fn();
      render(
        <EmptyState
          message='No issues'
          actionText='Create Issue'
          onAction={handleAction}
        />,
      );

      const button = screen.getByText("Create Issue");
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleAction).toHaveBeenCalled();
    });

    it("should not render action button when not provided", () => {
      render(<EmptyState message='No issues' />);

      expect(screen.queryByText(/create/i)).not.toBeInTheDocument();
    });
  });
});
