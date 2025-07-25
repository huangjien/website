import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AI from "../../pages/ai";
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

// Create a mock function for QuestionTabs
const mockQuestionTabs = jest.fn();

// Mock QuestionTabs component
jest.mock("../../components/QuestionTabs", () => ({
  QuestionTabs: (props) => {
    mockQuestionTabs(props);
    return (
      <div
        data-testid='question-tabs'
        data-append={typeof props.append === "function" ? "true" : "false"}
      >
        <button
          onClick={() =>
            props.onQuestionSubmit &&
            props.onQuestionSubmit({
              question: "Test question",
              answer: "Test answer",
              timestamp: Date.now(),
            })
          }
        >
          Submit Question
        </button>
      </div>
    );
  },
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
  const mockUseDebounceEffect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestionTabs.mockClear();
    useLocalStorageState.mockReturnValue([[], mockSetContent]);
    // Reset the debounce effect mock
    require("ahooks").useDebounceEffect.mockImplementation(
      mockUseDebounceEffect
    );
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

    // Check for the main container element with proper classes
    const container = document.querySelector(".min-h-max.w-auto.text-lg");
    expect(container).toBeInTheDocument();
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

  describe("append function", () => {
    it("should initialize content with new Q&A when content is empty", () => {
      useLocalStorageState.mockReturnValue([null, mockSetContent]);

      render(<AI />);

      // Get the append function from QuestionTabs props
      const appendFunction = mockQuestionTabs.mock.calls[0][0].append;
      const newQandA = {
        question: "Test Q",
        answer: "Test A",
        timestamp: 123456,
      };

      appendFunction(newQandA);

      expect(mockSetContent).toHaveBeenCalledWith([newQandA]);
    });

    it("should prepend new Q&A to existing content", () => {
      const existingContent = [
        {
          question: "Existing question",
          answer: "Existing answer",
          timestamp: 1234567880,
        },
      ];

      useLocalStorageState.mockReturnValue([existingContent, mockSetContent]);

      render(<AI />);

      // Get the append function from QuestionTabs props
      const appendFunction = mockQuestionTabs.mock.calls[0][0].append;
      const newQandA = {
        question: "New Q",
        answer: "New A",
        timestamp: 222222,
      };

      appendFunction(newQandA);

      expect(mockSetContent).toHaveBeenCalledWith([
        newQandA,
        ...existingContent,
      ]);
    });

    it("should handle append when content is undefined", () => {
      useLocalStorageState.mockReturnValue([undefined, mockSetContent]);

      render(<AI />);

      // Get the append function from QuestionTabs props
      const appendFunction = mockQuestionTabs.mock.calls[0][0].append;
      const newQandA = {
        question: "Test Q",
        answer: "Test A",
        timestamp: 123456,
      };

      appendFunction(newQandA);

      expect(mockSetContent).toHaveBeenCalledWith([newQandA]);
    });

    it("should handle append when content is empty array", () => {
      useLocalStorageState.mockReturnValue([[], mockSetContent]);

      render(<AI />);

      // Get the append function from QuestionTabs props
      const appendFunction = mockQuestionTabs.mock.calls[0][0].append;
      const newQandA = {
        question: "Test Q",
        answer: "Test A",
        timestamp: 123456,
      };

      appendFunction(newQandA);

      expect(mockSetContent).toHaveBeenCalledWith([newQandA]);
    });
  });

  describe("debounce effect for cleanup", () => {
    beforeEach(() => {
      // Mock Date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T00:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should setup debounce effect with correct parameters", () => {
      const mockContent = new Array(500).fill(null).map((_, index) => ({
        question: `Question ${index}`,
        answer: `Answer ${index}`,
        timestamp: Math.floor(Date.now() / 1000) - index * 1000,
      }));

      useLocalStorageState.mockReturnValue([mockContent, mockSetContent]);

      render(<AI />);

      expect(mockUseDebounceEffect).toHaveBeenCalledWith(
        expect.any(Function),
        [mockContent],
        { wait: 200000 }
      );
    });

    it("should trigger cleanup when content exceeds 1000 items", () => {
      // Create content with more than 1000 items
      const mockContent = new Array(1001).fill(null).map((_, index) => {
        const timestamp = Math.floor(Date.now() / 1000) - index * 86400; // Each item 1 day older
        return {
          question: `Question ${index}`,
          answer: `Answer ${index}`,
          timestamp,
        };
      });

      useLocalStorageState.mockReturnValue([mockContent, mockSetContent]);

      // Capture the debounce effect callback
      let debounceCallback;
      mockUseDebounceEffect.mockImplementation((callback, deps, options) => {
        debounceCallback = callback;
        // Execute the callback immediately for testing
        callback();
      });

      render(<AI />);

      // Verify that setContent was called with filtered array
      expect(mockSetContent).toHaveBeenCalled();
      const filteredContent = mockSetContent.mock.calls[0][0];
      expect(filteredContent.length).toBeLessThan(mockContent.length);
    });

    it("should not trigger cleanup when content is under 1000 items", () => {
      const mockContent = new Array(500).fill(null).map((_, index) => ({
        question: `Question ${index}`,
        answer: `Answer ${index}`,
        timestamp: Math.floor(Date.now() / 1000) - index * 1000,
      }));

      useLocalStorageState.mockReturnValue([mockContent, mockSetContent]);

      mockUseDebounceEffect.mockImplementation((callback, deps, options) => {
        // Execute the callback immediately for testing
        callback();
      });

      render(<AI />);

      // setContent should not be called for cleanup since content < 1000
      expect(mockSetContent).not.toHaveBeenCalled();
    });

    it("should filter out items older than one month during cleanup", () => {
      const now = new Date("2024-01-15T00:00:00.000Z");
      const oneMonthAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
      const oneMonthTimestamp = Math.round(oneMonthAgo.getTime() / 1000);

      // Create content with items both newer and older than one month
      const mockContent = [
        // Recent items (should be kept)
        {
          question: "Recent question 1",
          answer: "Recent answer 1",
          timestamp: oneMonthTimestamp + 86400, // 1 day after cutoff
        },
        {
          question: "Recent question 2",
          answer: "Recent answer 2",
          timestamp: oneMonthTimestamp + 172800, // 2 days after cutoff
        },
        // Old items (should be filtered out)
        {
          question: "Old question 1",
          answer: "Old answer 1",
          timestamp: oneMonthTimestamp - 86400, // 1 day before cutoff
        },
        {
          question: "Old question 2",
          answer: "Old answer 2",
          timestamp: oneMonthTimestamp - 172800, // 2 days before cutoff
        },
      ];

      // Add more items to exceed 1000 threshold
      const additionalItems = new Array(1000).fill(null).map((_, index) => ({
        question: `Additional question ${index}`,
        answer: `Additional answer ${index}`,
        timestamp: oneMonthTimestamp + index * 100, // All recent
      }));

      const fullContent = [...mockContent, ...additionalItems];

      useLocalStorageState.mockReturnValue([fullContent, mockSetContent]);

      mockUseDebounceEffect.mockImplementation((callback, deps, options) => {
        // Execute the callback immediately for testing
        callback();
      });

      render(<AI />);

      expect(mockSetContent).toHaveBeenCalled();
      const filteredContent = mockSetContent.mock.calls[0][0];

      // Should only contain items newer than one month
      filteredContent.forEach((item) => {
        expect(item.timestamp).toBeGreaterThan(oneMonthTimestamp);
      });

      // Check how many items were actually filtered out
      const oldItemsCount = fullContent.filter(
        (item) => item.timestamp <= oneMonthTimestamp
      ).length;
      expect(filteredContent.length).toBe(fullContent.length - oldItemsCount);
    });
  });

  describe("component integration", () => {
    it("should pass correct props to IssueList component", () => {
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
      expect(screen.getByText("Test question")).toBeInTheDocument();
      expect(screen.getByText("Test answer")).toBeInTheDocument();
    });

    it("should handle large datasets efficiently", () => {
      const largeDataset = new Array(100).fill(null).map((_, index) => ({
        question: `Question ${index}`,
        answer: `Answer ${index}`,
        timestamp: 1234567890 + index,
      }));

      useLocalStorageState.mockReturnValue([largeDataset, mockSetContent]);

      render(<AI />);

      expect(screen.getByTestId("issue-list")).toBeInTheDocument();
      expect(screen.getAllByTestId("issue-item")).toHaveLength(100);
    });

    it("should maintain component structure with different data types", () => {
      const mixedData = [
        {
          question: "String question",
          answer: "String answer",
          timestamp: 1234567890,
        },
        {
          question: "",
          answer: "",
          timestamp: 0,
        },
        {
          question: null,
          answer: undefined,
          timestamp: null,
        },
      ];

      useLocalStorageState.mockReturnValue([mixedData, mockSetContent]);

      render(<AI />);

      expect(screen.getByTestId("issue-list")).toBeInTheDocument();
      expect(screen.getAllByTestId("issue-item")).toHaveLength(3);
    });
  });

  describe("accessibility and user experience", () => {
    it("should have proper test ids for accessibility testing", () => {
      render(<AI />);

      expect(screen.getByTestId("question-tabs")).toBeInTheDocument();
      expect(screen.getByTestId("issue-list")).toBeInTheDocument();
    });

    it("should maintain responsive design classes", () => {
      render(<AI />);

      const container = document.querySelector(".min-h-max.w-auto.text-lg");
      expect(container).toHaveClass("min-h-max");
      expect(container).toHaveClass("w-auto");
      expect(container).toHaveClass("text-lg");
      expect(container).toHaveClass("lg:gap-4");
      expect(container).toHaveClass("lg:m-4");
    });

    it("should handle rapid successive append operations", () => {
      useLocalStorageState.mockReturnValue([[], mockSetContent]);

      render(<AI />);

      // Get the append function from QuestionTabs props
      const appendFunction = mockQuestionTabs.mock.calls[0][0].append;

      // Simulate rapid successive calls
      const qandA1 = { question: "Q1", answer: "A1", timestamp: 1 };
      const qandA2 = { question: "Q2", answer: "A2", timestamp: 2 };
      const qandA3 = { question: "Q3", answer: "A3", timestamp: 3 };

      appendFunction(qandA1);
      appendFunction(qandA2);
      appendFunction(qandA3);

      expect(mockSetContent).toHaveBeenCalledTimes(3);
    });
  });
});
