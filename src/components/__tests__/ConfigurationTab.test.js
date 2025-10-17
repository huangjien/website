import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfigurationTab from "../ConfigurationTab";
import { useTranslation } from "react-i18next";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock useSettings hook
const mockGetSetting = jest.fn();
jest.mock("../../lib/useSettings", () => ({
  useSettings: () => ({
    getSetting: mockGetSetting,
  }),
}));

// Removed legacy @heroui/react component mocks. Tests now rely on actual shadcn-ui Input and Select components in src/components/ui/* which provide the same testIDs.
describe("ConfigurationTab Component", () => {
  const defaultProps = {
    model: "gpt-4.1-mini",
    setModel: jest.fn(),
    temperature: 0.7,
    setTemperature: jest.fn(),
    trackSpeed: 300,
    setTrackSpeed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSetting.mockReturnValue(null);
  });

  it("should render all configuration inputs", () => {
    render(<ConfigurationTab {...defaultProps} />);

    expect(screen.getByTestId("select-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("select-label")).toHaveTextContent(
      "ai.select_model"
    );
    expect(screen.getByTestId("select")).toBeInTheDocument();

    const inputs = screen.getAllByTestId("input-wrapper");
    expect(inputs).toHaveLength(2);

    const temperatureInput = screen.getByDisplayValue("0.7");
    expect(temperatureInput).toBeInTheDocument();
    expect(temperatureInput).toHaveAttribute("type", "number");
    expect(temperatureInput).toHaveAttribute("min", "0");
    expect(temperatureInput).toHaveAttribute("max", "2");
    expect(temperatureInput).toHaveAttribute("step", "0.1");

    const trackSpeedInput = screen.getByDisplayValue("300");
    expect(trackSpeedInput).toBeInTheDocument();
    expect(trackSpeedInput).toHaveAttribute("type", "number");
    expect(trackSpeedInput).toHaveAttribute("min", "50");
    expect(trackSpeedInput).toHaveAttribute("max", "500");
    expect(trackSpeedInput).toHaveAttribute("step", "10");
  });

  it("should display correct model options", () => {
    render(<ConfigurationTab {...defaultProps} />);

    const select = screen.getByTestId("select");
    const options = select.querySelectorAll("option");

    // Should have placeholder + 5 model options
    expect(options).toHaveLength(6);

    const modelLabels = ["GPT-4.1 Mini", "GPT-4.1", "o1-mini", "o1", "o3-mini"];
    modelLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("should show selected model correctly", () => {
    render(<ConfigurationTab {...defaultProps} />);

    const select = screen.getByTestId("select");
    expect(select.value).toBe("gpt-4.1-mini");
  });

  it("should call setModel when model selection changes", async () => {
    const user = userEvent.setup();
    const mockSetModel = jest.fn();

    render(<ConfigurationTab {...defaultProps} setModel={mockSetModel} />);

    const select = screen.getByTestId("select");
    await user.selectOptions(select, "gpt-4.1");

    expect(mockSetModel).toHaveBeenCalledWith("gpt-4.1");
  });

  it("should call setTemperature when temperature input changes", async () => {
    const mockSetTemperature = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTemperature={mockSetTemperature} />
    );

    const temperatureInput = screen.getByDisplayValue("0.7");

    // Simulate onChange event directly
    fireEvent.change(temperatureInput, { target: { value: "1.5" } });

    expect(mockSetTemperature).toHaveBeenCalledWith(1.5);
  });

  it("should call setTrackSpeed when track speed input changes", async () => {
    const mockSetTrackSpeed = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTrackSpeed={mockSetTrackSpeed} />
    );

    const trackSpeedInput = screen.getByDisplayValue("300");

    // Simulate onChange event directly
    fireEvent.change(trackSpeedInput, { target: { value: "400" } });

    expect(mockSetTrackSpeed).toHaveBeenCalledWith(400);
  });

  it("should handle invalid temperature input gracefully", async () => {
    const user = userEvent.setup();
    const mockSetTemperature = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTemperature={mockSetTemperature} />
    );

    const temperatureInput = screen.getByDisplayValue("0.7");
    await user.clear(temperatureInput);
    await user.type(temperatureInput, "invalid");

    expect(mockSetTemperature).toHaveBeenCalledWith(0);
  });

  it("should handle invalid track speed input gracefully", async () => {
    const user = userEvent.setup();
    const mockSetTrackSpeed = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTrackSpeed={mockSetTrackSpeed} />
    );

    const trackSpeedInput = screen.getByDisplayValue("300");
    await user.clear(trackSpeedInput);
    await user.type(trackSpeedInput, "invalid");

    expect(mockSetTrackSpeed).toHaveBeenCalledWith(300);
  });

  it("should display correct labels using translation keys", () => {
    render(<ConfigurationTab {...defaultProps} />);

    expect(screen.getByTestId("select-label")).toHaveTextContent(
      "ai.select_model"
    );
    const inputLabels = screen.getAllByTestId("input-label");
    expect(inputLabels[0]).toHaveTextContent("ai.temperature");
    expect(inputLabels[1]).toHaveTextContent("ai.track_speed");
  });

  it("should display correct placeholders using translation keys", () => {
    render(<ConfigurationTab {...defaultProps} />);

    // Check that placeholder option exists in select
    const selectElement = screen.getByTestId("select");
    expect(selectElement.querySelector("option[disabled]")).toHaveTextContent(
      "ai.select_model"
    );

    expect(
      screen.getByPlaceholderText("ai.value_range_0_1")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ai.value_range_50_500")
    ).toBeInTheDocument();
  });

  it("should apply correct CSS classes", () => {
    render(<ConfigurationTab {...defaultProps} />);

    const container = screen.getByTestId("select-wrapper").parentElement;
    expect(container).toHaveClass("flex", "flex-col", "gap-4");

    expect(screen.getByTestId("select-wrapper")).toHaveClass("max-w-xs");

    const inputWrappers = screen.getAllByTestId("input-wrapper");
    inputWrappers.forEach((wrapper) => {
      expect(wrapper).toHaveClass("max-w-xs");
    });
  });

  it("should handle edge case values correctly", () => {
    render(
      <ConfigurationTab {...defaultProps} temperature={0} trackSpeed={50} />
    );

    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  it("should handle maximum values correctly", () => {
    render(
      <ConfigurationTab {...defaultProps} temperature={2} trackSpeed={500} />
    );

    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
  });

  it("should handle decimal temperature values correctly", () => {
    render(<ConfigurationTab {...defaultProps} temperature={1.5} />);

    expect(screen.getByDisplayValue("1.5")).toBeInTheDocument();
  });

  it("should handle empty temperature input", async () => {
    const user = userEvent.setup();
    const mockSetTemperature = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTemperature={mockSetTemperature} />
    );

    const temperatureInput = screen.getByDisplayValue("0.7");
    await user.clear(temperatureInput);

    expect(mockSetTemperature).toHaveBeenCalledWith(0);
  });

  it("should handle empty track speed input", async () => {
    const user = userEvent.setup();
    const mockSetTrackSpeed = jest.fn();

    render(
      <ConfigurationTab {...defaultProps} setTrackSpeed={mockSetTrackSpeed} />
    );

    const trackSpeedInput = screen.getByDisplayValue("300");
    await user.clear(trackSpeedInput);

    expect(mockSetTrackSpeed).toHaveBeenCalledWith(300);
  });

  describe("useSettings integration", () => {
    it("should use models from settings when available as JSON string", () => {
      const customModels = [
        { key: "custom-model-1", label: "Custom Model 1" },
        { key: "custom-model-2", label: "Custom Model 2" },
      ];
      mockGetSetting.mockReturnValue(JSON.stringify(customModels));

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("Custom Model 1")).toBeInTheDocument();
      expect(screen.getByText("Custom Model 2")).toBeInTheDocument();
      expect(screen.queryByText("GPT-4.1 Mini")).not.toBeInTheDocument();
    });

    it("should use models from settings when available as parsed objects", () => {
      const customModels = [
        { key: "parsed-model-1", label: "Parsed Model 1" },
        { key: "parsed-model-2", label: "Parsed Model 2" },
      ];
      mockGetSetting.mockReturnValue(customModels);

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("Parsed Model 1")).toBeInTheDocument();
      expect(screen.getByText("Parsed Model 2")).toBeInTheDocument();
      expect(screen.queryByText("GPT-4.1 Mini")).not.toBeInTheDocument();
    });

    it("should fall back to default models when settings models are invalid JSON", () => {
      mockGetSetting.mockReturnValue("invalid json string");
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to parse models from settings:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should fall back to default models when settings models have invalid structure", () => {
      const invalidModels = [
        { key: "valid-model", label: "Valid Model" },
        { key: "invalid-model" }, // Missing label
        { label: "Another Invalid" }, // Missing key
      ];
      mockGetSetting.mockReturnValue(invalidModels);

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(screen.queryByText("Valid Model")).not.toBeInTheDocument();
    });

    it("should call getSetting with correct parameter", () => {
      render(<ConfigurationTab {...defaultProps} />);

      expect(mockGetSetting).toHaveBeenCalledWith("models");
    });

    it("should fall back to default models when getSetting returns null", () => {
      mockGetSetting.mockReturnValue(null);

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(screen.getByText("GPT-4.1")).toBeInTheDocument();
      expect(screen.getByText("o1-mini")).toBeInTheDocument();
      expect(screen.getByText("o1")).toBeInTheDocument();
      expect(screen.getByText("o3-mini")).toBeInTheDocument();
    });

    it("should fall back to default models when getSetting returns undefined", () => {
      mockGetSetting.mockReturnValue(undefined);

      render(<ConfigurationTab {...defaultProps} />);

      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(screen.getByText("GPT-4.1")).toBeInTheDocument();
      expect(screen.getByText("o1-mini")).toBeInTheDocument();
      expect(screen.getByText("o1")).toBeInTheDocument();
      expect(screen.getByText("o3-mini")).toBeInTheDocument();
    });

    it("should handle empty array from settings", () => {
      mockGetSetting.mockReturnValue([]);

      render(<ConfigurationTab {...defaultProps} />);

      // Should fall back to default models when empty array is provided
      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(screen.getByText("GPT-4.1")).toBeInTheDocument();
      expect(screen.getByText("o1-mini")).toBeInTheDocument();
      expect(screen.getByText("o1")).toBeInTheDocument();
      expect(screen.getByText("o3-mini")).toBeInTheDocument();
    });

    it("should handle non-array value from settings", () => {
      mockGetSetting.mockReturnValue("not an array");
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(<ConfigurationTab {...defaultProps} />);

      // Should fall back to default models when non-array value is provided
      expect(screen.getByText("GPT-4.1 Mini")).toBeInTheDocument();
      expect(screen.getByText("GPT-4.1")).toBeInTheDocument();
      expect(screen.getByText("o1-mini")).toBeInTheDocument();
      expect(screen.getByText("o1")).toBeInTheDocument();
      expect(screen.getByText("o3-mini")).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
