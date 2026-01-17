import { renderHook, waitFor } from "@testing-library/react";
import {
  useGithubContent,
  extractContentAccordingContentList,
} from "../useGithubContent";
import { useRequest, useLocalStorageState } from "ahooks";
import { getIssues, getReadme, getValueByPath } from "../Requests";
import { useSettings } from "../useSettings";

// Mock dependencies
jest.mock("ahooks", () => ({
  useRequest: jest.fn(),
  useLocalStorageState: jest.fn(),
}));

jest.mock("../Requests", () => ({
  getIssues: jest.fn(),
  getReadme: jest.fn(),
  getValueByPath: jest.fn(),
}));

jest.mock("../useSettings", () => ({
  useSettings: jest.fn(),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: jest.fn(),
  useState: jest.fn(),
}));

const { useEffect, useState } = require("react");

describe("useGithubContent", () => {
  const mockSetAbout = jest.fn();
  const mockSetIssues = jest.fn();
  const mockGetSetting = jest.fn();
  const mockSetRawData = jest.fn();
  const mockSetTags = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useLocalStorageState
    useLocalStorageState.mockImplementation((key) => {
      if (key === "about") {
        return [undefined, mockSetAbout];
      }
      if (key === "issues") {
        return [undefined, mockSetIssues];
      }
      return [undefined, jest.fn()];
    });

    // Mock useState
    let stateIndex = 0;
    useState.mockImplementation((initial) => {
      const states = [
        [true, jest.fn()], // mounted state - set to true to simulate component mounted
        [null, mockSetRawData], // rawData state
        [undefined, mockSetTags], // tags state
      ];
      return states[stateIndex++] || [initial, jest.fn()];
    });

    // Mock useSettings
    useSettings.mockReturnValue({
      getSetting: mockGetSetting,
    });

    // Mock useRequest
    useRequest.mockImplementation((fn, options) => {
      // Store the options for later use
      if (fn === getReadme) {
        // Simulate successful readme fetch
        setTimeout(() => {
          if (options?.onSuccess) {
            options.onSuccess("# About Content");
          }
        }, 0);
      }
      if (fn === getIssues) {
        // Simulate successful issues fetch
        setTimeout(() => {
          if (options?.onSuccess) {
            const mockIssues = JSON.stringify([
              {
                id: 1,
                title: "Test Issue 1",
                body: "Test body 1",
                labels: [{ name: "blog" }, { name: "tech" }],
              },
              {
                id: 2,
                title: "Test Issue 2",
                body: "Test body 2",
                labels: [{ name: "personal" }],
              },
            ]);
            options.onSuccess(mockIssues);
          }
        }, 0);
      }
      return {};
    });

    // Mock useEffect to execute immediately
    useEffect.mockImplementation((fn, deps) => {
      fn();
    });
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useGithubContent());

    expect(result.current.tags).toBeUndefined();
    expect(result.current.issues).toBeUndefined();
    expect(result.current.about).toBeUndefined();
  });

  it("should call useRequest for readme and issues", () => {
    renderHook(() => useGithubContent());

    expect(useRequest).toHaveBeenCalledWith(getReadme, {
      onSuccess: expect.any(Function),
    });

    expect(useRequest).toHaveBeenCalledWith(getIssues, {
      onSuccess: expect.any(Function),
      staleTime: 1000 * 60 * 60,
    });
  });

  it("should process raw data when settings are available", async () => {
    mockGetSetting.mockImplementation((key) => {
      if (key === "blog.labels") return "blog,tech";
      if (key === "blog.content") return "title,body,id";
      return null;
    });

    getValueByPath.mockImplementation((obj, path) => {
      return obj[path];
    });

    const mockRawData = [
      {
        id: 1,
        title: "Test Issue 1",
        body: "Test body 1",
        labels: [{ name: "blog" }, { name: "tech" }],
      },
      {
        id: 2,
        title: "Test Issue 2",
        body: "Test body 2",
        labels: [{ name: "personal" }],
      },
    ];

    // Mock useState calls in order: mounted, rawData, tags, issues
    let callCount = 0;
    useState.mockImplementation((initial) => {
      callCount++;
      if (callCount === 1) {
        return [true, jest.fn()]; // mounted state
      } else if (callCount === 2) {
        return [mockRawData, mockSetRawData]; // rawData state
      } else if (callCount === 3) {
        return [null, mockSetTags]; // tags state
      } else {
        return [null, mockSetIssues]; // issues state
      }
    });

    renderHook(() => useGithubContent());

    expect(mockSetTags).toHaveBeenCalledWith(["blog", "tech"]);
    expect(mockSetIssues).toHaveBeenCalled();
  });

  it("should not process data when blog.labels setting is missing", () => {
    mockGetSetting.mockImplementation((key) => {
      if (key === "blog.content") return "title,body,id";
      return null; // blog.labels is null
    });

    const mockRawData = [
      {
        id: 1,
        title: "Test Issue 1",
        labels: [{ name: "blog" }],
      },
    ];

    let callCount = 0;
    useState.mockImplementation((initial) => {
      callCount++;
      if (callCount === 1) {
        return [true, jest.fn()]; // mounted state
      } else if (callCount === 2) {
        return [mockRawData, mockSetRawData];
      } else if (callCount === 3) {
        return [null, mockSetTags];
      } else {
        return [null, mockSetIssues];
      }
    });

    renderHook(() => useGithubContent());

    expect(mockSetTags).not.toHaveBeenCalled();
    expect(mockSetIssues).not.toHaveBeenCalled();
  });

  it("should not process data when blog.content setting is missing", () => {
    mockGetSetting.mockImplementation((key) => {
      if (key === "blog.labels") return "blog,tech";
      return null; // blog.content is null
    });

    const mockRawData = [
      {
        id: 1,
        title: "Test Issue 1",
        labels: [{ name: "blog" }],
      },
    ];

    let callCount = 0;
    useState.mockImplementation((initial) => {
      callCount++;
      if (callCount === 1) {
        return [true, jest.fn()]; // mounted state
      } else if (callCount === 2) {
        return [mockRawData, mockSetRawData];
      } else if (callCount === 3) {
        return [null, mockSetTags];
      } else {
        return [null, mockSetIssues];
      }
    });

    renderHook(() => useGithubContent());

    expect(mockSetTags).not.toHaveBeenCalled();
    expect(mockSetIssues).not.toHaveBeenCalled();
  });

  it("should filter issues based on labels", () => {
    mockGetSetting.mockImplementation((key) => {
      if (key === "blog.labels") return "blog";
      if (key === "blog.content") return "title,id";
      return null;
    });

    getValueByPath.mockImplementation((obj, path) => obj[path]);

    const mockRawData = [
      {
        id: 1,
        title: "Blog Issue",
        labels: [{ name: "blog" }],
      },
      {
        id: 2,
        title: "Personal Issue",
        labels: [{ name: "personal" }],
      },
    ];

    let callCount = 0;
    useState.mockImplementation((initial) => {
      callCount++;
      if (callCount === 1) {
        return [true, jest.fn()]; // mounted state
      } else if (callCount === 2) {
        return [mockRawData, mockSetRawData];
      } else if (callCount === 3) {
        return [null, mockSetTags];
      } else {
        return [null, mockSetIssues];
      }
    });

    renderHook(() => useGithubContent());

    // Should only process the issue with 'blog' label
    const expectedResult = [
      {
        title: "Blog Issue",
        id: 1,
        "labels.name": ["blog"],
      },
    ];

    expect(mockSetIssues).toHaveBeenCalledWith(expectedResult);
  });
});

describe("extractContentAccordingContentList", () => {
  beforeEach(() => {
    getValueByPath.mockClear();
  });

  it("should extract content according to content list", () => {
    const contentList = ["title", "body", "id"];
    const originalContent = {
      id: 1,
      title: "Test Title",
      body: "Test Body",
      extra: "Extra Data",
    };

    getValueByPath.mockImplementation((obj, path) => obj[path]);

    const result = extractContentAccordingContentList(
      contentList,
      originalContent
    );

    expect(result).toEqual({
      title: "Test Title",
      body: "Test Body",
      id: 1,
    });

    expect(getValueByPath).toHaveBeenCalledTimes(3);
    expect(getValueByPath).toHaveBeenCalledWith(originalContent, "title");
    expect(getValueByPath).toHaveBeenCalledWith(originalContent, "body");
    expect(getValueByPath).toHaveBeenCalledWith(originalContent, "id");
  });

  it("should handle empty content list", () => {
    const contentList = [];
    const originalContent = { id: 1, title: "Test" };

    const result = extractContentAccordingContentList(
      contentList,
      originalContent
    );

    expect(result).toEqual({});
    expect(getValueByPath).not.toHaveBeenCalled();
  });

  it("should handle nested paths", () => {
    const contentList = ["user.name", "user.email"];
    const originalContent = {
      user: {
        name: "John Doe",
        email: "john@example.com",
      },
    };

    getValueByPath.mockImplementation((obj, path) => {
      if (path === "user.name") return "John Doe";
      if (path === "user.email") return "john@example.com";
      return undefined;
    });

    const result = extractContentAccordingContentList(
      contentList,
      originalContent
    );

    expect(result).toEqual({
      "user.name": "John Doe",
      "user.email": "john@example.com",
    });
  });
});
