import { getAnswer, transcribeAudio } from "../../lib/aiService";

// Mock fetch globally
global.fetch = jest.fn();

// Mock File constructor
global.File = jest.fn((chunks, filename, options) => ({
  chunks,
  name: filename,
  type: options?.type || "application/octet-stream",
  size: chunks.reduce(
    (acc, chunk) => acc + (chunk.size || chunk.length || 0),
    0,
  ),
}));

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
  get: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
}));

describe("aiService", () => {
  beforeEach(() => {
    fetch.mockClear();
    File.mockClear();
    FormData.mockClear();
  });

  describe("getAnswer", () => {
    it("should make a successful API call with question only", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Test answer" } }],
        usage: { total_tokens: 100 },
      };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getAnswer("What is AI?");

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "What is AI?" }],
          temperature: 1,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should include lastAnswer when provided and under 1024 characters", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Follow-up answer" } }],
      };
      const lastAnswer = "Previous answer that is short";

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Follow-up question", lastAnswer);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "assistant", content: lastAnswer },
            { role: "user", content: "Follow-up question" },
          ],
          temperature: 1,
        }),
      });
    });

    it("should exclude lastAnswer when it exceeds 1024 characters", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };
      const longLastAnswer = "a".repeat(1025); // 1025 characters

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", longLastAnswer);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Question" }],
          temperature: 1,
        }),
      });
    });

    it("should exclude lastAnswer when it is null or undefined", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", null);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Question" }],
          temperature: 1,
        }),
      });
    });

    it("should use custom model and temperature when provided", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", null, "gpt-4", 0.5);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: "Question" }],
          temperature: 0.5,
        }),
      });
    });

    it("should handle fetch errors", async () => {
      const fetchError = new Error("Network error");
      fetch.mockRejectedValueOnce(fetchError);

      await expect(getAnswer("Question")).rejects.toThrow("Network error");
    });

    it("should handle JSON parsing errors", async () => {
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      await expect(getAnswer("Question")).rejects.toThrow("Invalid JSON");
    });

    it("should handle empty question", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("");

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "" }],
          temperature: 1,
        }),
      });
    });

    it("should exclude lastAnswer exactly at 1024 characters", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };
      const exactLengthAnswer = "a".repeat(1024); // Exactly 1024 characters

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", exactLengthAnswer);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Question" }],
          temperature: 1,
        }),
      });
    });

    it("should include lastAnswer just under 1024 characters", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };
      const justUnderLimitAnswer = "a".repeat(1023); // 1023 characters

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", justUnderLimitAnswer);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "assistant", content: justUnderLimitAnswer },
            { role: "user", content: "Question" },
          ],
          temperature: 1,
        }),
      });
    });
  });

  describe("transcribeAudio", () => {
    let mockFormData;

    beforeEach(() => {
      mockFormData = {
        append: jest.fn(),
      };
      FormData.mockImplementation(() => mockFormData);
    });

    it("should successfully transcribe audio", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });
      const mockResponse = { text: "Transcribed text" };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(File).toHaveBeenCalledWith([mockAudioBlob], "audio.mp3", {
        type: "audio/mp3",
      });
      expect(FormData).toHaveBeenCalled();
      expect(mockFormData.append).toHaveBeenCalledWith(
        "file",
        expect.any(Object),
      );
      expect(mockFormData.append).toHaveBeenCalledWith("model", "whisper-1");
      expect(fetch).toHaveBeenCalledWith("/api/transcribe", {
        method: "POST",
        body: mockFormData,
      });
      expect(result).toBe("Transcribed text");
    });

    it("should handle API errors with error response", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });
      const mockErrorResponse = {
        error: {
          message: "Transcription failed",
        },
      };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "Transcription failed",
      );
    });

    it("should handle fetch network errors", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });
      const fetchError = new Error("Network error");

      fetch.mockRejectedValueOnce(fetchError);

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "Network error",
      );
    });

    it("should handle JSON parsing errors", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "Invalid JSON",
      );
    });

    it("should handle empty audio blob", async () => {
      const mockAudioBlob = new Blob([], { type: "audio/mp3" });
      const mockResponse = { text: "" };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(File).toHaveBeenCalledWith([mockAudioBlob], "audio.mp3", {
        type: "audio/mp3",
      });
      expect(result).toBe("");
    });

    it("should handle response without text field", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });
      const mockResponse = {}; // No text field

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(result).toBeUndefined();
    });

    it("should handle different audio blob types", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/wav" });
      const mockResponse = { text: "Transcribed text" };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await transcribeAudio(mockAudioBlob);

      // Should still create file with mp3 extension and type
      expect(File).toHaveBeenCalledWith([mockAudioBlob], "audio.mp3", {
        type: "audio/mp3",
      });
    });

    it("should handle large audio blobs", async () => {
      const largeAudioData = new Array(1000000).fill("a").join(""); // Large audio data
      const mockAudioBlob = new Blob([largeAudioData], { type: "audio/mp3" });
      const mockResponse = { text: "Transcribed large audio" };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(result).toBe("Transcribed large audio");
    });

    it("should handle error response with nested error structure", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp3" });
      const mockErrorResponse = {
        error: {
          message: "Invalid audio format",
          type: "invalid_request_error",
          code: "invalid_file_format",
        },
      };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "Invalid audio format",
      );
    });
  });

  describe("Integration scenarios", () => {
    it("should handle concurrent getAnswer calls", async () => {
      const mockResponse1 = { choices: [{ message: { content: "Answer 1" } }] };
      const mockResponse2 = { choices: [{ message: { content: "Answer 2" } }] };

      fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValueOnce(mockResponse1),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValueOnce(mockResponse2),
        });

      const [result1, result2] = await Promise.all([
        getAnswer("Question 1"),
        getAnswer("Question 2"),
      ]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent transcribeAudio calls", async () => {
      const mockAudioBlob1 = new Blob(["audio 1"], { type: "audio/mp3" });
      const mockAudioBlob2 = new Blob(["audio 2"], { type: "audio/mp3" });
      const mockResponse1 = { text: "Transcription 1" };
      const mockResponse2 = { text: "Transcription 2" };

      fetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValueOnce(mockResponse1),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValueOnce(mockResponse2),
        });

      const [result1, result2] = await Promise.all([
        transcribeAudio(mockAudioBlob1),
        transcribeAudio(mockAudioBlob2),
      ]);

      expect(result1).toBe("Transcription 1");
      expect(result2).toBe("Transcription 2");
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle special characters in question", async () => {
      const specialQuestion = "What is 2+2? 🤔 & how about émojis?";
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer(specialQuestion);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: specialQuestion }],
          temperature: 1,
        }),
      });
    });

    it("should handle extreme temperature values", async () => {
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer("Question", null, "gpt-4o-mini", 2.0);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Question" }],
          temperature: 2.0,
        }),
      });
    });

    it("should handle very long questions", async () => {
      const longQuestion = "a".repeat(10000);
      const mockResponse = { choices: [{ message: { content: "Answer" } }] };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getAnswer(longQuestion);

      expect(fetch).toHaveBeenCalledWith("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: longQuestion }],
          temperature: 1,
        }),
      });
    });
  });
});
