import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AI from "../ai";
import { useTranslation } from "react-i18next";
import { useTitle } from "ahooks";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock ahooks
jest.mock("ahooks", () => ({
  useTitle: jest.fn(),
  useLocalStorageState: jest.fn(),
  useDebounceEffect: jest.fn(),
}));

import { useLocalStorageState } from "ahooks";

// Mock QuestionTabs component
jest.mock("../../components/QuestionTabs", () => ({
  QuestionTabs: ({ onQuestionSubmit, append }) => (
    <div
      data-testid='question-tabs'
      data-append={typeof append === "function" ? "true" : "false"}
    >
      <button
        onClick={() =>
          onQuestionSubmit({
            question: "Test question",
            answer: "Test answer",
            timestamp: Date.now(),
          })
        }
      >
        Submit Question
      </button>
    </div>
  ),
}));

// Mock IssueList component
jest.mock("../../components/IssueList", () => ({
  IssueList: ({ data, ComponentName }) => (
    <div data-testid='issue-list' data-component-name={ComponentName}>
      {data && Array.isArray(data) && data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} data-testid='issue-item'>
            <div data-testid='question'>{item?.question || ""}</div>
            <div data-testid='answer'>{item?.answer || ""}</div>
            <div data-testid='timestamp'>{item?.timestamp || ""}</div>
          </div>
        ))
      ) : (
        <div data-testid='no-data'>No data available</div>
      )}
    </div>
  ),
}));

// Mock @heroui/react components
jest.mock("@heroui/react", () => ({
  Card: ({ children, className }) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardBody: ({ children }) => <div data-testid='card-body'>{children}</div>,
  Divider: () => <div data-testid='divider' />,
}));

describe("AI Page Component", () => {
  const mockSetContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLocalStorageState.mockReturnValue([[], mockSetContent]);
  });

  it("should render main components", () => {
    render(<AI />);

    expect(screen.getByTestId("question-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("issue-list")).toBeInTheDocument();
  });

  it("should set page title using useTitle hook", () => {
    render(<AI />);

    expect(useTitle).toHaveBeenCalledWith("header.ai");
  });

  it("should load Q&A data from useLocalStorageState on mount", () => {
    const mockData = [
      {
        question: "What is AI?",
        answer: "Artificial Intelligence",
        timestamp: 1234567890,
      },
    ];
    useLocalStorageState.mockReturnValue([mockData, mockSetContent]);

    render(<AI />);

    expect(useLocalStorageState).toHaveBeenCalledWith("QandA", {
      defaultValue: [],
    });
    expect(screen.getByText("What is AI?")).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("should handle empty data state", () => {
    useLocalStorageState.mockReturnValue([[], mockSetContent]);

    render(<AI />);

    expect(screen.getByTestId("issue-list")).toBeInTheDocument();
    expect(screen.queryByTestId("issue-item")).not.toBeInTheDocument();
  });

  it("should render QuestionTabs component", () => {
    render(<AI />);
    expect(screen.getByTestId("question-tabs")).toBeInTheDocument();
  });

  it("should pass append function to QuestionTabs", () => {
    render(<AI />);
    const questionTabs = screen.getByTestId("question-tabs");
    expect(questionTabs).toHaveAttribute("data-append");
  });

  it("should pass data to IssueList component", () => {
    const mockData = [
      {
        question: "Test question",
        answer: "Test answer",
        timestamp: 1234567890,
      },
    ];
    useLocalStorageState.mockReturnValue([mockData, mockSetContent]);

    render(<AI />);

    const issueList = screen.getByTestId("issue-list");
    expect(issueList).toHaveAttribute("data-component-name", "Chat");
  });

  it("should render with correct CSS classes", () => {
    render(<AI />);

    const container = screen.getByTestId("ai-container");
    expect(container).toHaveClass(
      "min-h-max",
      "w-auto",
      "text-lg",
      "lg:gap-4",
      "lg:m-4"
    );
  });

  it("should handle null data gracefully", () => {
    useLocalStorageState.mockReturnValue([null, mockSetContent]);

    render(<AI />);

    expect(screen.getByTestId("issue-list")).toBeInTheDocument();
  });

  it("should handle undefined data gracefully", () => {
    useLocalStorageState.mockReturnValue([undefined, mockSetContent]);

    render(<AI />);

    expect(screen.getByTestId("issue-list")).toBeInTheDocument();
  });
});
