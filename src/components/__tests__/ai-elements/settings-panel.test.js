import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPanel from "../../ai-elements/settings-panel.jsx";

function Host() {
  const [settings, setSettings] = useState({
    model: "gpt-4o-mini",
    temperature: 1,
    trackSpeed: 300,
    systemPrompt: "",
    ttsVoice: "alloy",
  });
  return <SettingsPanel settings={settings} setSettings={setSettings} />;
}

describe("SettingsPanel", () => {
  it("renders fields and updates model selection", () => {
    render(<Host />);
    // First select is model
    const selects = screen.getAllByRole("combobox");
    const selectModel = selects[0];
    expect(selectModel).toHaveValue("gpt-4o-mini");
    fireEvent.change(selectModel, { target: { value: "gpt-4o" } });
    expect(selectModel).toHaveValue("gpt-4o");
  });

  it("updates temperature via slider", () => {
    render(<Host />);
    const tempSlider = screen.getByRole("slider");
    fireEvent.change(tempSlider, { target: { value: "0.5" } });
    expect(tempSlider).toHaveValue("0.5");
  });

  it("updates system prompt and track speed", () => {
    render(<Host />);
    const sysPrompt = screen.getByPlaceholderText(/System prompt/i);
    fireEvent.change(sysPrompt, { target: { value: "You are helpful." } });
    expect(sysPrompt).toHaveValue("You are helpful.");

    const trackSpeed = screen.getByRole("spinbutton");
    fireEvent.change(trackSpeed, { target: { value: "350" } });
    expect(trackSpeed).toHaveValue(350);
  });

  it("updates tts voice selection", () => {
    render(<Host />);
    // Second select is voice
    const selects = screen.getAllByRole("combobox");
    const voiceSelect = selects[1];
    fireEvent.change(voiceSelect, { target: { value: "aria" } });
    expect(voiceSelect).toHaveValue("aria");
  });

  it("renders custom model list when models prop is provided", () => {
    const customModels = [
      {
        id: "gpt-4o-mini",
        label: "GPT-4o Mini",
        tier: "balanced",
        costLevel: "low",
      },
      {
        id: "gpt-4.1",
        label: "GPT-4.1",
        tier: "advanced",
        costLevel: "medium",
      },
    ];
    const setSettings = jest.fn();

    render(
      <SettingsPanel
        settings={{
          model: "gpt-4o-mini",
          temperature: 1,
          trackSpeed: 300,
          systemPrompt: "",
          ttsVoice: "alloy",
        }}
        setSettings={setSettings}
        models={customModels}
      />,
    );

    expect(
      screen.getByRole("option", { name: /GPT-4o Mini/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /GPT-4.1/ })).toBeInTheDocument();
  });
});
