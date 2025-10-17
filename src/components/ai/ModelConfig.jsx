import React from "react";

/**
 * ModelConfig
 * Simple controls for model & temperature.
 */
export default function ModelConfig({ settings, setSettings }) {
  const update = (patch) => setSettings({ ...settings, ...patch });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="col-span-1">
        <label htmlFor="model" className="block text-sm font-medium">Model</label>
        <select
          id="model"
          value={settings?.model || "gpt-4o-mini"}
          onChange={(e) => update({ model: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-700"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>
      </div>

      <div className="col-span-1">
        <label htmlFor="temperature" className="block text-sm font-medium">Temperature</label>
        <input
          id="temperature"
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={settings?.temperature ?? 1}
          onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
          className="mt-2 w-full"
        />
        <div className="mt-1 text-xs text-gray-500">{settings?.temperature ?? 1}</div>
      </div>

      <div className="col-span-1">
        <label className="block text-sm font-medium">Actions</label>
        <button
          type="button"
          onClick={() => update({ model: "gpt-4o-mini", temperature: 1 })}
          className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}