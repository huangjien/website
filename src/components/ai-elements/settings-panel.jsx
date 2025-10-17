import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPanel({ settings, setSettings }) {
  const { t } = useTranslation();
  const model = settings?.model || 'gpt-4o-mini';
  const temperature = Number(settings?.temperature ?? 1);
  const trackSpeed = Number(settings?.trackSpeed ?? 300);
  const systemPrompt = settings?.systemPrompt || '';

  const update = (next) => setSettings?.((prev) => ({ ...prev, ...next }));

  return (
    <div className="w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mb-4" data-testid="settings-panel">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-base font-semibold mb-3">{t('ai.settings', { defaultValue: 'Settings' })}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('ai.select_model', { defaultValue: 'Select AI model' })}</label>
            <select
              value={model}
              onChange={(e) => update({ model: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-sm"
            >
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ai.temperature', { defaultValue: 'Softmax Temperature' })}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-neutral-500 mt-1">
              {t('ai.value_range_0_1', { defaultValue: 'The value must between 0 and 1' })} — {temperature.toFixed(1)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ai.system_prompt', { defaultValue: 'System prompt' })}</label>
            <textarea
              value={systemPrompt}
              rows={3}
              onChange={(e) => update({ systemPrompt: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-sm"
              placeholder={t('ai.system_prompt', { defaultValue: 'System prompt' })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ai.track_speed', { defaultValue: 'Track Speed' })}</label>
            <input
              type="number"
              min={50}
              max={500}
              step={50}
              value={trackSpeed}
              onChange={(e) => update({ trackSpeed: parseInt(e.target.value, 10) })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-sm"
            />
            <div className="text-xs text-neutral-500 mt-1">
              {t('ai.value_range_50_500', { defaultValue: 'The value must between 50 and 500' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}