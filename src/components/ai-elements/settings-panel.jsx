import React from "react";
import { useTranslation } from "react-i18next";
import { BiX } from "react-icons/bi";
import { getCuratedAiModels } from "../../config/ai-models";

export default function SettingsPanel({
  settings,
  setSettings,
  onClose,
  models = [],
}) {
  const { t } = useTranslation();
  const model = settings?.model || "gpt-4o-mini";
  const temperature = Number(settings?.temperature ?? 1);
  const trackSpeed = Number(settings?.trackSpeed ?? 300);
  const systemPrompt = settings?.systemPrompt || "";
  const ttsVoice = settings?.ttsVoice || "alloy";
  const modelOptions = models.length > 0 ? models : getCuratedAiModels();

  const update = (next) => setSettings?.((prev) => ({ ...prev, ...next }));

  return (
    <div className='w-full mb-4' data-testid='settings-panel'>
      <div className='glass-card rounded-3xl p-6 shadow-glass relative'>
        {/* Header with close button */}
        <div className='flex items-center justify-between mb-5'>
          <div>
            <h2 className='display text-lg font-medium text-foreground'>
              {t("ai.settings", { defaultValue: "Settings" })}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t("ai.settings_subtitle", {
                defaultValue: "Tune the model and voice for this conversation.",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className='shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:-translate-y-px hover:shadow-glass active:translate-y-0 transition-all duration-normal ease-out cursor-pointer'
            aria-label={t("global.close", { defaultValue: "Close" })}
            title={t("global.close", { defaultValue: "Close" })}
          >
            <BiX size={18} />
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Model — full width, primary control */}
          <div className='md:col-span-2'>
            <label
              htmlFor='ai-settings-model'
              className='block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'
            >
              {t("ai.select_model", { defaultValue: "Select AI model" })}
            </label>
            <select
              id='ai-settings-model'
              value={model}
              onChange={(e) => update({ model: e.target.value })}
              className='w-full rounded-xl bg-[hsl(var(--background))] glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus-visible:outline-none transition-shadow duration-normal cursor-pointer'
            >
              {modelOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {`${item.label || item.id} (${item.tier || "balanced"} · ${
                    item.costLevel || "medium"
                  } cost)`}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <div className='flex items-baseline justify-between mb-2'>
              <label
                htmlFor='ai-settings-temp'
                className='block text-xs font-medium uppercase tracking-wider text-muted-foreground'
              >
                {t("ai.temperature", { defaultValue: "Temperature" })}
              </label>
              <span className='text-sm font-medium text-foreground num-tabular'>
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              id='ai-settings-temp'
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
            <div className='text-xs text-muted-foreground/80 mt-1.5'>
              {t("ai.value_range_0_1", {
                defaultValue: "Lower is more focused; higher is more creative.",
              })}
            </div>
          </div>

          {/* Track speed */}
          <div>
            <div className='flex items-baseline justify-between mb-2'>
              <label
                htmlFor='ai-settings-speed'
                className='block text-xs font-medium uppercase tracking-wider text-muted-foreground'
              >
                {t("ai.track_speed", { defaultValue: "Stream cadence" })}
              </label>
              <span className='text-sm font-medium text-foreground num-tabular'>
                {trackSpeed}ms
              </span>
            </div>
            <input
              id='ai-settings-speed'
              type='number'
              min={50}
              max={500}
              step={50}
              value={trackSpeed}
              onChange={(e) =>
                update({ trackSpeed: parseInt(e.target.value, 10) })
              }
              className='w-full rounded-xl bg-[hsl(var(--background))] glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus-visible:outline-none transition-shadow duration-normal num-tabular'
            />
            <div className='text-xs text-muted-foreground/80 mt-1.5'>
              {t("ai.value_range_50_500", {
                defaultValue: "Milliseconds between streamed chunks.",
              })}
            </div>
          </div>

          {/* System prompt — full width */}
          <div className='md:col-span-2'>
            <label
              htmlFor='ai-settings-prompt'
              className='block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'
            >
              {t("ai.system_prompt", { defaultValue: "System prompt" })}
            </label>
            <textarea
              id='ai-settings-prompt'
              value={systemPrompt}
              rows={3}
              onChange={(e) => update({ systemPrompt: e.target.value })}
              className='w-full rounded-xl bg-[hsl(var(--background))] glass-input p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus-visible:outline-none transition-shadow duration-normal resize-y leading-relaxed'
              placeholder={t("ai.system_prompt_placeholder", {
                defaultValue: "Optionally steer the assistant…",
              })}
            />
          </div>

          {/* TTS voice */}
          <div className='md:col-span-2'>
            <label
              htmlFor='ai-settings-voice'
              className='block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2'
            >
              {t("ai.select_voice", { defaultValue: "Text-to-speech voice" })}
            </label>
            <select
              id='ai-settings-voice'
              value={ttsVoice}
              onChange={(e) => update({ ttsVoice: e.target.value })}
              className='w-full rounded-xl bg-[hsl(var(--background))] glass-input p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus-visible:outline-none transition-shadow duration-normal cursor-pointer'
            >
              <option value='alloy'>alloy</option>
              <option value='aria'>aria</option>
              <option value='verse'>verse</option>
            </select>
            <div className='text-xs text-muted-foreground/80 mt-1.5'>
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
