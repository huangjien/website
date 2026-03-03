import { renderHook } from "@testing-library/react";
import { useIssues, useReadme, useLabels, useMember, fetcher } from "../useSWR";
import useSWR from "swr";

jest.mock("swr");

describe("useSWR hooks", () => {
  const mockData = { result: "test_data" };
  const mockError = new Error("Test error");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetcher", () => {
    it("should fetch JSON data", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
          headers: {
            get: (name) =>
              name === "content-type" ? "application/json" : null,
          },
        }),
      );

      const result = await fetcher("/api/test");
      expect(result).toEqual(mockData);
    });

    it("should fetch text data", async () => {
      const textData = "plain text response";
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(textData),
          headers: {
            get: () => "text/plain",
          },
        }),
      );

      const result = await fetcher("/api/test");
      expect(result).toBe(textData);
    });

    it("should handle HTTP errors", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          headers: { get: () => null },
        }),
      );

      await expect(fetcher("/api/test")).rejects.toThrow(
        "HTTP error! status: 500",
      );
    });

    it("should handle network errors", async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

      await expect(fetcher("/api/test")).rejects.toThrow("Network error");
    });
  });

  describe("useIssues", () => {
    it("should fetch issues with correct config", () => {
      useSWR.mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useIssues());

      expect(useSWR).toHaveBeenCalledWith("/api/issues", expect.any(Function), {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        shouldRetryOnError: true,
      });
      expect(result.current.issues).toEqual(mockData);
    });

    it("should return error state", () => {
      useSWR.mockReturnValue({
        data: null,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useIssues());

      expect(result.current.error).toEqual(mockError);
    });

    it("should return loading state", () => {
      useSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useIssues());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useReadme", () => {
    it("should fetch readme with correct config", () => {
      useSWR.mockReturnValue({
        data: "# README",
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useReadme());

      expect(useSWR).toHaveBeenCalledWith("/api/about", expect.any(Function), {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        shouldRetryOnError: true,
      });
      expect(result.current.readme).toBe("# README");
    });
  });

  describe("useLabels", () => {
    it("should fetch labels with correct config", () => {
      useSWR.mockReturnValue({
        data: ["label1", "label2"],
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useLabels());

      expect(useSWR).toHaveBeenCalledWith("/api/labels", expect.any(Function), {
        dedupingInterval: 300000,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      });
      expect(result.current.labels).toEqual(["label1", "label2"]);
    });
  });

  describe("useMember", () => {
    it("should fetch member status with correct config", () => {
      useSWR.mockReturnValue({
        data: { isMember: true },
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useMember());

      expect(useSWR).toHaveBeenCalledWith("/api/member", expect.any(Function), {
        dedupingInterval: 300000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      });
      expect(result.current.member).toEqual({ isMember: true });
    });
  });

  describe("mutate function", () => {
    it("should expose mutate function for manual revalidation", () => {
      const mockMutate = jest.fn();
      useSWR.mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useIssues());

      result.current.mutate();
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe("isValidating state", () => {
    it("should return validating state", () => {
      useSWR.mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        isValidating: true,
        mutate: jest.fn(),
      });

      const { result } = renderHook(() => useIssues());

      expect(result.current.isValidating).toBe(true);
    });
  });
});
