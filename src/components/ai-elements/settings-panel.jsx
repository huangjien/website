import React from "react";
import { useTranslation } from "react-i18next";

export default function SettingsPanel({ settings, setSettings }) {
  const { t } = useTranslation();
  const model = settings?.model || "gpt-4o-mini";
  const temperature = Number(settings?.temperature ?? 1);
  const trackSpeed = Number(settings?.trackSpeed ?? 300);
  const systemPrompt = settings?.systemPrompt || "";
  const ttsVoice = settings?.ttsVoice || "alloy";

  const update = (next) => setSettings?.((prev) => ({ ...prev, ...next }));

  return (
    <div className='w-full mb-4' data-testid='settings-panel'>
      <div className='glass-card rounded-2xl p-5'>
        <h2 className='text-base font-semibold mb-4 text-foreground'>
          {t("ai.settings", { defaultValue: "Settings" })}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-foreground'>
              {t("ai.select_model", { defaultValue: "Select AI model" })}
            </label>
            <select
              value={model}
              onChange={(e) => update({ model: e.target.value })}
              className='w-full rounded-xl glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-fast cursor-pointer'
            >
              <option value='gpt-4o-mini'>gpt-4o-mini</option>
              <option value='gpt-4o'>gpt-4o</option>
              <option value='gpt-4.1-mini'>gpt-4.1-mini</option>
              <option value='gpt-4.1'>gpt-4.1</option>
              <option value='o3-mini'>o3-mini</option>
              <option value='o1-mini'>o1-mini</option>
              <option value='o1'>o1</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-foreground'>
              {t("ai.temperature", { defaultValue: "Softmax Temperature" })}
            </label>
            <input
              type='range'
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) =>
                update({ temperature: parseFloat(e.target.value) })
              }
              className='w-full accent-primary cursor-pointer'
            />
            <div className='text-xs text-muted-foreground mt-1.5'>
              {t("ai.value_range_0_1", {
                defaultValue: "The value must between 0 and 1",
              })}{" "}
              — {temperature.toFixed(1)}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-foreground'>
              {t("ai.system_prompt", { defaultValue: "System prompt" })}
            </label>
            <textarea
              value={systemPrompt}
              rows={3}
              onChange={(e) => update({ systemPrompt: e.target.value })}
              className='w-full rounded-xl glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-fast resize-none'
              placeholder={t("ai.system_prompt", {
                defaultValue: "System prompt",
              })}
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-foreground'>
              {t("ai.track_speed", { defaultValue: "Track Speed" })}
            </label>
            <input
              type='number'
              min={50}
              max={500}
              step={50}
              value={trackSpeed}
              onChange={(e) =>
                update({ trackSpeed: parseInt(e.target.value, 10) })
              }
              className='w-full rounded-xl glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-fast'
            />
            <div className='text-xs text-muted-foreground mt-1.5'>
              {t("ai.value_range_50_500", {
                defaultValue: "The value must between 50 and 500",
              })}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-foreground'>
              {t("ai.select_voice", { defaultValue: "Select TTS voice" })}
            </label>
            <select
              value={ttsVoice}
              onChange={(e) => update({ ttsVoice: e.target.value })}
              className='w-full rounded-xl glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-fast cursor-pointer'
            >
              <option value='alloy'>alloy</option>
              <option value='aria'>aria</option>
              <option value='verse'>verse</option>
            </select>
            <div className='text-xs text-muted-foreground mt-1.5'>
              {t("ai.voice_note", {
                defaultValue: "Voice applies to text-to-speech playback only.",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
