import { renderHook, act } from "@testing-library/react";
import { useAudioRecording } from "../../hooks/useAudioRecording";
import { error, warn } from "../../components/Notification";
import { transcribeAudio } from "../../lib/aiService";

// Mock dependencies
jest.mock("../../components/Notification", () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock("../../lib/aiService", () => ({
  transcribeAudio: jest.fn(),
}));

// Mock MediaRecorder
class MockMediaRecorder {
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.state = "inactive";
    this.ondataavailable = null;
    this.onstop = null;
    this.chunks = [];
    this._ref = null; // Reference to the mediaRecorder ref for testing
  }

  start() {
    this.state = "recording";
    // Simulate data available event
    setTimeout(() => {
      if (this.ondataavailable) {
        const mockData = new Blob(["mock audio data"], { type: "audio/mp3" });
        this.ondataavailable({ data: mockData });
      }
    }, 100);
  }

  stop() {
    this.state = "inactive";
    setTimeout(() => {
      if (this.onstop) {
        this.onstop();
        // Reset the ref to null after stopping to simulate real behavior
        if (this._ref) {
          this._ref.current = null;
        }
      }
    }, 100);
  }

  setRef(ref) {
    this._ref = ref;
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockTrack1 = { stop: jest.fn() };
const mockTrack2 = { stop: jest.fn() };
const mockStream = {
  getTracks: jest.fn(() => [mockTrack1, mockTrack2]),
};

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn(() => "blob:mock-audio-url");

// Mock Blob
class MockBlob {
  constructor(chunks, options) {
    this.chunks = chunks;
    this.options = options;
    this.size = chunks.length * 100; // Mock size
  }
}

describe("useAudioRecording Hook", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock console.warn
    jest.spyOn(console, "warn").mockImplementation();

    // Setup global mocks
    global.MediaRecorder = MockMediaRecorder;
    global.Blob = MockBlob;
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: jest.fn(),
    };

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
    });

    // Default successful getUserMedia mock
    mockGetUserMedia.mockResolvedValue(mockStream);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Reset track mocks
    mockTrack1.stop.mockClear();
    mockTrack2.stop.mockClear();
  });

  describe("Initial state", () => {
    it("should return initial values", () => {
      const { result } = renderHook(() => useAudioRecording());

      expect(result.current.audioSrc).toBe("");
      expect(result.current.isRecording).toBe(false);
      expect(typeof result.current.startRecording).toBe("function");
      expect(typeof result.current.stopRecording).toBe("function");
    });
  });

  describe("startRecording", () => {
    it("should start recording successfully", async () => {
      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
    });

    it("should handle getUserMedia not supported", async () => {
      // Mock navigator.mediaDevices as undefined
      Object.defineProperty(global.navigator, "mediaDevices", {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(warn).toHaveBeenCalledWith(
        "getUserMedia not supported on your browser!"
      );
    });

    it("should handle getUserMedia error", async () => {
      const mockError = new Error("Permission denied");
      mockGetUserMedia.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(error).toHaveBeenCalledWith(
        `The following getUserMedia error occurred: ${mockError}`
      );
    });

    it("should handle MediaRecorder ondataavailable with undefined data", async () => {
      // Create a custom MediaRecorder that simulates undefined data
      class CustomMockMediaRecorder extends MockMediaRecorder {
        start() {
          this.state = "recording";
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: undefined });
            }
          }, 100);
        }
      }

      global.MediaRecorder = CustomMockMediaRecorder;

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      // Should not throw error and handle gracefully
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    it("should handle MediaRecorder ondataavailable with zero size data", async () => {
      // Create a custom MediaRecorder that simulates zero size data
      class CustomMockMediaRecorder extends MockMediaRecorder {
        start() {
          this.state = "recording";
          setTimeout(() => {
            if (this.ondataavailable) {
              const mockData = { size: 0 };
              this.ondataavailable({ data: mockData });
            }
          }, 100);
        }
      }

      global.MediaRecorder = CustomMockMediaRecorder;

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      // Should not throw error and handle gracefully
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
  });

  describe("stopRecording", () => {
    it("should stop recording and transcribe audio successfully", async () => {
      const mockTranscription = "Hello, this is a test transcription";
      const mockCallback = jest.fn();
      transcribeAudio.mockResolvedValue(mockTranscription);

      const { result } = renderHook(() => useAudioRecording());

      // Start recording first
      await act(async () => {
        await result.current.startRecording();
      });

      // Stop recording
      await act(async () => {
        await result.current.stopRecording(mockCallback);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(transcribeAudio).toHaveBeenCalledWith(expect.any(MockBlob));
      expect(mockCallback).toHaveBeenCalledWith(mockTranscription);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(result.current.audioSrc).toBe("blob:mock-audio-url");
    });

    it("should handle stopRecording without MediaRecorder initialized", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.stopRecording();
      });

      expect(consoleSpy).toHaveBeenCalledWith("MediaRecorder not initialized");
      consoleSpy.mockRestore();
    });

    it("should handle transcription error", async () => {
      const mockError = new Error("Transcription failed");
      transcribeAudio.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAudioRecording());

      // Start recording first
      await act(async () => {
        await result.current.startRecording();
      });

      // Stop recording
      await act(async () => {
        await result.current.stopRecording();
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(error).toHaveBeenCalledWith(mockError.message);
    });

    it("should stop all stream tracks", async () => {
      const { result } = renderHook(() => useAudioRecording());

      // Start recording first
      await act(async () => {
        await result.current.startRecording();
      });

      // Stop recording
      await act(async () => {
        await result.current.stopRecording();
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(mockStream.getTracks).toHaveBeenCalled();
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });

    it("should work without onTranscriptionComplete callback", async () => {
      const mockTranscription = "Test transcription";
      transcribeAudio.mockResolvedValue(mockTranscription);

      const { result } = renderHook(() => useAudioRecording());

      // Start recording first
      await act(async () => {
        await result.current.startRecording();
      });

      // Stop recording without callback
      await act(async () => {
        await result.current.stopRecording();
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(transcribeAudio).toHaveBeenCalled();
      // Should not throw error when no callback provided
    });
  });

  describe("isRecording state", () => {
    it("should return false initially", () => {
      const { result } = renderHook(() => useAudioRecording());
      expect(result.current.isRecording).toBe(false);
    });

    it("should return true when MediaRecorder is initialized", async () => {
      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      // Note: The isRecording logic in the original code checks if mediaRecorder.current exists
      // After startRecording, it should be truthy
      expect(result.current.isRecording).toBe(true);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle multiple start recording calls", async () => {
      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
        await result.current.startRecording();
      });

      // Should handle gracefully without errors
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    it("should handle stop recording called multiple times", async () => {
      const { result } = renderHook(() => useAudioRecording());

      // Call stopRecording without starting first (should warn)
      await act(async () => {
        await result.current.stopRecording();
      });

      // Should handle gracefully and warn
      expect(console.warn).toHaveBeenCalledWith(
        "MediaRecorder not initialized"
      );

      // Call again to test multiple calls
      await act(async () => {
        await result.current.stopRecording();
      });

      // Should warn again
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it("should handle MediaRecorder constructor error", async () => {
      // Mock MediaRecorder to throw error
      global.MediaRecorder = jest.fn(() => {
        throw new Error("MediaRecorder not supported");
      });

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        try {
          await result.current.startRecording();
        } catch (err) {
          // Should handle error gracefully
          expect(err.message).toBe("MediaRecorder not supported");
        }
      });
    });

    it("should handle stream without tracks", async () => {
      const streamWithoutTracks = {
        getTracks: jest.fn(() => []),
      };

      mockGetUserMedia.mockResolvedValue(streamWithoutTracks);

      const { result } = renderHook(() => useAudioRecording());

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        await result.current.stopRecording();
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(streamWithoutTracks.getTracks).toHaveBeenCalled();
    });
  });

  describe("Integration tests", () => {
    it("should complete full recording cycle", async () => {
      const mockTranscription = "Complete recording test";
      const mockCallback = jest.fn();
      transcribeAudio.mockResolvedValue(mockTranscription);

      const { result } = renderHook(() => useAudioRecording());

      // Initial state
      expect(result.current.isRecording).toBe(false);
      expect(result.current.audioSrc).toBe("");

      // Start recording
      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);

      // Stop recording
      await act(async () => {
        await result.current.stopRecording(mockCallback);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(mockCallback).toHaveBeenCalledWith(mockTranscription);
      expect(result.current.audioSrc).toBe("blob:mock-audio-url");
      expect(transcribeAudio).toHaveBeenCalledWith(expect.any(MockBlob));
    });

    it("should handle rapid start/stop cycles", async () => {
      const { result } = renderHook(() => useAudioRecording());

      // Rapid start/stop cycles
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current.startRecording();
        });

        await act(async () => {
          await result.current.stopRecording();
        });
      }

      // Should handle without errors
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
  });
});
